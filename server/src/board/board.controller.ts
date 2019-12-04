import { Controller, Get, Header } from '@nestjs/common'

import { BoardService, Board, Piece } from './board.service'
import { GameStateService, PlayerMove } from '../game/game-state.service'

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService,
    private readonly gameStateService: GameStateService) {}

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
    console.log('Command: Restart the game.')

    return 'OK'
  }

  @Get('moves/csv')
  @Header('Content-Type', 'text/plain')
  movesCSV(): string {
    return this.gameStateService.state.moves.map((playerMove: PlayerMove) => {
      return `${playerMove.player}: (${playerMove.move.fromRow},${playerMove.move.fromCol}) to (${playerMove.move.toRow},${playerMove.move.toCol})`
    }).join('\n')
  }

  @Get('csv')
  @Header('Content-Type', 'text/plain')
  csv(): string {
    let output = ''
    output += 'Turn: ' + (this.gameStateService.state.winner ? '' : (this.aiIsThinking ? 'b' : 'w')) + '\n'

    let overlay = ''
    if (this.gameStateService.state.winner === 'b') overlay = 'LOST'
    else if (this.gameStateService.state.winner === 'w') overlay = 'WON'
    else if (this.gameStateService.state.winner === 'draw') overlay = 'DRAW'
    output += 'Overlay: ' + overlay + '\n\n'

    return output + this.boardService.get().map((row: Piece[]) => Object.keys(row).map((key: string) => row[key]).join('')).join('\n')
  }

}
