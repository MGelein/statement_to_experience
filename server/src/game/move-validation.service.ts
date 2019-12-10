import { Injectable } from '@nestjs/common'

import { Board, Piece, Move, Turn } from '../board/board.service'
import { settings } from '../settings'

const directions = [[1, 1], [1, -1], [-1, -1], [-1, 1]]

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

        if (distanceRows === 1) {
            // Is a move

            if (source === 'b' && fromRow < toRow) {
                return 'You cannot move backwards with a pawn'
            }

            if (source === 'w' && fromRow > toRow) {
                return 'You cannot move backwards with a pawn'
            }
        } else if (distanceRows === 2) {
            // Is a single jump

            const inbetweenRow = fromRow + ((toRow - fromRow) / 2)
            const inbetweenCol = fromCol + ((toCol - fromCol) / 2)
            const inbetween = board[inbetweenRow][inbetweenCol]

            if (inbetween.toLowerCase() === source) {
                return 'You cannot jump over your own piece'
            }

            if (inbetween === ' ') {
                return 'You cannot jump over an empty cell'
            }
        } else if (distanceRows > 2) {
            // If there is a jump possible between these pieces, then this is a valid multi-jump

            const possibleJumps = this.getJumpsFrom(board, fromRow, fromCol)
            if (possibleJumps.find((turn: Move[]) => turn[turn.length - 1].toRow == toRow && turn[turn.length - 1].toCol == toCol)) {
                return 'OK'
            }

            return 'You cannot move this far'
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

    private getJumpsFrom(board: Board, row: number, col: number, previousTurn: Turn = []): Turn[] {
        let turns: Turn[] = []

        const isKing = board[row][col] === 'B' || board[row][col] === 'W'

        // Pawns can jump 2 steps, while kings can jump infinitely far
        const maxSteps = isKing ? settings.board.rowCount - 1 : 2

        for (let steps = 2; steps <= maxSteps; steps++) {
            directions.map(([rowdir, coldir]) => {
                if (this.isValid(board, row, col, row + rowdir * steps, col + coldir * steps) === 'OK') {
                    // Check all steps inbetween; if there is no piece inbetween, then this is a move, not a jump
                    let hasPiecesInbetween = false
                    for (let inbetweenSteps = 1; inbetweenSteps < steps; inbetweenSteps++) {
                        const piece = board[row + rowdir * inbetweenSteps][col + coldir * inbetweenSteps]
                        if (piece !== ' ') {
                            hasPiecesInbetween = true
                        }
                    }

                    if (hasPiecesInbetween) {
                        const newTurn: Turn = [...previousTurn, { fromRow: row, fromCol: col, toRow: row + rowdir * steps, toCol: col + coldir * steps }]
                        const newBoard = this.applyMove(board, row, col, row + rowdir * steps, col + coldir * steps)

                        const withMultiJumps: Turn[] = this.getJumpsFrom(newBoard, row + rowdir * steps, col + coldir * steps, newTurn)
                        turns = [...turns, ...withMultiJumps]
                    }
                }
            })
        }

        // Require multi-jumps if possible, otherwise just return the previous turn
        if (turns.length > 0) {
            return turns
        } else if (previousTurn.length > 0) {
            return [previousTurn]
        } else {
            return []
        }
    }

    private applyMove(board: Board, fromRow: number, fromCol: number, toRow: number, toCol: number): Board {
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


}
