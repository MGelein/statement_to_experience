import { Controller, Get, Header, Param } from '@nestjs/common'

import { BoardService, Board, Piece, Player, Move } from './board.service'
import { MinimaxService } from '../ai/minimax.service'
import { settings } from '../settings'
import { VoiceService } from '../voice/voice.service'
import { MoveGenerationService } from '../game/move-generation.service'

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService,
    private readonly minimaxService: MinimaxService,
    private readonly voiceService: VoiceService,
    private readonly moveGenerationService: MoveGenerationService) {}

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

    const turn = this.minimaxService.runMinimax(this.boardService.get(), settings.ai.minimaxDepth, 'b', true)

    if (turn && turn.length > 0) {
      turn.map((move: Move) => {
        this.boardService.move(move.fromRow, move.fromCol, move.toRow, move.toCol)
      })
    } else {
      console.log('Game has ended')
    }
    
    this.lastAIMoveAt = new Date().getTime()

    return 'OK'
  }

  @Get('move/:from/:to/:end')
  move(@Param() params): string {
    const [fromRow, fromCol] = params.from.split('.')
    const [toRow, toCol] = params.to.split('.')

    const humanMove = this.boardService.move(Number(fromRow), Number(fromCol), Number(toRow), Number(toCol))

    if (humanMove !== 'OK') {
      this.voiceService.triggerInvalidMove(humanMove)
    } else {
      const jumpsFromHere = this.moveGenerationService.getJumpsFrom(this.boardService.get(), Number(toRow), Number(toCol))

      // No more jumps are possible, so the turn ends
      if (jumpsFromHere.length === 0) {
        const moveDuration = ((new Date().getTime()) - this.lastAIMoveAt) / 1000
        if (this.lastAIMoveAt !== 0 && moveDuration > 10) {
          this.voiceService.triggerSlowMove(moveDuration)
        }
    
        const startEvaluation = new Date().getTime()
        const turn = this.minimaxService.runMinimax(this.boardService.get(), settings.ai.minimaxDepth, 'b', true)
        const endEvaluation = new Date().getTime()

        if (turn && turn.length > 0) {
          // Wait at least a short while until applying the move, because if it happens too fast (less than a few hundred ms)
          // after the person's move, then the digital display will show both turns at the same time, which is confusing
          setTimeout(() => {
            turn.map((move: Move) => {
              this.boardService.move(move.fromRow, move.fromCol, move.toRow, move.toCol)
            })
          }, Math.max(0, (settings.ai.minEvaluationTimeInSeconds * 1000) - (endEvaluation - startEvaluation)))
        } else {
          console.log('Game has ended')
        }
        
        this.lastAIMoveAt = new Date().getTime()  
      }
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
        ? this.minimaxService.runMinimax(this.boardService.get(), settings.ai.minimaxDepth - 2, nextPlayer, settings.ai.alphaBetaPruning)
        : this.minimaxService.runMinimax(this.boardService.get(), settings.ai.minimaxDepth, nextPlayer, settings.ai.alphaBetaPruning)

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
