import { Injectable } from '@nestjs/common'
import * as SerialPort from 'serialport'
import { Move } from '../board/board.service'
import { StorageService } from '../storage.service'

const storagePrefix = '/arm/commands/'

@Injectable()
export class RobotCommandsService {

    port: any = null
      
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

        // TODO: move the piece in (fromRow, fromCol) of source to (toRow, toCol) of target
        this.sendCommand('move:(${source.fromRow},${source.fromCol})->(${target.toRow},${target.toCol})')
    }

    setSavedCommand(name: string, command: string): void {
        this.storage.set(storagePrefix + name, command)
    }

    unsetSavedCommand(name: string): void {
        this.storage.delete(storagePrefix + name)
    }

    sendSavedCommand(name: string): Promise<boolean> {
        return this.storage.get(storagePrefix + name).then((command: string) => {
            if (!command) return false
            else return this.sendCommand(command)
        })
    }

    getSavedCommands(): Promise<string[]> {
        return this.storage.keys().then((keys: string[]) => {
            return keys
                .filter((key: string) => key.startsWith(storagePrefix))
                .map((key: string) => key.substr(storagePrefix.length))
        })
    }

    sendCommand(command: string): boolean {
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
