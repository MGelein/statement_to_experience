import { Injectable } from '@nestjs/common'
import { MoveValidationService } from '../game/move-validation.service'

import { settings } from '../settings'

// space is empty, b is black, w is white, B is black king, W is white king
export type Player = 'b' | 'w'
export type Piece = Player | ' ' | 'B' | 'W'

export type Board = Piece[][]

const InitialBoardState: Board = [
  [' ', 'b', ' ', 'b', ' ', 'b', ' ', 'b', ' ', 'b'],
  ['b', ' ', 'b', ' ', 'b', ' ', 'b', ' ', 'b', ' '],
  [' ', 'b', ' ', 'b', ' ', 'b', ' ', 'b', ' ', 'b'],
  ['b', ' ', 'b', ' ', 'b', ' ', 'b', ' ', 'b', ' '],
  [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
  [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
  [' ', 'w', ' ', 'w', ' ', 'w', ' ', 'w', ' ', 'w'],
  ['w', ' ', 'w', ' ', 'w', ' ', 'w', ' ', 'w', ' '],
  [' ', 'w', ' ', 'w', ' ', 'w', ' ', 'w', ' ', 'w'],
  ['w', ' ', 'w', ' ', 'w', ' ', 'w', ' ', 'w', ' '],
]

@Injectable()
export class BoardService {

  board: Board = []
  lastUpdated: Date = new Date()

  constructor(private readonly moveValidationService: MoveValidationService) {}

  /**
   * Reset the entire board
   */
  restart(): boolean {
    this.board = JSON.parse(JSON.stringify(InitialBoardState))
    return true
  }

  /**
   * Retrieve the entire board
   */
  get(): Board {
    return this.board
  }

  /**
   * Set the entire board
   */
  update(newBoard: Board): boolean {
    this.board = newBoard
    this.lastUpdated = new Date()

    return true
  }

  /**
   * Move one piece
   */
  move(fromRow: number, fromCol: number, toRow: number, toCol: number): string {
    const validationError = this.moveValidationService.isValid(this.board, fromRow, fromCol, toRow, toCol)
    if (validationError !== 'OK') {
      return validationError
    }

    if (toRow === 0 || toRow === settings.rowCount - 1) {
      this.board[toRow][toCol] = this.board[fromRow][fromCol] === 'b' ? 'B' : 'W' // set the new cell to be a king
    } else {
      this.board[toRow][toCol] = this.board[fromRow][fromCol] // set the new cell to be the same piece as the old cell
    }

    this.board[fromRow][fromCol] = ' ' // set the old cell to be empty

    if (Math.abs(fromRow - toRow) === 2) {
      const inbetweenRow = fromRow + ((toRow - fromRow) / 2)
      const inbetweenCol = fromCol + ((toCol - fromCol) / 2)

      this.board[inbetweenRow][inbetweenCol] = ' ' // set the cell inbetween to be empty
    }

    this.lastUpdated = new Date()

    return 'OK'
  }

}
