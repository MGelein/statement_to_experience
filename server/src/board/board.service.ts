import { Injectable } from '@nestjs/common'

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
    const validationError = this.isValid(fromRow, fromCol, toRow, toCol)
    if (validationError !== 'OK') {
      return validationError
    }

    this.board[toRow][toCol] = this.board[fromRow][fromCol] // set the new position to be the same piece as the old position
    this.board[fromRow][fromCol] = ' ' // set the old position to be empty
    this.lastUpdated = new Date()

    return 'OK'
  }

  /**
   * Checks whether a single move is valid
   */
  isValid(fromRow: number, fromCol: number, toRow: number, toCol: number): string {
    if (this.board[fromRow][fromCol] === ' ') {
      return 'You cannot move an empty piece'
    }

    const player = this.board[fromRow][fromCol]
    
    if (this.board[toRow][toCol] === player) {
      return 'You cannot move to a place with a piece from the same type'
    }

    return 'OK'
  }

}
