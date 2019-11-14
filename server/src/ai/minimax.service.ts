import { Injectable } from '@nestjs/common'

import { Player, Board, BoardService, Turn } from '../board/board.service'
import { MoveGenerationService } from '../game/move-generation.service'
import { BoardEvaluationService } from './board-evaluation.service'
import { VoiceService } from '../voice/voice.service'
import { settings } from '../settings'

@Injectable()
export class MinimaxService {

    winningLeaveCount: number = 0
    totalLeaveCount: number = 0

    lastWinChance: number = 0

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

        if (Math.random() > settings.ai.strength) {
            return this.runRandom(board, player)
        }

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

        const winChance = this.winningLeaveCount / this.totalLeaveCount
        const winChanceDiff = Math.abs(winChance - this.lastWinChance)
        const winChanceSign = this.lastWinChance > winChance ? '-' : '+'
        console.log(`AI: win-chance=${Math.round(winChance * 100)}% (${winChanceSign}${Math.round(winChanceDiff * 100)}%), advantage=${maxScore}, eval-time=${duration}s (depth=${depth})`)

        this.winningLeaveCount = 0
        this.totalLeaveCount = 0
        this.lastWinChance = winChance

        if (maxScore === Number.MAX_VALUE) {
            this.voiceService.triggerAICanWin()
        }

        return maxTurn
    }

    evaluateRecursively(board: Board, depth: number, player: Player, maximizing: boolean, alpha: number, beta: number, alphaBetaPruning: boolean): number {
        if (this.boardEvaluationService.hasEnded(board) || depth === 0) {
            const boardAfterQuiescenceSearch = this.runQuiescenceSearch(board, player)
            const score = this.boardEvaluationService.evaluate(boardAfterQuiescenceSearch, player)

            if (score >= 0) this.winningLeaveCount++
            this.totalLeaveCount++

            return score
        }

        const playFromPerspective = maximizing ? player : (player === 'b' ? 'w' : 'b')
        const possibleTurns = this.moveGenerationService.getAllPossibleTurns(board, playFromPerspective)
        
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

    private runQuiescenceSearch(board: Board, player: Player ) {
        // TODO: implement quiescence search
        // Check if there are any forced jumps at this move. If so, make these jumps, and then keep checking for the alternating player,
        // until there are no more forced jumps. Then evaluate the board at that position
            
        return board
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

     /**
      * Quiescence search:
      * 
      * One critical advanced notion for checkers AI specifically is the concept of Quiescence search: imagine that you go down six moves into your tree,
      * and at the tail end your opponent has just made a capture where your (forced) reply is an immediate recapture. Unfortunately,
      * the positional evaluation function can't see the recapture, so it evaluates the position as being a piece up for your opponent even though
      * you're about to regain parity. Quiescence search is an attempt to solve this problem by forcing the evaluator to go down into a branch
      * until all possible forced captures have been made, and only then evaluate the position.
      */

}
