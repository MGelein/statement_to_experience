import { Injectable } from '@nestjs/common'

import { BoardService, Player, Piece } from '../board/board.service'

export interface Move {
    fromRow: number;
    fromCol: number;
    toRow: number;
    toCol: number;
}

@Injectable()
export class MinimaxService {

    constructor(private readonly boardService: BoardService) {}

    run(player: Player): Move[] {
        const possibleMoves = this.getAllPossibleMoves(player)

        // TODO: currently just a random choice, should change to minimax evaluation
        const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)]

        return [move]
    }

    getAllPossibleMoves(player: Player): Move[] {
        let moves = []
        const board = this.boardService.get()

        board.map((pieces: Piece[], row: number) => {
            pieces.map((piece: Piece, col: number) => {
                if (piece === player) {
                    moves = moves.concat(this.getMovesFrom(row, col))
                }
            })
        })

        return moves
    }

    getMovesFrom(row: number, col: number) {
        let moves = []

        // Move to an empty cell
        if (this.boardService.isValid(row, col, row - 1, col - 1) === 'OK') { // top left
            moves.push({ fromRow: row, fromCol: col, toRow: row - 1, toCol: col - 1 })
        }

        if (this.boardService.isValid(row, col, row - 1, col + 1) === 'OK') { // top right
            moves.push({ fromRow: row, fromCol: col, toRow: row - 1, toCol: col + 1 })
        }

        if (this.boardService.isValid(row, col, row + 1, col - 1) === 'OK') { // bottom left
            moves.push({ fromRow: row, fromCol: col, toRow: row + 1, toCol: col - 1 })
        }

        if (this.boardService.isValid(row, col, row + 1, col + 1) === 'OK') { // bottom right
            moves.push({ fromRow: row, fromCol: col, toRow: row + 1, toCol: col + 1 })
        }

        // Jump over another piece
        if (this.boardService.isValid(row, col, row - 2, col - 2) === 'OK') { // top left
            moves.push({ fromRow: row, fromCol: col, toRow: row - 2, toCol: col - 2 })
        }

        if (this.boardService.isValid(row, col, row - 2, col + 2) === 'OK') { // top right
            moves.push({ fromRow: row, fromCol: col, toRow: row - 2, toCol: col + 2 })
        }

        if (this.boardService.isValid(row, col, row + 2, col - 2) === 'OK') { // bottom left
            moves.push({ fromRow: row, fromCol: col, toRow: row + 2, toCol: col - 2 })
        }

        if (this.boardService.isValid(row, col, row + 2, col + 2) === 'OK') { // bottom right
            moves.push({ fromRow: row, fromCol: col, toRow: row + 2, toCol: col + 2 })
        }

        return moves
    }

}
