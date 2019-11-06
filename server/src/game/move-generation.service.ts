import { Injectable } from '@nestjs/common'

import { Board, BoardService, Player, Piece, Turn } from '../board/board.service'
import { MoveValidationService } from './move-validation.service'
import { settings } from '../settings'

/**
 * These arrays denote the direction in which we are searching for moves.
 * E.g. -1, -1 changes the row and column directions into negative values,
 * thus searching in the top-left direction.
 */
const directions = [[1, 1], [1, -1], [-1, -1], [-1, 1]]

@Injectable()
export class MoveGenerationService {

    constructor(private readonly boardService: BoardService, private readonly moveValidationService: MoveValidationService) {}

    getAllPossibleTurns(board: Board, player: Player): Turn[] {
        let jumps: Turn[] = []
        let moves: Turn[] = []

        board.map((pieces: Piece[], row: number) => {
            pieces.map((piece: Piece, col: number) => {
                if (piece.toLowerCase() === player.toLowerCase()) {
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
        let turns: Turn[] = []

        const isKing = board[row][col] === 'B' || board[row][col] === 'W'
        const maxSteps = isKing ? settings.board.rowCount - 1 : 2

        // Search 2 steps, so a single jump, away for both pawns and kings
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
                        const newBoard = this.boardService.applyTurn(board, newTurn)

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

    getMovesFrom(board: Board, row: number, col: number): Turn[] {
        let turns = []

        if (board[row][col] === 'B' || board[row][col] === 'W') {
            // Search more than 1 step away just for kings
            for (let steps = 2; steps < settings.board.rowCount; steps += 1) {
                directions.map(([rowdir, coldir]) => {
                    // console.log(this.isValid(board, row, col, row + rowdir * r, col + coldir * c))
                    if (this.isValid(board, row, col, row + rowdir * steps, col + coldir * steps) === 'OK') {
                        turns.push([{ fromRow: row, fromCol: col, toRow: row + rowdir * steps, toCol: col + coldir * steps }])
                    }
                })
            }
        }

        // Search 1 step awway for both pawns and kings
        directions.map(([rowdir, coldir]) => {
            if (this.isValid(board, row, col, row + rowdir, col + coldir) === 'OK') {
                turns.push([{ fromRow: row, fromCol: col, toRow: row + rowdir, toCol: col + coldir }])
            }
        })

        return turns
    }

    private isValid(board: Board, fromRow: number, fromCol: number, toRow: number, toCol: number) {
        return this.moveValidationService.isValid(board, fromRow, fromCol, toRow, toCol)
    }

}
