import { Injectable } from '@nestjs/common'

import { BoardService, Player, Piece } from '../board/board.service'

export interface Move {
    fromRow: number;
    fromCol: number;
    toRow: number;
    toCol: number;
}

export type Turn = Move[]

@Injectable()
export class MinimaxService {

    constructor(private readonly boardService: BoardService) {}

    run(player: Player): Turn {
        const possibleTurns = this.getAllPossibleTurns(player)

        if (possibleTurns.length === 0) {
            return []
        }

        // TODO: currently just a random choice, should change to minimax evaluation
        const turn = possibleTurns[Math.floor(Math.random() * possibleTurns.length)]
        
        return turn
    }

    getAllPossibleTurns(player: Player): Turn[] {
        let jumps: Turn[] = []
        let moves: Turn[] = []
        const board = this.boardService.get()

        board.map((pieces: Piece[], row: number) => {
            pieces.map((piece: Piece, col: number) => {
                if (piece === player) {
                    let hasJumps = false
                    this.getJumpsFrom(row, col).map((turn: Turn) => {
                        if (turn.length !== 0) {
                            jumps.push(turn)
                            hasJumps = true
                        }
                    })

                    if (!hasJumps) {
                        moves = [...moves, ...this.getMovesFrom(row, col)]
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

    getJumpsFrom(row: number, col: number, previousTurn: Turn = []): Turn[] {
        let turns = [previousTurn]

        if (this.boardService.isValid(row, col, row - 2, col - 2) === 'OK') { // top left
            const newTurn = [...previousTurn, { fromRow: row, fromCol: col, toRow: row - 2, toCol: col - 2 }]
            const withMultiJumps = this.getJumpsFrom(row - 2, col - 2, newTurn)
            turns = [...turns, ...withMultiJumps]
        }

        if (this.boardService.isValid(row, col, row - 2, col + 2) === 'OK') { // top right
            const newTurn = [...previousTurn, { fromRow: row, fromCol: col, toRow: row - 2, toCol: col + 2 }]
            const withMultiJumps = this.getJumpsFrom(row - 2, col + 2, newTurn)
            turns = [...turns, ...withMultiJumps]
        }

        if (this.boardService.isValid(row, col, row + 2, col - 2) === 'OK') { // bottom left
            const newTurn = [...previousTurn, { fromRow: row, fromCol: col, toRow: row + 2, toCol: col - 2 }]
            const withMultiJumps = this.getJumpsFrom(row + 2, col - 2, newTurn)
            turns = [...turns, ...withMultiJumps]
        }

        if (this.boardService.isValid(row, col, row + 2, col + 2) === 'OK') { // bottom right
            const newTurn = [...previousTurn, { fromRow: row, fromCol: col, toRow: row + 2, toCol: col + 2 }]
            const withMultiJumps = this.getJumpsFrom(row + 2, col + 2, newTurn)
            turns = [...turns, ...withMultiJumps]
        }

        return turns
    }

    getMovesFrom(row: number, col: number): Turn[] {
        let turns = []

        if (this.boardService.isValid(row, col, row - 1, col - 1) === 'OK') { // top left
            turns.push([{ fromRow: row, fromCol: col, toRow: row - 1, toCol: col - 1 }])
        }

        if (this.boardService.isValid(row, col, row - 1, col + 1) === 'OK') { // top right
            turns.push([{ fromRow: row, fromCol: col, toRow: row - 1, toCol: col + 1 }])
        }

        if (this.boardService.isValid(row, col, row + 1, col - 1) === 'OK') { // bottom left
            turns.push([{ fromRow: row, fromCol: col, toRow: row + 1, toCol: col - 1 }])
        }

        if (this.boardService.isValid(row, col, row + 1, col + 1) === 'OK') { // bottom right
            turns.push([{ fromRow: row, fromCol: col, toRow: row + 1, toCol: col + 1 }])
        }

        return turns
    }

}
