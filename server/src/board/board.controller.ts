import { Controller, Get, Header, Param } from '@nestjs/common'
import { BoardService, Board, Piece, Player, Move } from './board.service'
import { MinimaxService } from '../ai/minimax.service'

import { settings } from '../settings'
import { VoiceService } from '../voice/voice.service'

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService, private readonly minimaxService: MinimaxService, private readonly voiceService: VoiceService) {}

  simulationInterval: any = null
  simulationDelayMs: number = 1000

  debugLogging: boolean = false

  lastAIMoveAt: number = 0

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

  @Get('move/end')
  endMove(): string {
    const moveDuration = ((new Date().getTime()) - this.lastAIMoveAt) / 1000
    if (this.lastAIMoveAt !== 0 && moveDuration > 10) {
      this.voiceService.triggerSlowMove(moveDuration)
    }

    const turn = this.minimaxService.runMinimax(this.boardService.get(), settings.defaultMiniMaxDepth, 'b', true)

    if (turn && turn.length > 0) {
      turn.map((move: Move) => {
        this.boardService.move(move.fromRow, move.fromCol, move.toRow, move.toCol)
      })
    }
    this.lastAIMoveAt = new Date().getTime()

    return 'OK'
  }

  @Get('move/:from/:to/:end')
  move(@Param() params): string {
    const [fromRow, fromCol] = params.from.split('.')
    const [toRow, toCol] = params.to.split('.')

    const humanMove = this.boardService.move(fromRow as number, fromCol as number, toRow as number, toCol as number)

    if (humanMove !== 'OK') {
      this.voiceService.triggerInvalidMove(humanMove)
    }

    return humanMove
  }

  @Get('simulate')
  simulate(): string {
    console.log('Command: Start a game simulation.')
    let nextPlayer: Player = 'w'

    this.simulationInterval = setInterval(() => {
      // const turn = nextPlayer === 'b'
      //   ? this.minimaxService.runRandom(this.boardService.get(), nextPlayer)
      //   : this.minimaxService.runMinimax(this.boardService.get(), settings.defaultMiniMaxDepth, nextPlayer, true)
      const turn = nextPlayer === 'b'
        ? this.minimaxService.runMinimax(this.boardService.get(), settings.defaultMiniMaxDepth - 2, nextPlayer, true)
        : this.minimaxService.runMinimax(this.boardService.get(), settings.defaultMiniMaxDepth, nextPlayer, true)

      if (turn && turn.length > 0) {
        turn.map((move: Move) => {
          this.boardService.move(move.fromRow, move.fromCol, move.toRow, move.toCol)
        })
      } else {
        console.log('Game simulation has ended')
        clearInterval(this.simulationInterval)
      }

      nextPlayer = nextPlayer === 'b' ? 'w' : 'b'
    }, this.simulationDelayMs)

    return 'Game simulation started'
  }

}
