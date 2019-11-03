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

const sign = (num: number) => {
  if (num < 0) return -1
  else return 1
}

@Injectable()
export class BoardService {

  board: Board = []
  lastUpdated: Date = new Date()

  rows = 10
  cols = 10

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

    this.board[toRow][toCol] = this.board[fromRow][fromCol] // set the new cell to be the same piece as the old cell
    this.board[fromRow][fromCol] = ' ' // set the old cell to be empty

    if (Math.abs(fromRow - toRow) === 2) {
      const inbetweenRow = fromRow + ((toRow - fromRow) / 2)
      const inbetweenCol = fromCol + ((toCol - fromCol) / 2)

      this.board[inbetweenRow][inbetweenCol] = ' ' // set the cell inbetween to be empty
    }

    this.lastUpdated = new Date()

    return 'OK'
  }

  /**
   * Checks whether a single move is valid
   */
  isValid(fromRow: number, fromCol: number, toRow: number, toCol: number): string {
    if (toRow > this.rows - 1 || toRow < 0 || toCol > this.cols - 1 || toCol < 0) {
      return 'You cannot move off the board'
    }

    if (this.board[fromRow][fromCol] === ' ') {
      return 'You cannot move an empty cell'
    }

    if (this.board[toRow][toCol] !== ' ') {
      return 'You cannot move to a non-empty cell'
    }

    // TODO: check for horizontal or vertical move, non-diagonal move, more than two diagonals

    const player = this.board[fromRow][fromCol]
    
    if (this.board[toRow][toCol] === player) {
      return 'You cannot move to a cell with a piece from the same player'
    }

    if (Math.abs(fromRow - toRow) === 2) {
      // Jumping over a piece
      const inbetweenRow = fromRow + ((toRow - fromRow) / 2)
      const inbetweenCol = fromCol + ((toCol - fromCol) / 2)

      if (this.board[inbetweenRow][inbetweenCol].toLowerCase() === player) {
        return 'You cannot jump over your own piece'
      }

      if (this.board[inbetweenRow][inbetweenCol] === ' ') {
        return 'You cannot jump over your an empty cell'
      }
    }

    return 'OK'
  }

}
