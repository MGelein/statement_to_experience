import { Injectable } from '@nestjs/common'

import { Board } from '../board/board.service'
import { settings } from '../settings'

@Injectable()
export class MoveValidationService {

    /**
     * Checks whether a single move is valid
     */
    isValid(board: Board, fromRow: number, fromCol: number, toRow: number, toCol: number): string {
        const player = board[fromRow][fromCol].toLowerCase()
        const isKing = board[fromRow][fromCol] === 'B' || board[fromRow][fromCol] === 'W'
        const distanceRows = Math.abs(toRow - fromRow)
        const distanceCols = Math.abs(toCol - fromCol)

        if (toRow > settings.rowCount - 1 || toRow < 0 || toCol > settings.colCount - 1 || toCol < 0) {
            return 'You cannot move off the board'
        }

        if (board[fromRow][fromCol] === ' ') {
            return 'You cannot move an empty cell'
        }

        if (board[toRow][toCol] !== ' ') {
            return 'You cannot move to a non-empty cell'
        }

        if (distanceRows != distanceCols || distanceRows === 0 || distanceCols === 0) {
            return 'You have to move diagonally'
        }

        if (board[toRow][toCol] === player) {
            return 'You cannot move to a cell with a piece from the same player'
        }

        if (distanceRows === 2) {
            const inbetweenRow = fromRow + ((toRow - fromRow) / 2)
            const inbetweenCol = fromCol + ((toCol - fromCol) / 2)

            if (board[inbetweenRow][inbetweenCol].toLowerCase() === player) {
                return 'You cannot jump over your own piece'
            }

            if (board[inbetweenRow][inbetweenCol] === ' ') {
                return 'You cannot jump over your an empty cell'
            }
        }

        if (isKing) {
            return this.isValidForAKing(board, fromRow, fromCol, toRow, toCol)
        } else {
            return this.isValidForANonKing(board, fromRow, fromCol, toRow, toCol)
        }
    }

    private isValidForANonKing(board: Board, fromRow: number, fromCol: number, toRow: number, toCol: number): string {
        const player = board[fromRow][fromCol].toLowerCase()
        const distanceRows = Math.abs(toRow - fromRow)
        const distanceCols = Math.abs(toCol - fromCol)

        if (distanceRows > 2 || distanceCols > 2) {
            return 'You cannot move this far'
        }

        if (distanceRows === 1 && player === 'b' && fromRow > toRow) {
            return 'You cannot move backwards with a non-king piece'
        }

        if (distanceRows === 1 && player === 'w' && fromRow < toRow) {
            return 'You cannot move backwards with a non-king piece'
        }

        return 'OK'
    }

    private isValidForAKing(board: Board, fromRow: number, fromCol: number, toRow: number, toCol: number): string {
        return 'OK'
    }

}
