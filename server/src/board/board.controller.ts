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
    return this.boardService.get().map((row: Piece[]) => Object.keys(row).map((key: string) => row[key]).join(',')).join('\n')
  }

  @Get('move/:player/:fromRow/:fromCol/:toRow/:toCol')
  move(@Param() params): string {
    console.log(`Move ${params.player === 'b' ? 'black' : 'white'} from (${params.fromRow}, ${params.fromCol}) to (${params.toRow}, ${params.toCol})`)
    
    return this.boardService.move(params.player as Player, params.fromRow as number, params.fromCol as number, params.toRow as number, params.toCol as number)
  }

}
