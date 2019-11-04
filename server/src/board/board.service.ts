import { Injectable } from '@nestjs/common'
import { MoveValidationService } from '../game/move-validation.service'

import { settings } from '../settings'

// space is empty, b is black, w is white, B is black king, W is white king
export type Player = 'b' | 'w'
export type Piece = Player | ' ' | 'B' | 'W'

export type Board = Piece[][]

export interface Move {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
}

export type Turn = Move[]

@Injectable()
export class BoardService {

  board: Board = []
  lastUpdated: Date = new Date()

  constructor(private readonly moveValidationService: MoveValidationService) {}

  /**
   * Reset the entire board
   */
  restart(): boolean {
    this.board = JSON.parse(JSON.stringify(settings.initialBoard10))
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

    this.board = this.applyMove(this.board, fromRow, fromCol, toRow, toCol)
    this.lastUpdated = new Date()

    return 'OK'
  }

  /**
   * Move one piece and return a new board (used directly by the AI package)
   * We assume the move has already been validated
   */
  applyMove(board: Board, fromRow: number, fromCol: number, toRow: number, toCol: number): Board {
    let newBoard = JSON.parse(JSON.stringify(board))
    const player = board[fromRow][fromCol]

    if (toRow === 0 && player === 'w') {
      newBoard[toRow][toCol] = 'W' // set the new cell to be a king
    } else if (toRow === settings.rowCount - 1 && player === 'b') {
      newBoard[toRow][toCol] = 'B' // set the new cell to be a king
    } else {
      newBoard[toRow][toCol] = player // set the new cell to be the same piece as the old cell
    }

    newBoard[fromRow][fromCol] = ' ' // set the old cell to be empty

    if (Math.abs(fromRow - toRow) === 2) {
      const inbetweenRow = fromRow + ((toRow - fromRow) / 2)
      const inbetweenCol = fromCol + ((toCol - fromCol) / 2)

      newBoard[inbetweenRow][inbetweenCol] = ' ' // set the cell inbetween to be empty
    }

    return newBoard
  }

  applyTurn(board: Board, turn: Turn) {
    let newBoard = JSON.parse(JSON.stringify(board))

    turn.map((move: Move) => {
      newBoard = this.applyMove(newBoard, move.fromRow, move.fromCol, move.toRow, move.toCol)
    })

    return newBoard
  }

}
