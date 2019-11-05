import { Injectable } from '@nestjs/common'

import { Move, BoardService } from '../board/board.service'
import { VoiceService } from '../voice/voice.service'
import { BoardEvaluationService, Winner } from '../ai/board-evaluation.service'

interface GameState {
    startedAt?: Date;
    endedAt?: Date;
    moves: Move[];
    winner?: Winner;
}

@Injectable()
export class GameStateService {

    state: GameState = {
        moves: [],
        endedAt: new Date()
    }

    constructor(private readonly boardService: BoardService, private readonly boardEvaluationService: BoardEvaluationService, private readonly voiceService: VoiceService) {}

    addMove(move: Move) {
        if (this.state.endedAt) {
            this.state = {
                startedAt: new Date(),
                moves: [move]
            }

            this.voiceService.triggerGameStart()
        } else {
            this.state.moves = [...this.state.moves, move]
        }
    }

    restart() {
        this.state.endedAt = new Date()
        this.state.winner = this.boardEvaluationService.getWinner(this.boardService.get())
        this.voiceService.triggerGameEnd(this.state.winner)
    }

    end() {
        this.state.endedAt = new Date()
        this.state.winner = this.boardEvaluationService.getWinner(this.boardService.get())
        this.voiceService.triggerGameEnd(this.state.winner)
    }

}
