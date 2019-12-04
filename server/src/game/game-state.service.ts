import { Injectable } from '@nestjs/common'

import { Move, BoardService, Player } from '../board/board.service'
import { VoiceService } from '../voice/voice.service'
import { BoardEvaluationService, Winner } from '../ai/board-evaluation.service'

export interface PlayerMove {
    player: Player,
    move: Move
}

interface GameState {
    startedAt?: Date;
    endedAt?: Date;
    moves: PlayerMove[];
    winner?: Winner;
}

@Injectable()
export class GameStateService {

    state: GameState = {
        moves: [],
        startedAt: null,
        endedAt: null,
        winner: null
    }

    constructor(private readonly boardService: BoardService, private readonly boardEvaluationService: BoardEvaluationService, private readonly voiceService: VoiceService) {}

    addMove(player: Player, move: Move) {
        if (!this.state.startedAt) {
            this.state = {
                startedAt: new Date(),
                endedAt: null,
                moves: [{ player: player, move: move}]
            }

            this.voiceService.triggerGameStart()
        } else {
            this.state.moves = [...this.state.moves, { player: player, move: move}]
        }
    }

    restart() {
        this.state = {
            moves: [],
            startedAt: null,
            endedAt: null,
            winner: null
        }
        
        this.voiceService.triggerGameEnd(this.state.winner)
    }

    end() {
        this.state.endedAt = new Date()
        this.state.winner = this.boardEvaluationService.getWinner(this.boardService.get())
        this.voiceService.triggerGameEnd(this.state.winner)
    }

}
