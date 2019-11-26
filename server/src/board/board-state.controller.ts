import { Controller, Get, Post, Body } from '@nestjs/common'

import { StorageService } from '../storage.service'
import { BoardService, Player } from './board.service'

import { settings } from '../settings'
import { MoveValidationService } from '../game/move-validation.service'
import { AIService } from '../ai/ai.service'

@Controller('board-state')
export class BoardStateController {

  constructor(
    private readonly boardService: BoardService,
    private readonly storage: StorageService,
    private readonly moveValidationService: MoveValidationService,
    private readonly aiService: AIService) {}

  isFirst: boolean = true

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

    if (oldBoard !== newBoard) {
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
