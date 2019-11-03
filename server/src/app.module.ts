import { Module } from '@nestjs/common'
import { AppController } from './app.controller'

import { StorageService } from './storage.service';

import { BoardController } from './board/board.controller'
import { BoardService } from './board/board.service'

@Module({
  imports: [],
  controllers: [AppController, BoardController],
  providers: [StorageService, BoardService],
})
export class AppModule {
  
}
