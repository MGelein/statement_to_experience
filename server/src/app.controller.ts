import { Controller, Get } from '@nestjs/common'
import { BoardService } from './board/board.service'

@Controller()
export class AppController {
  constructor(private readonly boardService: BoardService) {}

  @Get()
  async index(): Promise<any> {
    return {
      board: this.boardService.get()
    }
  }
}
