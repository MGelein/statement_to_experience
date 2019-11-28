import { Injectable } from '@nestjs/common'

import { BoardService, Move, BoardState } from '../board/board.service'
import { MinimaxService } from './minimax.service'
import { settings } from '../settings'
import { VoiceService } from '../voice/voice.service'
import { MoveGenerationService } from '../game/move-generation.service'
import { GameStateService, PlayerMove } from '../game/game-state.service'
import { BoardEvaluationService } from '../ai/board-evaluation.service'
import { MoveValidationService } from '../game/move-validation.service'
import { RobotCommandsService } from '../robot/robot-commands.service'

@Injectable()
export class AIService {

    constructor(private readonly boardService: BoardService,
        private readonly gameStateService: GameStateService,
        private readonly minimaxService: MinimaxService,
        private readonly boardEvaluationService: BoardEvaluationService,
        private readonly robotCommandsService: RobotCommandsService) {}

    async play(): Promise<boolean> {
        const turn = this.minimaxService.runMinimax(this.boardService.get(), settings.ai.minimaxDepth, 'b', true)
        
        if (turn && turn.length > 0) {
            console.log(turn)
            const boardState:BoardState = this.boardService.applyTurn(this.boardService.get(), turn)
            console.log(boardState.removed)
            
            this.robotCommandsService.applyTurn(turn, boardState.removed)
            
            this.boardService.update(boardState.board)
            if (this.boardEvaluationService.hasEnded(this.boardService.get())) {
                console.log('Game has ended')
                this.gameStateService.end()
            }

            return Promise.resolve(true)
        } else {
            console.log('Game has ended')
            this.gameStateService.end()
        }
      }

}
