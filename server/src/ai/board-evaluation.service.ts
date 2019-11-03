import { Injectable } from '@nestjs/common'

import { BoardService, Player } from '../board/board.service'

@Injectable()
export class BoardEvaluationService {

    constructor(private readonly boardService: BoardService) {}

    evaluate(forPlayer: Player): number {
        // this.boardService.get().map((pieces: Piece[]) => {
        //     pieces.map((piece: Piece) => {
                
        //     })
        // })
        return 0
    }

}
