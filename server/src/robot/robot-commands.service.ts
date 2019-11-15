import { Injectable } from '@nestjs/common'
import * as SerialPort from 'serialport'
import { Move } from '../board/board.service'

@Injectable()
export class RobotCommandsService {

    port: any = null
      
    constructor() {
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
        this.sendCommand('move:(${source.fromRow}, ${source.fromCol})->(${target.toRow}, ${target.toCol})')
    }

    private sendCommand(command: string): boolean {
        return this.port.write(command, (err: any) => {
            if (err) {
                console.warn('Error on writing to serial port: ', err.message)
                return false
            }
            
            return true
        })       
    }

}
