import { Controller, Get, Put, Body, Header } from '@nestjs/common'
import { BoardService, Board, Piece } from './board.service'

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
  
  // @Put()
  // update(@Body() body: any) {
  //   const newPeople = Object.keys(body).reduce((row: BoardRow[], key: string) => {
  //     row.push(({ id: Number(key), x: body[key][0], y: body[key][1], w: body[key][2], h: body[key][3] }))
  //     return row
  //   }, [])
    
  //   this.boardService.update(newPeople)

  //   return true
  // }

}
