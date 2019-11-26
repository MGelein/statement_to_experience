import { Controller, Get, Post, Body } from '@nestjs/common'

import { StorageService } from '../storage.service'
import { BoardService } from './board.service'

@Controller('board-state')
export class BoardStateController {

  constructor(private readonly boardService: BoardService, private readonly storage: StorageService) {}

  @Post()
  update(@Body() state: any): string {
    const boardState = Object.keys(state).reduce((newState: string[], key: string) => [...newState, state[key]], [])
    console.log(boardState)

    this.boardService.update(boardState)

    return 'OK'
  }

  @Get('square-positions')
  getSquarePositions(): any {
    return this.storage.get('board/square-positions')
  }

  @Post('square-positions')
  saveSquarePositions(@Body() positions: any): string {
    this.storage.set('board/square-positions', positions)

    return 'OK'
  }

}
