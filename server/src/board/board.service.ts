import { Injectable } from '@nestjs/common'
import { MoveValidationService } from '../game/move-validation.service'
import { StorageService } from '../storage.service'

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

  constructor(
    private readonly storage: StorageService,
    private readonly moveValidationService: MoveValidationService) {}

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
    
    this.storage.set('board-state', newBoard)

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
    const source = board[fromRow][fromCol]

    if (toRow === 0 && source === 'b') {
      newBoard[toRow][toCol] = 'B' // set the new cell to be a king
    } else if (toRow === settings.board.rowCount - 1 && source === 'w') {
      newBoard[toRow][toCol] = 'W' // set the new cell to be a king
    } else {
      newBoard[toRow][toCol] = source // set the new cell to be the same piece as the old cell
    }

    newBoard[fromRow][fromCol] = ' ' // set the old cell to be empty

    const distance = Math.abs(fromRow - toRow)

    const rowdir = toRow > fromRow ? 1 : -1
    const coldir = toCol > fromCol ? 1 : -1

    // Remove all pieces inbetween
    for (let steps = 1; steps < distance; steps++) {
      newBoard[fromRow + rowdir * steps][fromCol + coldir * steps] = ' '
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

  getPieceCount(board: Board, piece: Piece, ignoreKing: boolean = false): number {
    const checkForPiece = ignoreKing ? piece.toLowerCase() : piece
    
    let count = 0
    board.map((pieces: Piece[]) => {
      pieces.map((localPiece: Piece) => {
        const updatedPiece = ignoreKing ? localPiece.toLowerCase() : localPiece
        if (checkForPiece === updatedPiece) {
          count += 1
        }
      })
    })

    return count
  }

}
