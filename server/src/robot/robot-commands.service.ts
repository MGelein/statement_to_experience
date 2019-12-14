import { settings } from "../settings"
import { Injectable } from '@nestjs/common'
import * as SerialPort from 'serialport'
import { Move, BoardService } from '../board/board.service'
import { StorageService } from '../storage.service'
import { GameStateService } from "../game/game-state.service"
import { MonitoringService } from "../misc/monitoring.service"

const storagePrefix = '/arm/commands/'

const sleep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

@Injectable()
export class RobotCommandsService {

    port: any = null
    commandQueue: string[] = []
    receivedParts: string[] = []

    isMoving: boolean = false

    debugLogging: boolean = true
      
    constructor(
        private readonly storage: StorageService,
        private readonly boardService: BoardService,
        private readonly gameStateService: GameStateService,
        private readonly monitoringService: MonitoringService) {
            SerialPort.list().then((data: any) => console.log(`Serial ports: ${data.map((port: any) => port.path).join(', ')}`))
        this.openConnection()
    }

    async openConnection() {
        const serialPortPath: string = '/dev/tty.wchusbserial1420'

        this.port = new SerialPort(serialPortPath, {baudRate: 9600}, async (err: any) => {
            if (err) {
                console.warn('Serial: ', err.message)
                await sleep(1000)
                this.openConnection()
            } else {
                console.log(`Serial: connection to ${serialPortPath} established`)
                this.monitoringService.setStatus('serial', true)
                this.bindPort()
                this.sendSavedTrim()
            }
        })
    }

    bindPort() {
        this.port.on("readable", () =>{
            this.receivedParts.push(this.port.read().toString())
            this.checkReceivedData()
        })

        this.port.on('error', (err: any) => {
            console.log('Serial: ', err.message)
        })

        this.port.on('close', () => {
            this.monitoringService.setStatus('serial', false)
            console.log('Serial: Connection closed, retrying connection...')
            this.openConnection()
        })
    }

    checkReceivedData() {
        const data = this.receivedParts.join('').replace('\r', '')
        const lines = data.split("\n")
        while(lines.length > 1){
            this.parseDataLine(lines.shift())
        }
        this.receivedParts = [...lines]
    }

    parseDataLine(line: string) {
        line = line.trim().toUpperCase()
        if (line === 'OK') {
            if (this.debugLogging) console.log(`Arduino: OK`)
            this.commandQueue.shift()

            if (this.commandQueue.length === 0) {
                this.isMoving = false
            } else {
                setTimeout(() => this.sendNextCommand(), settings.robot.timeoutAfterEveryCommandMs)
            }
        } else if (line === 'RESIGN') {
            console.log('Arduino: RESIGN')
            if (this.gameStateService.state.startedAt) {
                this.gameStateService.resign()
                this.boardService.restart()
                console.log('Arduino: Restart the game.')
            }
        } // !line.startsWith('FPS ') && 
        else if (this.debugLogging) console.log('Arduino: ' + line)
    }

