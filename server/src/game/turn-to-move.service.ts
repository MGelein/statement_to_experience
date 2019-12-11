import { Injectable } from '@nestjs/common'

import { Move, Turn, Board } from '../board/board.service'
import { MoveGenerationService } from './move-generation.service'
import { MoveValidationService } from './move-validation.service'

@Injectable()
export class TurnToMoveService {

    constructor(private readonly moveGenerationService: MoveGenerationService, private readonly moveValidationService: MoveValidationService) {}

    getTurnFromMove(board: Board, move: Move): Turn | string {
        const isValid = this.moveValidationService.isValid(board, move.fromRow, move.fromCol, move.toRow, move.toCol)

        if (isValid === 'OK') {
            // Single move or jump
            return [move]
        } else {
            const jumps = this.moveGenerationService.getJumpsFrom(board, move.fromRow, move.fromCol)

            // Return the first multi-jump which goes to the right position
            for (let turn of jumps) {
                const lastMove = turn[turn.length - 1]
                if (lastMove.toRow === move.toRow && lastMove.toCol === move.toCol) {
                    return turn
                }
            }
    
            return isValid
        }

    }

}
