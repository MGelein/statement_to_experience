import { Injectable } from '@nestjs/common'

import { Move } from '../board/board.service'
import { VoiceService } from '../voice/voice.service'

interface GameState {
    startedAt?: Date;
    endedAt?: Date;
    moves: Move[]
}

@Injectable()
export class GameStateService {

    state: GameState = {
        moves: [],
        endedAt: new Date()
    }

    constructor(private readonly voiceService: VoiceService) {}

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
        this.voiceService.triggerGameEnd()
    }

    end() {
        this.state.endedAt = new Date()
        this.voiceService.triggerGameEnd()
    }

}
