import { Controller, Get, Post, Body } from '@nestjs/common'

import { StorageService } from '../storage.service'
import { Move, Board, BoardService, Player } from './board.service'

import { settings } from '../settings'
import { MoveValidationService } from '../game/move-validation.service'
import { AIService } from '../ai/ai.service'
import { RobotCommandsService } from '../robot/robot-commands.service'
import { VoiceService } from '../voice/voice.service'

const arraysEqual = (a1: any[], a2: any[]): boolean => {
  return JSON.stringify(a1) == JSON.stringify(a2)
}

@Controller('board-state')
export class BoardStateController {

  constructor(
    private readonly boardService: BoardService,
    private readonly robotCommandsService: RobotCommandsService,
    private readonly storage: StorageService,
    private readonly voiceService: VoiceService,
    private readonly moveValidationService: MoveValidationService,
    private readonly aiService: AIService) {}

  isFirst: boolean = true

  previousBoard: string[][] | null = null
  sameBoardInARowCount: number = 0

  @Post()
  update(@Body() state: any): string {
    const player: Player = 'w'
    const oldBoard = this.boardService.get()
    const newBoard = Object.keys(state).reduce((newState: string[], key: string) => [...newState, state[key]], [])

    if (this.robotCommandsService.isMoving) {
      return 'OK'
    }

    if (this.isFirst) {
      this.isFirst = false
      this.boardService.update(newBoard)
      return 'OK'
    }

    const sameBoardThreshold: number = 3

    // If there is a change to the currently stored board state
    if (!arraysEqual(oldBoard, newBoard)) {
      if (arraysEqual(newBoard, this.previousBoard) && this.sameBoardInARowCount < (sameBoardThreshold - 1)) {
        // If this board state has been seen before, but the threshold hasnt been reached yet
        this.previousBoard = newBoard
        this.sameBoardInARowCount += 1
        // console.log(`${this.sameBoardInARowCount + 1}...`)
              
        return 'OK'
      } else if (!arraysEqual(newBoard, this.previousBoard)) {
        // If this board state has not been seen before
        this.previousBoard = newBoard
        this.sameBoardInARowCount = 0
        // console.log('1...')

        return 'OK'
      }

      // console.log('3... Executing...')

      let fromRow = -1
      let fromCol = -1
      let toRow = -1
      let toCol = -1
      for (let row = 0; row < settings.board.rowCount; row++) {
        for (let col = 0; col < settings.board.colCount; col++) {
          if (oldBoard[row][col] === player) {
            if (newBoard[row][col] === ' ') {
              fromRow = row
              fromCol = col
            }
          } else if (oldBoard[row][col] === ' ') {
            if (newBoard[row][col] === player) {
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
    }
    //  else {
    //   console.log('--')
    // }

    return 'OK'
  }

  private move(oldBoard: Board, move: Move) {
    // const player = oldBoard[Number(move.fromRow)][Number(move.fromCol)] as Player
    const isValid = this.moveValidationService.isValid(oldBoard, move.fromRow, move.fromCol, move.toRow, move.toCol)

    if (isValid === 'OK') {
      console.log(`Move (${move.fromRow}, ${move.fromCol} to (${move.toRow}, ${move.toCol})) is valid.`)
      this.boardService.move(move.fromRow, move.fromCol, move.toRow, move.toCol)

      this.aiService.play()
    } else {
      console.log(`Move (${move.fromRow}, ${move.fromCol} to (${move.toRow}, ${move.toCol})) is invalid, because: ${isValid}`)
      this.voiceService.triggerInvalidMove(isValid)
    }
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
