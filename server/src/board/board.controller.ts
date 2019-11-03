import { Controller, Get, Header, Param } from '@nestjs/common'
import { BoardService, Board, Piece, Player } from './board.service'
import { MinimaxService, Move } from '../ai/minimax.service'

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
      const turn = this.minimaxService.run('b')

      if (turn && turn.length > 0) {
        turn.map((move: Move) => {
          if (this.debugLogging) console.log(`AI: Move black from ${move.fromRow}.${move.fromCol} to ${move.toRow}.${move.toCol}.`)
          this.boardService.move(move.fromRow, move.fromCol, move.toRow, move.toCol)
        })
      }
    }

    return humanMove
  }

  @Get('simulate')
  simulate(): string {
    console.log('Command: Start a game simulation.')
    let nextPlayer: Player = 'b'

    this.simulationInterval = setInterval(() => {
      const turn = this.minimaxService.run(nextPlayer)

      if (turn && turn.length > 0) {
        turn.map((move: Move) => {
          if (this.debugLogging) console.log(`AI: Move ${nextPlayer === 'b' ? 'black' : 'white'} from ${move.fromRow}.${move.fromCol} to ${move.toRow}.${move.toCol}.`)
          this.boardService.move(move.fromRow, move.fromCol, move.toRow, move.toCol)
        })
      }

      nextPlayer = nextPlayer === 'b' ? 'w' : 'b'
    }, this.simulationDelayMs)

    return 'Game simulation started'
  }

}
