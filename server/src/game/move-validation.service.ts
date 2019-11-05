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

        if (board[toRow][toCol].toLowerCase() === player) {
            return 'You cannot move to a cell with a piece from the same player'
        }

        const isKing = board[fromRow][fromCol] === 'B' || board[fromRow][fromCol] === 'W'

        if (isKing) {
            return this.isValidForAKing(board, fromRow, fromCol, toRow, toCol)
        } else {
            return this.isValidForAPawn(board, fromRow, fromCol, toRow, toCol)
        }
    }

    private isValidForAPawn(board: Board, fromRow: number, fromCol: number, toRow: number, toCol: number): string {
        const player = board[fromRow][fromCol].toLowerCase()
        const distanceRows = Math.abs(toRow - fromRow)
        const distanceCols = Math.abs(toCol - fromCol)

        if (distanceRows > 2 || distanceCols > 2) {
            return 'You cannot move this far'
        }

        if (distanceRows === 1 && player === 'b' && fromRow > toRow) {
            return 'You cannot move backwards with a pawn'
        }

        if (distanceRows === 1 && player === 'w' && fromRow < toRow) {
            return 'You cannot move backwards with a pawn'
        }

        if (distanceRows === 2) {
            const inbetweenRow = fromRow + ((toRow - fromRow) / 2)
            const inbetweenCol = fromCol + ((toCol - fromCol) / 2)

            if (board[inbetweenRow][inbetweenCol].toLowerCase() === player) {
                return 'You cannot jump over your own piece'
            }

            if (board[inbetweenRow][inbetweenCol] === ' ') {
                return 'You cannot jump over an empty cell'
            }
        }

        return 'OK'
    }

    private isValidForAKing(board: Board, fromRow: number, fromCol: number, toRow: number, toCol: number): string {
        // const player = board[fromRow][fromCol].toLowerCase()
        // const opponent = player === 'b' ? 'w' : 'b'

        // // We already checked that the distance in rows is the same as in cols, so we can assume they're the same now
        // const distance = Math.abs(toRow - fromRow)
        // const rowdir = toRow > fromRow ? 1 : -1
        // const coldir = toCol > fromCol ? 1 : -1

        // console.log(distance)

        // let piecesOpponentInBetween = 0
        // for (let steps = 0; steps <= distance; steps++) {            
        //     if (fromRow + rowdir * (steps + 1) >= settings.rowCount - 1 || fromCol + coldir * (steps + 1) >= settings.colCount - 1) {
        //         return 'OK'
        //     }

        //     const piece = board[fromRow + rowdir * (steps + 1)][fromCol + coldir * (steps + 1)]


        //     if (!piece) {
        //         return 'OK'
        //     }

        //     if (piece.toLowerCase() === player) {
        //         return 'You cannot move or jump over your own pieces'
        //     } else if (piece.toLowerCase() === opponent) {
        //         piecesOpponentInBetween += 1

        //         if (piecesOpponentInBetween > 1) {
        //             return 'You cannot jump over more than 1 piece'
        //         }
        //     }
        // }

        return 'OK'
    }

}
