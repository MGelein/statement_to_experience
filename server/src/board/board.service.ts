import { Injectable } from '@nestjs/common'
import { MoveValidationService } from '../game/move-validation.service'

import { settings } from '../settings'

// space is empty, b is black, w is white, B is black king, W is white king
export type Player = 'b' | 'w'
export type Piece = Player | ' ' | 'B' | 'W'

export type Board = Piece[][]

export interface BoardState{
  board: Board;
  removed: GridCoord[]
}

export interface GridCoord{
  gridRow: number;
  gridCol: number;
}

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
    this.board = JSON.parse(JSON.stringify(settings.board.initialBoard8))
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

    this.board = this.applyMove(this.board, fromRow, fromCol, toRow, toCol).board
    this.lastUpdated = new Date()

    return 'OK'
  }

  /**
   * Move one piece and return a new board (used directly by the AI package)
   * We assume the move has already been validated
   */
  applyMove(board: Board, fromRow: number, fromCol: number, toRow: number, toCol: number): BoardState {
    let newBoard = JSON.parse(JSON.stringify(board))
    const boardState: BoardState = {
      board: newBoard,
      removed: []
    };
    const source = board[fromRow][fromCol]

    if (toRow === 0 && source === 'w') {
      newBoard[toRow][toCol] = 'W' // set the new cell to be a king
    } else if (toRow === settings.board.rowCount - 1 && source === 'b') {
      newBoard[toRow][toCol] = 'B' // set the new cell to be a king
    } else {
      newBoard[toRow][toCol] = source // set the new cell to be the same piece as the old cell
    }

    newBoard[fromRow][fromCol] = ' ' // set the old cell to be empty

    const distance = Math.abs(fromRow - toRow)

    const rowdir = toRow > fromRow ? 1 : -1
    const coldir = toCol > fromCol ? 1 : -1

    // Remove all pieces inbetween
    for (let steps = 1; steps < distance; steps++) {
      let row = fromRow + rowdir * steps
      let col = fromCol + coldir * steps
      if(newBoard[col][row] !== ' '){
        newBoard[row][col] = ' '
        boardState.removed.push({gridRow: row, gridCol: col})
      }
    }

    boardState.board = newBoard;
    return boardState
  }

  applyTurn(board: Board, turn: Turn): BoardState {
    let newBoard = JSON.parse(JSON.stringify(board))
    const boardState: BoardState = {
      board: newBoard,
      removed: []
    }

    turn.map((move: Move) => {
      const newBoardState: BoardState = this.applyMove(boardState.board, move.fromRow, move.fromCol, move.toRow, move.toCol)
      boardState.board = newBoardState.board
      for(let coord of newBoardState.removed){
        boardState.removed.push(coord)
      }
    })

    return boardState
  }

}
