import { Controller, Get, Header, Param } from '@nestjs/common'

import { BoardService, Board, Piece, Player, Move } from './board.service'
import { MinimaxService } from '../ai/minimax.service'
import { settings } from '../settings'
import { VoiceService } from '../voice/voice.service'
import { MoveGenerationService } from '../game/move-generation.service'
import { GameStateService } from '../game/game-state.service'
import { BoardEvaluationService } from '../ai/board-evaluation.service'
import { MoveValidationService } from '../game/move-validation.service'

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService,
    private readonly gameStateService: GameStateService,
    private readonly minimaxService: MinimaxService,
    private readonly boardEvaluationService: BoardEvaluationService,
    private readonly voiceService: VoiceService,
    private readonly moveValidationService: MoveValidationService,
    private readonly moveGenerationService: MoveGenerationService) {}

  simulationInterval: any = null
  simulationDelayMs: number = 1000

  debugLogging: boolean = false

  lastAIMoveAt: number = 0
  aiIsThinking: boolean = false

  @Get()
  list(): Board {
    return this.boardService.get()
  }

  @Get('restart')
  restart(): string {
    this.gameStateService.restart()
    this.boardService.restart()
    clearInterval(this.simulationInterval)
    console.log('Command: Restart the game.')

    return 'OK'
  }

  @Get('csv')
  @Header('Content-Type', 'text/plain')
  csv(): string {
    const turn = 'Turn: ' + (this.aiIsThinking ? 'b' : 'w') + '\n\n'
    return turn + this.boardService.get().map((row: Piece[]) => Object.keys(row).map((key: string) => row[key]).join('')).join('\n')
  }

  @Get('move/:from/:to')
  async move(@Param() params): Promise<string> {
    const [fromRow, fromCol] = params.from.split('.')
    const [toRow, toCol] = params.to.split('.')

    if (fromRow === toRow && fromCol === toCol) {
      return 'Empty move'
    }

    if (this.aiIsThinking) {
      this.voiceService.triggerNotYourTurn()
      return 'It is not your turn yet'
    }
    
    const move: Move = {
      fromRow: Number(fromRow),
      fromCol: Number(fromCol),
      toRow: Number(toRow),
      toCol: Number(toCol)
    }
    this.gameStateService.addMove(move)

    const previousBoard = this.boardService.get()
  
    const moveIsValid = this.moveValidationService.isValid(previousBoard, Number(fromRow), Number(fromCol), Number(toRow), Number(toCol))

    if (moveIsValid !== 'OK') {
      this.voiceService.triggerInvalidMove(moveIsValid)
    } else {
      const lastMoveWasAJump = Math.abs(toRow - fromRow) > 1

      // Check if it was a move, but if there were jumps possible, then block the move
      if (!lastMoveWasAJump) {
        const player = previousBoard[Number(fromRow)][Number(fromCol)].toLowerCase() as Player
        const jumpsFromPreviousPosition = this.moveGenerationService.getAllPossibleJumps(previousBoard, player)

        if (jumpsFromPreviousPosition.length !== 0) {
          this.voiceService.triggerInvalidMove('You have to jump if you can jump.')
          return 'You have to jump if you can jump.'
        }
      }

      this.boardService.move(Number(fromRow), Number(fromCol), Number(toRow), Number(toCol))
      
      const jumpsFromHere = this.moveGenerationService.getJumpsFrom(this.boardService.get(), Number(toRow), Number(toCol))

      // End the turn if that last move was either not a jump, or no more jumps are possible
      if (!lastMoveWasAJump || jumpsFromHere.length === 0) {
        const moveDuration = ((new Date().getTime()) - this.lastAIMoveAt) / 1000

        if (this.boardEvaluationService.hasEnded(this.boardService.get())) {
          console.log('Game has ended')
          this.gameStateService.end()
        } else {
          if (this.lastAIMoveAt !== 0 && moveDuration > 10) {
            this.voiceService.triggerSlowMove(moveDuration)
          }
          
          this.playAIMove()
        }
      }
    }

    return moveIsValid
  }

  async playAIMove() {
    this.aiIsThinking = true
    const startEvaluation = new Date().getTime()
    const turn = this.minimaxService.runMinimax(this.boardService.get(), settings.ai.minimaxDepth, 'b', true)

    const endEvaluation = new Date().getTime()
    this.lastAIMoveAt = new Date().getTime()  

    if (turn && turn.length > 0) {
      // Wait at least a short while until applying the move, because if it happens too fast (less than a few hundred ms)
      // after the person's move, then the digital display will show both turns at the same time, which is confusing
      setTimeout(() => {
        turn.map((move: Move) => {
          this.gameStateService.addMove(move)
          this.boardService.move(move.fromRow, move.fromCol, move.toRow, move.toCol)
        })

        if (this.boardEvaluationService.hasEnded(this.boardService.get())) {
          console.log('Game has ended')
          this.gameStateService.end()
        }

        this.aiIsThinking = false
      }, Math.max(0, (settings.ai.minEvaluationTimeInSeconds * 1000) - (endEvaluation - startEvaluation)))
    } else {
      console.log('Game has ended')
      this.gameStateService.end()
    }
  }

  @Get('simulate')
  simulate(): string {
    console.log('Command: Start a game simulation.')
    let nextPlayer: Player = 'w'

    this.simulationInterval = setInterval(() => {
      const turn = nextPlayer === 'w'
        ? this.minimaxService.runRandom(this.boardService.get(), nextPlayer)
        : this.minimaxService.runMinimax(this.boardService.get(), settings.ai.minimaxDepth, nextPlayer, true)
      // const turn = nextPlayer === 'b'
      //   ? this.minimaxService.runMinimax(this.boardService.get(), settings.ai.minimaxDepth - 2, nextPlayer, settings.ai.alphaBetaPruning)
      //   : this.minimaxService.runMinimax(this.boardService.get(), settings.ai.minimaxDepth, nextPlayer, settings.ai.alphaBetaPruning)

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