    async applyTurn(turn: Move[]): Promise<boolean> {
        let board = this.boardService.get()

        await this.sendSavedTrim()

        // Pick up the piece
        const startPosition: string = turn[0].fromRow + "_" + turn[0].fromCol
        await this.queueSavedCommand(startPosition)
        await this.lowerAndPickup(turn[0].fromRow, turn[0].fromCol)

        // Move inbetween
        let inbetweenPieces: any[] = []
        let crossedLastRow: boolean = false
        for (let move of turn) {
            if (settings.robot.goHomeAfterEveryMove) await this.goHome()

            const startPosition: string = move.toRow + "_" + move.toCol
            await this.queueSavedCommand(startPosition)

            if (turn.indexOf(move) !== turn.length -1) {
                await this.setLinearActuator(true, move.toRow, move.toCol)
                await this.setLinearActuator(false)
            }

            const distance = Math.abs(move.fromRow - move.toRow)

            const rowdir = move.toRow > move.fromRow ? 1 : -1
            const coldir = move.toCol > move.fromCol ? 1 : -1

            // Remove all pieces inbetween
            for (let steps = 1; steps < distance; steps++) {
                if (board[move.fromRow + rowdir * steps][move.fromCol + coldir * steps] !== ' ') {
                    inbetweenPieces.push({ row: move.fromRow + rowdir * steps, col: move.fromCol + coldir * steps })
                }
            }

            if (move.toRow === 0) {
                crossedLastRow = true
            }
        }

        // Switch to a king if necessary
        if (board[turn[0].fromRow][turn[0].fromCol] === 'b' && crossedLastRow) {
            const blackKingCount = this.boardService.getPieceCount(board, 'B')
            const nextKingCount = (blackKingCount + 1) % settings.board.presetKingCount

            // Drop the pawn
            await this.movePieceOffBoard()
            await this.setMagnet(false)
            if (settings.robot.goHomeAfterEveryMove) await this.goHome()

            // Pick up the king
            await this.queueSavedCommand('king_' + nextKingCount)
            await this.lowerAndPickup(4, 4, 2360)

            // Go to the right position
            const endPosition: string = turn[turn.length - 1].toRow + "_" + turn[turn.length - 1].toCol
            await this.queueSavedCommand(endPosition)
        }

        // Drop it
        await this.lowerAndDrop()

        if (settings.robot.goHomeAfterEveryMove) await this.goHome()

        // Remove the jumped pieces
        for (const piece of inbetweenPieces) {
            await this.deletePiece(piece.row, piece.col)
        }

        if (settings.robot.goHomeAfterEveryMove) await this.goHome()

        return Promise.resolve(true)
    }

    async sendSavedTrim(): Promise<boolean> {
        await this.queueSavedCommand("trim");
        return Promise.resolve(true);
    }

    async deletePiece(row: number, col: number): Promise<boolean> {
        const startPosition = row + "_" + col
        await this.queueSavedCommand(startPosition)
        await this.lowerAndPickup(row, col)

        await this.movePieceOffBoard()
        await this.setMagnet(false)
        
        if (settings.robot.goHomeAfterEveryMove) await this.goHome()
        
        return Promise.resolve(true)
    }

    async lowerAndPickup(row: number = 4, col: number = 4, customLValue: number = null): Promise<boolean> {
        await this.setLinearActuator(true, row, col, customLValue)
        await this.setMagnet(true)
        await this.moveAround(row, col)
        await this.setLinearActuator(false)

        return Promise.resolve(true)
    }

    async movePieceOffBoard(): Promise<boolean> {
        await this.queueSavedCommand('dropPiece')

        return Promise.resolve(true)
    }

    async moveAround(row: number, col: number): Promise<boolean> {
        const position = row + "_" + col

        return this.storage.get(storagePrefix + position).then(async (command: string) => {
            if (!command) return false
            else {
                const previousShoulderValue = Number(command.substr(0, 6).split('_')[0].substr(2))
                const previousElbowValue = Number(command.substr(command.length - 5).substr(0, 4))

                const commandFirst = `P(${previousShoulderValue}_${previousElbowValue + 30})`
                const commandSecond = `P(${previousShoulderValue}_${previousElbowValue - 50})`
                // const commandThird = `P(${previousShoulderValue + 20}_${previousElbowValue})`
                // const commandFourth = `P(${previousShoulderValue - 40}_${previousElbowValue})`

                await this.queueCommand(commandFirst)
                await this.queueCommand(commandSecond)
                // await this.queueCommand(commandThird)
                // await this.queueCommand(commandFourth)

                return true
            } 
        })
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

    async setLinearActuator(doLower: boolean, currentRow: number = 4, currentCol: number = 4, customLValue: number = null): Promise<boolean> {
        const lValue = settings.board.baseLValue + settings.board.positionLValueOffsets[currentRow][currentCol]

        if (doLower) await this.queueCommand(`L(${customLValue || lValue})`)
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
        return this.storage.get(storagePrefix + name).then(async (command: string) => {
            if (!command) return false
            else {
                await this.queueCommand(command)
                return true
            } 
        })
    }

    async queueCommand(command: string): Promise<boolean> {
        this.commandQueue.push(command)

        // If this was the first command that was added we can immediately send it
        if (this.commandQueue.length == 1){
            this.sendNextCommand()
        }

        return Promise.resolve(true)
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
        if (this.debugLogging) console.log(`Server: ${command}`)
        this.isMoving = true

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
        if(this.commandQueue.length < 1) return
        const command = this.commandQueue[0]
        this.sendDirectCommand(command)
    }

}
