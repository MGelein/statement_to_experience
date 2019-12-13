import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

import { Board } from './board/board.service'
import { GameState } from './game/game-state.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors()

  // Set the initial board state
  app.get('BoardService').restart()
  
  // Reset to previously stored board and game state
  this.storage.get('board-state').then((board: Board) => {
    this.boardService.update(board)
    this.storage.get('game-state').then((gameState: GameState) => {
      this.gameStateService.reset(gameState)
    })
  })

  require('dns').lookup(require('os').hostname(), async (err: any, internalIP: string, fam: any) => {
    await app.listen(3000, () => {
      console.log(`Server listening on ${internalIP}:3000`)
      console.log(`Launched on ${new Date()}`)
    })
  })
}

bootstrap()
