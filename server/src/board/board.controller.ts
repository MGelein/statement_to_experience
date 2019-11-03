import { Controller, Get, Header, Param } from '@nestjs/common'
import { BoardService, Board, Piece, Player } from './board.service'

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get()
  list(): Board {
    return this.boardService.get()
  }

  @Get('csv')
  @Header('Content-Type', 'text/plain')
  csv(): string {
    return this.boardService.get().map((row: Piece[]) => Object.keys(row).map((key: string) => row[key]).join('')).join('\n')
  }

  @Get('move/:from/:to')
  move(@Param() params): string {
    const [fromRow, fromCol] = params.from.split('.')
    const [toRow, toCol] = params.to.split('.')

    console.log(`Move ${params.player === 'b' ? 'black' : 'white'} from ${params.from} to $params.to`)
    
    return this.boardService.move(fromRow as number, fromCol as number, toRow as number, toCol as number)
  }

}
