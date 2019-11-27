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
      
    constructor(private readonly storage: StorageService) {
        SerialPort.list().then((ports: any[]) => {
            console.log('Available serial ports: ' + ports.map((port: any) => port.path || '').join(', '))
            const path = ports[ports.length].path

            this.port = new SerialPort(path, {baudRate: 115200}, (err: any) => {
                if (err) {
                  console.warn('Error: ', err.message)
                }
              })
            this.port.on("readable", () =>{
                this.receivedParts.push(this.port.read().toString())
                this.checkReceivedData()
            })
        })
    }

    checkReceivedData(){
        const data = this.receivedParts.join('').replace('\r', '')
        const lines = data.split("\n")
        while(lines.length > 1){
            this.parseDataLine(lines.shift())
        }
        this.receivedParts = [...lines]
    }

    parseDataLine(line:string){
        line = line.trim().toUpperCase()
        if(line === 'OK') {
            console.log(`Arduino: OK`)
            this.commandQ.shift()
            setTimeout(() => this.sendNextCommand(), settings.robot.timeoutAfterEveryCommandMs)
        }
        else if (!line.startsWith('FPS ')) console.log('Arduino: ' + line)
    }

    applyTurn(turn: Move[]) {
        for(let move of turn){
            this.createMoveCommand(move.fromRow, move.fromCol, move.toCol, move.toRow)  
        }
    }

    async deletePiece(row: number, col: number): Promise<boolean> {
        const startPosition = row + "_" + col
        await this.queueSavedCommand(startPosition)
        await this.lowerAndPickup()
        await this.goHome()
        await this.lowerAndDrop()
        await this.goHome()
        
        return Promise.resolve(true)
    }

    async createMoveCommand(fromRow: number, fromCol: number, toRow: number, toCol: number): Promise<boolean> {
        const startPosition: string = fromRow + "_" + fromCol
        await this.queueSavedCommand(startPosition)
        await this.lowerAndPickup()
        if (settings.robot.goHomeAfterEveryMove) await this.goHome()

        const endPosition: string = toRow + "_" + toCol
        await this.queueSavedCommand(endPosition)
        await this.lowerAndDrop()
        await this.goHome()
        
        return Promise.resolve(true)
    }

    async lowerAndPickup(): Promise<boolean> {
        await this.setLinearActuator(true)
        await this.setMagnet(true)
        await this.setLinearActuator(false)

        return Promise.resolve(true)
    }

    async lowerAndDrop(): Promise<boolean> {
        await this.setLinearActuator(true)
        await this.setMagnet(false)
        await this.setLinearActuator(false)

        return Promise.resolve(true)
    }

    async setMagnet(enabled: boolean): Promise<boolean> {
        if (enabled) await this.queueSavedCommand("enableMagnet")
        else await this.queueSavedCommand("disableMagnet")

        return Promise.resolve(true)
    }

    async goHome(): Promise<boolean> {
        await this.queueSavedCommand("home")

        return Promise.resolve(true)
    }

    async setLinearActuator(doLower: boolean): Promise<boolean> {
        if (doLower) await this.queueSavedCommand("lowerLinAct")
        else await this.queueSavedCommand("raiseLinAct")

        return Promise.resolve(true)
    }

    setSavedCommand(name: string, command: string): void {
        this.storage.set(storagePrefix + name, command)
    }

    unsetSavedCommand(name: string): void {
        this.storage.delete(storagePrefix + name)
    }

    async queueSavedCommand(name: string): Promise<boolean> {
        // console.log(`Planning to queue ${storagePrefix + name}`)
        return this.storage.get(storagePrefix + name).then((command: string) => {
            // console.log(`Command = ${command}`)
            if (!command) return false
            else {
                console.log(`Queue: ${name}=${command}`)
                this.queueCommand(command)
                return true
            } 
        })
    }

    queueCommand(command: string){
        this.commandQ.push(command)

        // If this was the first command that was added we can immediately send it
        if (this.commandQ.length == 1){
            this.sendNextCommand()
        }
    }

    getSavedCommands(): Promise<string[]> {
        return this.storage.keys().then(async (keys: string[]) => {
            const filteredKeys = keys.filter((key: string) => key.startsWith(storagePrefix))
            const values = await Promise.all(filteredKeys.map((key: string) => this.storage.get(key)))

            return filteredKeys.map((key: string, i: number) => {
                const actualKey = key.substr(storagePrefix.length)
                const spacer = actualKey.length < 4 ? "\t\t" : "\t" 
                return actualKey + spacer + values[i]
            })
        })
    }

    sendDirectCommand(command: string){
        console.log(`Server: ${command}`)

        if(this.port == null || this.port == undefined) {
            console.log("No valid Serial")
            return
        } 

        return this.port.write(command + '\n', (err: any) => {
            if (err) {
                console.warn('Error on writing to serial port: ', err.message)
                return false
            }
            
            return true
        })
    }

    sendNextCommand(): boolean {
        if(this.commandQ.length < 1) return
        const command = this.commandQ[0]
        this.sendDirectCommand(command)
    }

}
