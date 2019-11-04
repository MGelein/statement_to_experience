import { Injectable } from '@nestjs/common'

import { Player, Piece, Board } from '../board/board.service'

import { settings } from '../settings'

type PieceCounts = { [key: string]: number }

type EvaluationMethod = 'base' | 'position-matrix' | 'row'

@Injectable()
export class BoardEvaluationService {
  
    // TODO: implement row-based evaluation method
    evaluate(board: Board, player: Player, method: EvaluationMethod = 'row'): number {
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
            const playerValue = settings.basePawnValue * counts[player] + settings.baseKingValue * counts[player.toUpperCase()]
            const opponentValue = settings.basePawnValue * counts[opponent] + settings.baseKingValue * counts[opponent.toUpperCase()]

            return playerValue - opponentValue
        } else if (method === 'row') {
            let playerValue = 0
            let opponentValue = 0

            board.map((pieces: Piece[], row: number) => {
                pieces.map((piece: Piece) => {
                    const playerRowValue = player === 'b' ? row : settings.rowCount - row
                    const opponentRowValue = opponent === 'b' ? row : settings.rowCount - row

                    if (piece === player) playerValue += 5 + playerRowValue
                    else if (piece === player.toUpperCase()) playerValue += 7 + playerRowValue
                    else if (piece === opponent) opponentValue += 5 + opponentRowValue
                    else if (piece === opponent.toUpperCase()) opponentValue += 7 + opponentRowValue
                })
            })

            return playerValue - opponentValue
        } else {
            let playerValue = 0
            let opponentValue = 0

            board.map((pieces: Piece[], row: number) => {
                pieces.map((piece: Piece, col: number) => {
                    if (piece === player) playerValue += settings.basePawnValue * settings.positionWeights[row][col]
                    else if (piece === player.toUpperCase()) playerValue += settings.baseKingValue * settings.positionWeights[row][col]
                    else if (piece === opponent) opponentValue += settings.basePawnValue * settings.positionWeights[row][col]
                    else if (piece === opponent.toUpperCase()) opponentValue += settings.baseKingValue * settings.positionWeights[row][col]
                })
            })

            return playerValue - opponentValue
        }
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
