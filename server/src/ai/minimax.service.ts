import { Injectable } from '@nestjs/common'

import { Player, Board, BoardService, Turn } from '../board/board.service'
import { MoveGenerationService } from '../game/move-generation.service'
import { BoardEvaluationService } from './board-evaluation.service'
import { VoiceService } from '../voice/voice.service'

@Injectable()
export class MinimaxService {

    constructor(
        private readonly boardService: BoardService, 
        private readonly voiceService: VoiceService,
        private readonly moveGenerationService: MoveGenerationService,
        private readonly boardEvaluationService: BoardEvaluationService) {}

    runRandom(board: Board, player: Player): Turn {
        const possibleTurns = this.moveGenerationService.getAllPossibleTurns(JSON.parse(JSON.stringify(board)), player)

        if (possibleTurns.length === 0) {
            return []
        }
        
        return possibleTurns[Math.floor(Math.random() * possibleTurns.length)]
    }

    runMinimax(board: Board, depth: number, player: Player, alphaBetaPruning: boolean = true): Turn {
        const start = new Date()

        const possibleTurns = this.moveGenerationService.getAllPossibleTurns(board, player)        
        if (possibleTurns.length === 0) {
            return []
        }

        let alpha = -Number.MAX_VALUE
        let beta = Number.MAX_VALUE

        let maxTurn: Turn = possibleTurns[0]
        let maxScore = -Number.MAX_VALUE
        possibleTurns.map((turn: Turn) => {
            const newBoard = this.boardService.applyTurn(board, turn)

            const score = this.evaluateRecursively(newBoard, depth - 1, player, false, alpha, beta, alphaBetaPruning)

            if (score > maxScore) {
                maxTurn = turn
                maxScore = score
            }

            if (alphaBetaPruning) {
                if (score > alpha) {
                    alpha = score
                }

                if (alpha >= beta) {
                    return maxTurn
                }
            }
        })

        const end = new Date()
        const duration = Math.round(((end.getTime() - start.getTime()) / 1000) * 100) / 100

        console.log(`Minimax evaluation ran in ${duration}s and max score is ${maxScore} (depth = ${depth}).`)

        if (maxScore === Number.MAX_VALUE) {
            this.voiceService.triggerAICanWin()
        }

        return maxTurn
    }

    evaluateRecursively(board: Board, depth: number, player: Player, maximizing: boolean, alpha: number, beta: number, alphaBetaPruning: boolean): number {
        if (this.boardEvaluationService.hasEnded(board) || depth === 0) {
            return this.boardEvaluationService.evaluate(board, player)
        }

        const possibleTurns = this.moveGenerationService.getAllPossibleTurns(board, player)
        
        if (maximizing) {
            let maxScore = -Number.MAX_VALUE
            possibleTurns.map((turn: Turn) => {
                const newBoard = this.boardService.applyTurn(board, turn)
                const score = this.evaluateRecursively(newBoard, depth - 1, player, false, alpha, beta, alphaBetaPruning)

                if (score > maxScore) {
                    maxScore = score
                }

                if (alphaBetaPruning) {
                    if (score > alpha) {
                        alpha = score
                    }

                    if (alpha >= beta) {
                        return maxScore
                    }
                }
            })

            return maxScore
        } else {
            let minScore = Number.MAX_VALUE
            possibleTurns.map((turn: Turn) => {
                const newBoard = this.boardService.applyTurn(board, turn)
                const score = this.evaluateRecursively(newBoard, depth - 1, player, true, alpha, beta, alphaBetaPruning)

                if (score < minScore) {
                    minScore = score
                }

                if (alphaBetaPruning) {
                    if (score < beta) {
                        beta = score
                    }

                    if (alpha >= beta) {
                        return minScore
                    }
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
