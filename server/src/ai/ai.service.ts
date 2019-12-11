import { Injectable } from '@nestjs/common'

import { BoardService, Turn } from '../board/board.service'
import { MinimaxService } from './minimax.service'
import { settings } from '../settings'
import { GameStateService } from '../game/game-state.service'
import { BoardEvaluationService } from '../ai/board-evaluation.service'
import { RobotCommandsService } from '../robot/robot-commands.service'

@Injectable()
export class AIService {

    constructor(private readonly boardService: BoardService,
        private readonly gameStateService: GameStateService,
        private readonly minimaxService: MinimaxService,
        private readonly boardEvaluationService: BoardEvaluationService,
        private readonly robotCommandsService: RobotCommandsService) {}

    async play(): Promise<boolean> {
        return this.minimaxService.runMinimax(this.boardService.get(), settings.ai.minimaxDepth, 'b', true).then(async (turn: Turn) => {
            if (turn && turn.length > 0) {                
                await this.robotCommandsService.applyTurn(turn)
                
                this.boardService.update(this.boardService.applyTurn(this.boardService.get(), turn))

                if (this.boardEvaluationService.hasEnded(this.boardService.get())) {
                    console.log('Game has ended')
                    this.gameStateService.end()
                }

                return Promise.resolve(true)
            } else {
                console.log('Game has ended')
                this.gameStateService.end()
                
                return Promise.resolve(true)
            }
        })
    }

}
