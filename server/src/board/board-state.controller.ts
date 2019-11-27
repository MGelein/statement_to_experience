import { Controller, Get, Post, Body } from '@nestjs/common'

import { StorageService } from '../storage.service'
import { BoardService, Player } from './board.service'

import { settings } from '../settings'
import { MoveValidationService } from '../game/move-validation.service'
import { AIService } from '../ai/ai.service'

const arraysEqual = (a1: any[], a2: any[]): boolean => {
  return JSON.stringify(a1) == JSON.stringify(a2)
}

@Controller('board-state')
export class BoardStateController {

  constructor(
    private readonly boardService: BoardService,
    private readonly storage: StorageService,
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

    if (this.isFirst) {
      this.isFirst = false
      this.boardService.update(newBoard)
      return 'OK'
    }

    const sameBoardThreshold: number = 3

    // If there is a change to the currently stored board state
    if (!arraysEqual(oldBoard, newBoard)) {
      if (arraysEqual(newBoard, this.previousBoard) && this.sameBoardInARowCount < (sameBoardThreshold - 1)) {
        // console.log('Seen more than once, but not yet 3 times')
        // If this board state has been seen before, but the threshold hasnt been reached yet
        this.previousBoard = newBoard
        this.sameBoardInARowCount += 1
        return 'OK'
      } else if (!arraysEqual(newBoard, this.previousBoard)) {
        // console.log('Not seen yet')
        // If this board state has not been seen before
        this.previousBoard = newBoard
        this.sameBoardInARowCount = 0
        return 'OK'
      }

      this.previousBoard = null
      this.sameBoardInARowCount = 0

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
        const isValid = this.moveValidationService.isValid(oldBoard, fromRow, fromCol, toRow, toCol)

        if (isValid === 'OK') {
          console.log(`Move (${fromRow}, ${fromCol} to (${toRow}, ${toCol})) is valid.`)
          this.boardService.update(newBoard)

          this.aiService.play()
        } else {
          console.log(`Move (${fromRow}, ${fromCol} to (${toRow}, ${toCol})) is invalid, because: ${isValid}`)
        }
      }
    }

    return 'OK'
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
