import { Controller, Get, Header, Post, Body } from '@nestjs/common'

import { StorageService } from '../storage.service'
import { Move, Board, BoardService, Player, Piece } from './board.service'

import { settings } from '../settings'
import { MoveValidationService } from '../game/move-validation.service'
import { AIService } from '../ai/ai.service'
import { RobotCommandsService } from '../robot/robot-commands.service'
import { VoiceService } from '../voice/voice.service'
import { MoveGenerationService } from '../game/move-generation.service'
import { GameStateService } from '../game/game-state.service'

const arraysEqual = (a1: any[], a2: any[]): boolean => {
  return JSON.stringify(a1) == JSON.stringify(a2)
}

const countDifferentPieces = (a1: any[], a2: any[]): number => {
  let count = 0
  for (let row = 0; row < Math.min(a1.length, a2.length); row++) {
    for (let col = 0; col < Math.min(a1[row].length, a2[row].length); col++) {
      if (a1[row][col] !== a2[row][col]) {
        count += 1
      }
    }
  }

  return count
}

const printProgress = (progress: number, prefix: string = '') =>{
  (process.stdout as any).clearLine();
  (process.stdout as any).cursorTo(0);
  (process.stdout as any).write(prefix + progress + '%');
}

@Controller('board-state')
export class BoardStateController {

  constructor(
    private readonly boardService: BoardService,
    private readonly robotCommandsService: RobotCommandsService,
    private readonly storage: StorageService,
    private readonly voiceService: VoiceService,
    private readonly gameStateService: GameStateService,
    private readonly moveGenerationService: MoveGenerationService,
    private readonly moveValidationService: MoveValidationService,
    private readonly aiService: AIService) {}

  isFirst: boolean = true

  lastCameraView: string[][] = []
  previousBoard: Piece[][] | null = null
  sameBoardInARowCount: number = 0

  sameBoardThreshold: number = 6

  lastAIMoveAt: number = 0

  waitingForFirstMove: boolean = false

  @Post()
  update(@Body() state: any): string {
    const player: Player = 'w'
    const oldBoard = this.boardService.get()
    const newBoard = Object.keys(state).reduce((newState: string[], key: string) => [...newState, state[key]], [])

    this.lastCameraView = newBoard

    if (this.robotCommandsService.isMoving) {
      return 'Robot arm is moving'
    }

    if (!this.waitingForFirstMove && !this.gameStateService.state.startedAt) {
      const diff = countDifferentPieces(newBoard, settings.board.initialBoard)

      if (diff > 0) {
        printProgress(Math.round(((24 - diff)/24) * 100), 'Waiting for board set up, currently at ')
        return 'Waiting for the board to be set up correctly'
      } else {
        console.log('Board configured correctly, waiting for the first move...')
        this.waitingForFirstMove = true

        this.boardService.update(newBoard)
      
        return 'Board configured correctly, waiting for the first move'
      }
    }

    // If there is a change to the currently stored board state
    if (!arraysEqual(oldBoard, newBoard)) {
      if (arraysEqual(newBoard, this.previousBoard) && this.sameBoardInARowCount < (this.sameBoardThreshold - 1)) {
        // If this board state has been seen before, but the threshold hasnt been reached yet
        this.previousBoard = newBoard
        this.sameBoardInARowCount += 1
              
        return String(this.sameBoardInARowCount - 1)
      } else if (!arraysEqual(newBoard, this.previousBoard)) {
        // If this board state has not been seen before
        this.previousBoard = newBoard
        this.sameBoardInARowCount = 0

        return '1'
      }

      // Detect the move
      let fromRow = -1
      let fromCol = -1
      let toRow = -1
      let toCol = -1
      for (let row = 0; row < settings.board.rowCount; row++) {
        for (let col = 0; col < settings.board.colCount; col++) {
          if (oldBoard[row][col].toLowerCase() === player) {
            if (newBoard[row][col] === ' ') {
              fromRow = row
              fromCol = col
            }
          } else if (oldBoard[row][col] === ' ') {
            if (newBoard[row][col].toLowerCase() === player) {
              toRow = row
              toCol = col
            }
          }
        }
      }

      if (fromRow !== -1 && fromCol !== -1 && toRow !== -1 && toCol !== -1) {
        const move: Move = {
          fromRow: Number(fromRow),
          fromCol: Number(fromCol),
          toRow: Number(toRow),
          toCol: Number(toCol)
        }

        this.move(oldBoard, move)
      }

      return String(this.sameBoardInARowCount)
    }

    return 'OK'
  }

  private move(oldBoard: Board, move: Move) {
    const isValid = this.moveValidationService.isValid(oldBoard, move.fromRow, move.fromCol, move.toRow, move.toCol)

    if (isValid === 'OK') {
      const lastMoveWasAJump = Math.abs(move.toRow - move.fromRow) > 1

      // Check if it was a move, but if there were jumps possible, then block the move
      if (!lastMoveWasAJump) {
        const player = oldBoard[Number(move.fromRow)][Number(move.fromCol)].toLowerCase() as Player
        const jumpsFromPreviousPosition = this.moveGenerationService.getAllPossibleJumps(oldBoard, player)

        if (jumpsFromPreviousPosition.length !== 0) {
          this.voiceService.triggerInvalidMove('You have to jump if you can jump.')
          return
        }
      }

      console.log(`Move (${move.fromRow}, ${move.fromCol} to (${move.toRow}, ${move.toCol})) is valid.`)
      this.boardService.move(move.fromRow, move.fromCol, move.toRow, move.toCol)
      
      const player = oldBoard[Number(move.fromRow)][Number(move.fromCol)] as Player
      this.gameStateService.addMove(player, move)

      const moveDuration = ((new Date().getTime()) - this.lastAIMoveAt) / 1000
      if (this.lastAIMoveAt !== 0 && moveDuration > settings.voice.slowMoveTimeInSeconds) {
        this.voiceService.triggerSlowMove(moveDuration)
      }

      this.waitingForFirstMove = false
        
      this.aiService.play()

      this.lastAIMoveAt = new Date().getTime()
    } else {
      console.log(`Move (${move.fromRow}, ${move.fromCol} to (${move.toRow}, ${move.toCol})) is invalid, because: ${isValid}`)
      this.voiceService.triggerInvalidMove(isValid)
    }
  }

  @Get('camera-view/csv')
  @Header('Content-Type', 'text/plain')
  csv(): string {
    return this.lastCameraView.map((row: Piece[]) => Object.keys(row).map((key: string) => row[key]).join('')).join('\n')
  }

  @Get('square-positions')
  getSquarePositions(): any {
    return this.storage.get('board/square-positions')
  }

  @Post('square-positions')
  saveSquarePositions(@Body() positions: any): string {
    this.storage.set('board/square-positions', positions)

    return 'OK'
  }

}
