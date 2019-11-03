import { Injectable } from '@nestjs/common'

import { Board, Player, Piece, Move, Turn } from '../board/board.service'
import { MoveValidationService } from './move-validation.service'

@Injectable()
export class MoveEvaluationService {

    constructor(private readonly moveValidationService: MoveValidationService) {}

    getAllPossibleTurns(board: Board, player: Player): Turn[] {
        let jumps: Turn[] = []
        let moves: Turn[] = []

        board.map((pieces: Piece[], row: number) => {
            pieces.map((piece: Piece, col: number) => {
                if (piece === player) {
                    let hasJumps = false
                    this.getJumpsFrom(board, row, col).map((turn: Turn) => {
                        if (turn.length !== 0) {
                            jumps.push(turn)
                            hasJumps = true
                        }
                    })

                    if (!hasJumps) {
                        moves = [...moves, ...this.getMovesFrom(board, row, col)]
                    }
                }
            })
        })

        // If you can jump, you must jump; only consider turns if no jumps are possible
        if (jumps.length > 0) {
            return jumps
        } else {
            return moves
        }
    }

    getJumpsFrom(board: Board, row: number, col: number, previousTurn: Turn = []): Turn[] {
        let turns = []

        if (this.isValid(board, row, col, row - 2, col - 2) === 'OK') { // top left
            const newTurn = [...previousTurn, { fromRow: row, fromCol: col, toRow: row - 2, toCol: col - 2 }]
            const withMultiJumps = this.getJumpsFrom(board, row - 2, col - 2, newTurn)
            turns = [...turns, ...withMultiJumps]
        }

        if (this.isValid(board, row, col, row - 2, col + 2) === 'OK') { // top right
            const newTurn = [...previousTurn, { fromRow: row, fromCol: col, toRow: row - 2, toCol: col + 2 }]
            const withMultiJumps = this.getJumpsFrom(board, row - 2, col + 2, newTurn)
            turns = [...turns, ...withMultiJumps]
        }

        if (this.isValid(board, row, col, row + 2, col - 2) === 'OK') { // bottom left
            const newTurn = [...previousTurn, { fromRow: row, fromCol: col, toRow: row + 2, toCol: col - 2 }]
            const withMultiJumps = this.getJumpsFrom(board, row + 2, col - 2, newTurn)
            turns = [...turns, ...withMultiJumps]
        }

        if (this.isValid(board, row, col, row + 2, col + 2) === 'OK') { // bottom right
            const newTurn = [...previousTurn, { fromRow: row, fromCol: col, toRow: row + 2, toCol: col + 2 }]
            const withMultiJumps = this.getJumpsFrom(board, row + 2, col + 2, newTurn)
            turns = [...turns, ...withMultiJumps]
        }

        // Require multi-hops if possible, otherwise just return the previous turn
        if (turns.length > 0) {
            return turns
        } else {
            return [previousTurn]
        }
    }

    getMovesFrom(board: Board, row: number, col: number): Turn[] {
        let turns = []

        if (this.isValid(board, row, col, row - 1, col - 1) === 'OK') { // top left
            turns.push([{ fromRow: row, fromCol: col, toRow: row - 1, toCol: col - 1 }])
        }

        if (this.isValid(board, row, col, row - 1, col + 1) === 'OK') { // top right
            turns.push([{ fromRow: row, fromCol: col, toRow: row - 1, toCol: col + 1 }])
        }

        if (this.isValid(board, row, col, row + 1, col - 1) === 'OK') { // bottom left
            turns.push([{ fromRow: row, fromCol: col, toRow: row + 1, toCol: col - 1 }])
        }

        if (this.isValid(board, row, col, row + 1, col + 1) === 'OK') { // bottom right
            turns.push([{ fromRow: row, fromCol: col, toRow: row + 1, toCol: col + 1 }])
        }

        return turns
    }

    private isValid(board: Board, fromRow: number, fromCol: number, toRow: number, toCol: number) {
        return this.moveValidationService.isValid(board, fromRow, fromCol, toRow, toCol)
    }

}
