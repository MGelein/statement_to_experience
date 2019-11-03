import { Injectable } from '@nestjs/common'

import { Player } from '../board/board.service'
import { MoveEvaluationService } from './move-evaluation.service'

export interface Move {
    fromRow: number;
    fromCol: number;
    toRow: number;
    toCol: number;
}

export type Turn = Move[]

@Injectable()
export class MinimaxService {

    constructor(private readonly moveEvaluationService: MoveEvaluationService) {}

    run(player: Player): Turn {
        const possibleTurns = this.moveEvaluationService.getAllPossibleTurns(player)

        if (possibleTurns.length === 0) {
            return []
        }

        // TODO: currently just a random choice, should change to minimax evaluation
        const turn = possibleTurns[Math.floor(Math.random() * possibleTurns.length)]
        
        return turn
    }

}
