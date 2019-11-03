import { Injectable } from '@nestjs/common'

import { Player, Board, BoardService, Turn } from '../board/board.service'
import { MoveEvaluationService } from '../game/move-evaluation.service'
import { BoardEvaluationService } from './board-evaluation.service'

@Injectable()
export class MinimaxService {

    constructor(private readonly boardService: BoardService, private readonly moveEvaluationService: MoveEvaluationService, private readonly boardEvaluationService: BoardEvaluationService) {}

    runRandom(board: Board, player: Player): Turn {
        const possibleTurns = this.moveEvaluationService.getAllPossibleTurns(JSON.parse(JSON.stringify(board)), player)

        if (possibleTurns.length === 0) {
            return []
        }

        return possibleTurns[Math.floor(Math.random() * possibleTurns.length)]
    }

    runMinimax(board: Board, depth: number, player: Player): Turn {
        if (this.boardEvaluationService.hasEnded(board) || depth === 0) {
            return []
        }

        const possibleTurns = this.moveEvaluationService.getAllPossibleTurns(board, player)        
        if (possibleTurns.length === 0) {
            return []
        }

        let bestTurn: Turn = possibleTurns[0]
        let bestScore: number = -1
        possibleTurns.map((turn: Turn) => {
            const newBoard = this.boardService.applyTurn(board, turn)

            const opponent = player === 'b' ? 'w' : 'b'
            const bestSubTurn = this.runMinimax(newBoard, depth - 1, opponent)
            const boardAfterBestSubTurn = this.boardService.applyTurn(newBoard, turn)

            const score = this.boardEvaluationService.evaluate(boardAfterBestSubTurn, player)

            if (score > bestScore) {
                bestTurn = bestSubTurn
                bestScore = score
            }
        })

        return bestTurn
    }

    /**
     * Improvements over basic minimax:
     * 
     * It doesn't do any alpha-beta pruning, it doesn't use transposition tables to cut down on re-evaluating the same position,
     * and it doesn't do any sort of quiescence search or similar adaptive-depth techniques to avoid misevaluating positions
     * where a forced-capture is on the horizon of your search. What's more, for practical considerations you might not want
     * to use explicit recursion for the minimax, and instead maintain a stack yourself, and there are plenty of other
     * object-management optimizations that you would want to make for a practical implementation of the algorithm (rather than a quick-and-dirty one)
     * 
     * Source: https://gamedev.stackexchange.com/questions/31166/how-to-utilize-minimax-algorithm-in-checkers-game
     */

}
