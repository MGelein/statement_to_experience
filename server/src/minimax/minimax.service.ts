import { Injectable } from '@nestjs/common'

import { BoardService } from '../board/board.service'

@Injectable()
export class MinimaxService {

    constructor(private readonly boardService: BoardService) {}

//   run(position, depth, maximizingPlayer): Move {
//     return this.board
//   }

}
