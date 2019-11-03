import { Module } from '@nestjs/common'
import { AppController } from './app.controller'

import { StorageService } from './storage.service';

import { BoardController } from './board/board.controller'
import { BoardService } from './board/board.service'
import { MoveValidationService } from './board/move-validation.service';
import { MoveEvaluationService } from './ai/move-evaluation.service';
import { MinimaxService } from './ai/minimax.service';

@Module({
  imports: [],
  controllers: [AppController, BoardController],
  providers: [StorageService, BoardService, MoveValidationService, MoveEvaluationService, MinimaxService],
})
export class AppModule {
  
}
