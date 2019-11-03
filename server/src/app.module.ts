import { Module } from '@nestjs/common'
import { AppController } from './app.controller'

import { StorageService } from './storage.service';

import { BoardController } from './board/board.controller'
import { BoardService } from './board/board.service'
import { MoveValidationService } from './game/move-validation.service';
import { MoveEvaluationService } from './game/move-evaluation.service';
import { MinimaxService } from './ai/minimax.service';
import { BoardEvaluationService } from './ai/board-evaluation.service';

@Module({
  imports: [],
  controllers: [AppController, BoardController],
  providers: [StorageService, BoardService, BoardEvaluationService, MoveValidationService, MoveEvaluationService, MinimaxService],
})
export class AppModule {
  
}
