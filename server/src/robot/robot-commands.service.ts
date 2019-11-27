import { settings } from "../settings"
import { Injectable } from '@nestjs/common'
import * as SerialPort from 'serialport'
import { Move } from '../board/board.service'
import { StorageService } from '../storage.service'

const storagePrefix = '/arm/commands/'

@Injectable()
export class RobotCommandsService {

    port: any = null
    commandQ: string[] = []
    receivedParts: string[] = []

    portId: number = 2

      
    constructor(private readonly storage: StorageService) {
        SerialPort.list().then((ports: any[]) => {
            console.log('Available serial ports: ' + ports.map((port: any) => port.path || '').join(', '))
            const path = ports[this.portId].path

            this.port = new SerialPort(path, {baudRate: 115200}, (err: any) => {
                if (err) {
                  console.warn('Error: ', err.message)
                }
              })
            this.port.on("readable", () =>{
                this.receivedParts.push(this.port.read().toString())
                this.checkReceivedData()
            });
        })
    }

    checkReceivedData(){
        const data = this.receivedParts.join('').replace('\r', '');
        const lines = data.split("\n")
        while(lines.length > 1){
            this.parseDataLine(lines.shift())
        }
        this.receivedParts = [...lines]
    }

    parseDataLine(line:string){
        line = line.trim().toUpperCase()
        if(line === 'OK') {
            this.commandQ.shift();
            this.sendNextCommand()
            console.log(`Arduino: OK`)
        }
        else console.log('Arduino: ' + line)
    }

    applyTurn(turn: Move[]) {
        for(let move of turn){
            this.createMoveCommand(move.fromRow, move.fromCol, move.toCol, move.toRow);  
        }
    }

    deletePiece(row: number, col:number){
        const startPosition = row + "_" + col;
        this.queueSavedCommand(startPosition);
        this.lowerAndPickup();
        this.goHome();
        this.lowerAndDrop();
        this.goHome();
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
            this.sendNextCommand();
        }
    }

    getSavedCommands(): Promise<string[]> {
        return this.storage.keys().then(async (keys: string[]) => {
            const filteredKeys = keys.filter((key: string) => key.startsWith(storagePrefix))
            const values = await Promise.all(filteredKeys.map((key: string) => this.storage.get(key)))

            return filteredKeys.map((key: string, i: number) => {
                const actualKey = key.substr(storagePrefix.length)
                const spacer = actualKey.length < 4 ? "\t\t" : "\t"; 
                return actualKey + spacer + values[i]
            })
        })
    }

    sendNextCommand(): boolean {
        if(this.commandQ.length < 1) return
        const command = this.commandQ[this.commandQ.length - 1]
        console.log(`Server: ${command}`)

        return this.port.write(command + '\n', (err: any) => {
            if (err) {
                console.warn('Error on writing to serial port: ', err.message)
                return false
            }
            
            return true
        })
    }

}
