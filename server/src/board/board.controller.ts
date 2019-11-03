import { Controller, Get, Header, Param } from '@nestjs/common'
import { BoardService, Board, Piece, Player } from './board.service'
import { MinimaxService } from '../minimax/minimax.service'

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService, private readonly minimaxService: MinimaxService) {}

  simulationInterval: any = null

  @Get()
  list(): Board {
    return this.boardService.get()
  }

  @Get('restart')
  restart(): string {
    this.boardService.restart()
    clearInterval(this.simulationInterval)

    console.log('Command: Restart the game.')

    return 'OK'
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

    console.log(`Human: Move white from ${params.from} to ${params.to}.`)
    const humanMove = this.boardService.move(fromRow as number, fromCol as number, toRow as number, toCol as number)

    if (humanMove === 'OK') {
      const aiMove = this.minimaxService.run('b')

      console.log(`AI: Move black from ${aiMove[0].fromRow}.${aiMove[0].fromCol} to ${aiMove[0].toRow}.${aiMove[0].toCol}.`)
      this.boardService.move(aiMove[0].fromRow, aiMove[0].fromCol, aiMove[0].toRow, aiMove[0].toCol)
    }


    return humanMove
  }

  @Get('simulate')
  simulate(): string {
    let nextPlayer: Player = 'b'

    this.simulationInterval = setInterval(() => {
      const aiMove = this.minimaxService.run(nextPlayer)

      console.log(`AI: Move ${nextPlayer === 'b' ? 'black' : 'white'} from ${aiMove[0].fromRow}.${aiMove[0].fromCol} to ${aiMove[0].toRow}.${aiMove[0].toCol}.`)
      this.boardService.move(aiMove[0].fromRow, aiMove[0].fromCol, aiMove[0].toRow, aiMove[0].toCol)

      nextPlayer = nextPlayer === 'b' ? 'w' : 'b'
    }, 500)

    return 'Game simulation started'
  }

}
