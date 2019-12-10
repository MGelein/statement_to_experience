import { Injectable } from '@nestjs/common'

import { Board, Piece } from '../board/board.service'
import { settings } from '../settings'

@Injectable()
export class MoveValidationService {

    isValid(board: Board, fromRow: number, fromCol: number, toRow: number, toCol: number): string {
        const source = board[fromRow][fromCol]

        const distanceRows = Math.abs(toRow - fromRow)
        const distanceCols = Math.abs(toCol - fromCol)

        if (toRow > settings.board.rowCount - 1 || toRow < 0 || toCol > settings.board.colCount - 1 || toCol < 0) {
            return 'You cannot move off the board'
        }

        const target = board[toRow][toCol]

        if (source === ' ') {
            return 'You cannot move an empty cell'
        }

        if (target !== ' ') {
            return 'You cannot move to a non-empty cell'
        }

        // if (distanceRows != distanceCols || distanceRows === 0 || distanceCols === 0) {
        //     return 'You have to move diagonally'
        // }

        // if (target.toLowerCase() === source.toLowerCase()) {
        //     return 'You cannot move to a cell with a piece from the same player'
        // }

        const isKing = source === 'B' || source === 'W'

        if (isKing) {
            return this.isValidForAKing(board, fromRow, fromCol, toRow, toCol, source)
        } else {
            return this.isValidForAPawn(board, fromRow, fromCol, toRow, toCol, source, target)
        }
    }

    private isValidForAPawn(board: Board, fromRow: number, fromCol: number, toRow: number, toCol: number, source: Piece, target: Piece): string {
        const distanceRows = Math.abs(toRow - fromRow)

        if (distanceRows > 2) {
            return 'You cannot move this far'
        }

        if (distanceRows === 1) {
            // Is a move

            if (source === 'b' && fromRow < toRow) {
                return 'You cannot move backwards with a pawn'
            }

            if (source === 'w' && fromRow > toRow) {
                return 'You cannot move backwards with a pawn'
            }
        } else if (distanceRows === 2) {
            // Is a jump

            const inbetweenRow = fromRow + ((toRow - fromRow) / 2)
            const inbetweenCol = fromCol + ((toCol - fromCol) / 2)
            const inbetween = board[inbetweenRow][inbetweenCol]

            if (inbetween.toLowerCase() === source) {
                return 'You cannot jump over your own piece'
            }

            if (inbetween === ' ') {
                return 'You cannot jump over an empty cell'
            }
        }

        return 'OK'
    }

    private isValidForAKing(board: Board, fromRow: number, fromCol: number, toRow: number, toCol: number, source: Piece): string {
        const opponent = source.toLowerCase() === 'b' ? 'w' : 'b'

        // We already checked that the distance in rows is the same as in cols, so we can assume they're the same now
        const distance = Math.abs(toRow - fromRow)

        const rowdir = toRow > fromRow ? 1 : -1
        const coldir = toCol > fromCol ? 1 : -1

        let piecesOpponentInBetween = 0
        for (let steps = 1; steps <= distance; steps++) {
            if (fromRow + rowdir * steps >= settings.board.rowCount - 1 || fromCol + coldir * steps >= settings.board.colCount - 1) {
                continue
            }

            const piece = board[fromRow + rowdir * steps][fromCol + coldir * steps]

            if (!piece) {
                continue
            }

            if (piece.toLowerCase() === source.toLowerCase()) {
                return 'You cannot move or jump over your own pieces'
            } else if (piece.toLowerCase() === opponent) {
                piecesOpponentInBetween += 1

                if (piecesOpponentInBetween > 1) {
                    return 'You cannot jump over more than 1 piece'
                }
            }
        }

        return 'OK'
    }

}
