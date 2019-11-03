import { Injectable } from '@nestjs/common'

import { Player, Piece, Board } from '../board/board.service'

import { settings } from '../settings'

type PieceCounts = { [key: string]: number }

@Injectable()
export class BoardEvaluationService {

    // TODO: implement row-based evaluation method
    evaluate(board: Board, player: Player): number {
        const counts = this.countPieces(board)

        const playerValue = settings.basePawnValue * counts[player] + settings.baseKingValue * counts[player.toUpperCase()]
        const opponent = player === 'b' ? 'w' : 'b'
        const opponentValue = settings.basePawnValue * counts[opponent] + settings.baseKingValue * counts[opponent.toUpperCase()]

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
