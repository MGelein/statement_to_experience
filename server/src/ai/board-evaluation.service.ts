import { Injectable } from '@nestjs/common'

import { Player, Piece, Board } from '../board/board.service'

import { settings } from '../settings'

type PieceCounts = { [key: string]: number }

type EvaluationMethod = 'base' | 'position-matrix' | 'row'

@Injectable()
export class BoardEvaluationService {
  
    evaluate(board: Board, player: Player, method: EvaluationMethod = 'position-matrix'): number {
        const counts = this.countPieces(board)
        const opponent = player === 'b' ? 'w' : 'b' 

        if (this.hasEnded(board) && counts[player] === 0 && counts[player.toUpperCase()] === 0) {
            // The opponent won
            return -Number.MAX_VALUE
        } else if (this.hasEnded(board) && counts[opponent] === 0 && counts[opponent.toUpperCase()] === 0) {
            // The player won
            return Number.MAX_VALUE
        }

        if (method === 'base') {
            return this.baseEvaluation(board, player)
        } else if (method === 'row') {
            return this.rowBasedEvaluation(board, player)
        } else {
            return this.positionBasedEvaluation(board, player)
        }
    }

    private baseEvaluation(board: Board, player: Player): number {
        const counts = this.countPieces(board)
        const opponent = player === 'b' ? 'w' : 'b' 

        const playerValue = settings.basePawnValue * counts[player] + settings.baseKingValue * counts[player.toUpperCase()]
        const opponentValue = settings.basePawnValue * counts[opponent] + settings.baseKingValue * counts[opponent.toUpperCase()]

        return playerValue - opponentValue
    }

    private rowBasedEvaluation(board: Board, player: Player): number {
        const opponent = player === 'b' ? 'w' : 'b' 
        let playerValue = 0
        let opponentValue = 0

        board.map((pieces: Piece[], row: number) => {
            pieces.map((piece: Piece) => {
                const playerRowValue = player === 'b' ? row : settings.rowCount - row
                const opponentRowValue = opponent === 'b' ? row : settings.rowCount - row

                if (piece === player) playerValue += settings.basePawnValue * playerRowValue
                else if (piece === player.toUpperCase()) playerValue += settings.baseKingValue * playerRowValue
                else if (piece === opponent) opponentValue += settings.basePawnValue * opponentRowValue
                else if (piece === opponent.toUpperCase()) opponentValue += settings.baseKingValue * opponentRowValue
            })
        })

        return playerValue - opponentValue
    }

    private positionBasedEvaluation(board: Board, player: Player): number {
        const opponent = player === 'b' ? 'w' : 'b' 
        let playerValue = 0
        let opponentValue = 0

        board.map((pieces: Piece[], row: number) => {
            pieces.map((piece: Piece, col: number) => {
                if (piece === player) playerValue += settings.basePawnValue * 5 + settings.positionWeights[row][col]
                else if (piece === player.toUpperCase()) playerValue += settings.baseKingValue * 5 + settings.positionWeights[row][col]
                else if (piece === opponent) opponentValue += settings.basePawnValue * 5 + settings.positionWeights[row][col]
                else if (piece === opponent.toUpperCase()) opponentValue += settings.baseKingValue * 5 + settings.positionWeights[row][col]
            })
        })

        return playerValue - opponentValue
    }

    hasEnded(board: Board): boolean {
        const counts = this.countPieces(board)
        
        if ((counts['w'] === 0 && counts['W'] === 0) || (counts['b'] === 0 && counts['B'] === 0)) return true
        else return false
    }

    private countPieces(board: Board): PieceCounts {
        let counts: PieceCounts = { ' ': 0, 'w': 0, 'W': 0, 'b': 0, 'B': 0 }

        board.map((pieces: Piece[]) => {
            pieces.map((piece: Piece) => {
                counts[piece] += 1
            })
        })

        return counts
    }

}
