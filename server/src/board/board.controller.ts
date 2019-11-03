import { Controller, Get, Header, Param } from '@nestjs/common'
import { BoardService, Board, Piece, Player } from './board.service'
import { MinimaxService } from '../minimax/minimax.service'

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService, private readonly minimaxService: MinimaxService) {}

  simulationInterval: any = null
  simulationDelayMs: number = 1000

  debugLogging: boolean = false

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

    if (this.debugLogging) console.log(`Human: Move white from ${params.from} to ${params.to}.`)
    const humanMove = this.boardService.move(fromRow as number, fromCol as number, toRow as number, toCol as number)

    if (humanMove === 'OK') {
      const aiMoves = this.minimaxService.run('b')

      if (aiMoves.length > 0) {
        if (this.debugLogging) console.log(`AI: Move black from ${aiMoves[0].fromRow}.${aiMoves[0].fromCol} to ${aiMoves[0].toRow}.${aiMoves[0].toCol}.`)
        this.boardService.move(aiMoves[0].fromRow, aiMoves[0].fromCol, aiMoves[0].toRow, aiMoves[0].toCol)
      }
    }


    return humanMove
  }

  @Get('simulate')
  simulate(): string {
    if (this.debugLogging) console.log('Starting game simulation')
    let nextPlayer: Player = 'b'

    this.simulationInterval = setInterval(() => {
      const aiMoves = this.minimaxService.run(nextPlayer)

      if (aiMoves.length > 0) {
        if (this.debugLogging) console.log(`AI: Move ${nextPlayer === 'b' ? 'black' : 'white'} from ${aiMoves[0].fromRow}.${aiMoves[0].fromCol} to ${aiMoves[0].toRow}.${aiMoves[0].toCol}.`)
        this.boardService.move(aiMoves[0].fromRow, aiMoves[0].fromCol, aiMoves[0].toRow, aiMoves[0].toCol)
      }

      nextPlayer = nextPlayer === 'b' ? 'w' : 'b'
    }, this.simulationDelayMs)

    return 'Game simulation started'
  }

}
