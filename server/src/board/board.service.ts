import { Injectable } from '@nestjs/common'

// e is empty, b is black, w is white, B is black king, W is white king
export type Player = 'b' | 'w'
export type Piece = Player | 'e' | 'B' | 'W'

export type Board = Piece[][]

@Injectable()
export class BoardService {

  board: Board = []
  lastUpdated: Date = new Date()

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
   * 
   * @param player 1 or 2 (black or white)
   */
  move(player: Player, fromRow: number, fromCol: number, toRow: number, toCol: number): string {
    const validationError = this.isValid(player, fromRow, fromCol, toRow, toCol)
    if (validationError !== 'OK') {
      return validationError
    }

    this.board[toRow][toCol] = this.board[fromRow][fromCol] // set the new position to be the same piece as the old position
    this.board[fromRow][fromCol] = 'e' // set the old position to be empty
    this.lastUpdated = new Date()

    return 'OK'
  }

  /**
   * Checks whether a single move is valid
   * 
   * @param player b or w (black or white)
   */
  isValid(player: Player, fromRow: number, fromCol: number, toRow: number, toCol: number): string {
    if (this.board[fromRow][fromCol] === 'e') {
      return 'You cannot move an empty piece'
    }
    
    if (this.board[toRow][toCol] === player) {
      return 'You cannot move to a place with a piece from the same type'
    }

    return 'OK'
  }

}
