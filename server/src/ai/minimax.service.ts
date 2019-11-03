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
        const start = new Date()

        const possibleTurns = this.moveEvaluationService.getAllPossibleTurns(board, player)        
        if (possibleTurns.length === 0) {
            return []
        }

        let maxTurn: Turn = possibleTurns[0]
        let maxScore = -999999999
        possibleTurns.map((turn: Turn) => {
            const newBoard = this.boardService.applyTurn(board, turn)
            const score = this.evaluateRecursively(newBoard, depth - 1, player, false)

            if (score > maxScore) {
                maxTurn = turn
                maxScore = score
            }
        })

        const end = new Date()
        const duration = Math.round(((end.getTime() - start.getTime()) / 1000) * 100) / 100

        console.log(`Max score for ${player} after ${depth}-level evaluations is ${maxScore}`)
        console.log(`Minimax algorithm ran in ${duration}s`)

        return maxTurn
    }

    evaluateRecursively(board: Board, depth: number, player: Player, maximizing: boolean): number {
        if (this.boardEvaluationService.hasEnded(board) || depth === 0) {
            return this.boardEvaluationService.evaluate(board, player)
        }

        const possibleTurns = this.moveEvaluationService.getAllPossibleTurns(board, player)
        
        if (maximizing) {
            let maxScore = -999999999
            possibleTurns.map((turn: Turn) => {
                const newBoard = this.boardService.applyTurn(board, turn)
                const score = this.evaluateRecursively(newBoard, depth - 1, player, false)

                if (score > maxScore) {
                    maxScore = score
                }
            })

            return maxScore
        } else {
            let minScore = 999999999
            possibleTurns.map((turn: Turn) => {
                const newBoard = this.boardService.applyTurn(board, turn)
                const score = this.evaluateRecursively(newBoard, depth - 1, player, true)

                if (score < minScore) {
                    minScore = score
                }
            })

            return minScore
        }
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
