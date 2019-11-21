import { settings } from "../settings"
import { Injectable } from '@nestjs/common'
import * as SerialPort from 'serialport'
import { Move } from '../board/board.service'
import { StorageService } from '../storage.service'

const storagePrefix = '/arm/commands/'

@Injectable()
export class RobotCommandsService {

    port: any = null
    commandQ: string[] = [];
      
    constructor(private readonly storage: StorageService) {
        SerialPort.list().then((ports: any[]) => {
            console.log('Available serial ports: ' + ports.map((port: any) => port.path || '').join(', '))
            const path = ports[0].path

            this.port = new SerialPort(path, (err: any) => {
                if (err) {
                  console.warn('Error: ', err.message)
                }
              })
        })
    }

    applyTurn(turn: Move[]) {
        const source = turn[0]
        const target = turn[turn.length - 1]
        console.log(`Robot: Move (${source.fromRow}, ${source.fromCol}) to (${target.toRow}, ${target.toCol}).`)

        this.createMoveCommand(source.fromRow, source.fromCol, target.toCol, target.toRow);
    }

    createMoveCommand(fromRow: number, fromCol: number, toRow: number, toCol: number):void{
        const startPosition: string = fromCol + "_" + fromRow
        this.queueSavedCommand(startPosition)
        this.lowerAndPickup()
        if(settings.robot.goHomeAfterEveryMove) this.goHome();
        const endPosition: string = toRow + "_" + toCol
        this.queueSavedCommand(endPosition);
        this.lowerAndDrop();
        this.goHome();
    }

    lowerAndPickup(): void{
        this.setLinearActuator(true)
        this.setMagnet(true)
        this.setLinearActuator(false)
    }

    lowerAndDrop():void {
        this.setLinearActuator(true)
        this.setMagnet(false)
        this.setLinearActuator(false)
    }

    setMagnet(enabled: boolean):void {
        if(enabled) this.queueSavedCommand("enableMagnet")
        else this.queueSavedCommand("disableMagnet")
    }

    goHome(): void{
        this.queueSavedCommand("home")
    }

    setLinearActuator(doLower: boolean){
        if(doLower) this.queueSavedCommand("lowerLinAct")
        else this.queueSavedCommand("raiseLinAct")
    }

    setSavedCommand(name: string, command: string): void {
        this.storage.set(storagePrefix + name, command)
    }

    unsetSavedCommand(name: string): void {
        this.storage.delete(storagePrefix + name)
    }

    queueSavedCommand(name: string): Promise<boolean> {
        return this.storage.get(storagePrefix + name).then((command: string) => {
            if (!command) return false
            else {
                this.queueCommand(command)
                return true
            } 
        })
    }

    queueCommand(command: string){
        this.commandQ.push(command)
        //If this was the first command that was added we can immediately send it
        if(this.commandQ.length == 1){
            sendNextCommand();
        }
    }

    getSavedCommands(): Promise<string[]> {
        return this.storage.keys().then((keys: string[]) => {
            return keys
                .filter((key: string) => key.startsWith(storagePrefix))
                .map((key: string) => key.substr(storagePrefix.length))
        })
    }

    sendNextCommand(): boolean {
        const command = this.commandQ.shift();
        console.log(`Robot Command: ${command}`)
        return this.port.write(command + '\n', (err: any) => {
            if (err) {
                console.warn('Error on writing to serial port: ', err.message)
                return false
            }
            
            return true
        })       
    }

}
