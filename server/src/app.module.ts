import { Module } from '@nestjs/common'
import { AppController } from './app.controller'

import { StorageService } from './storage.service';

import { BoardController } from './board/board.controller'
import { BoardService } from './board/board.service'
import { MoveValidationService } from './game/move-validation.service';
import { MoveGenerationService } from './game/move-generation.service';
import { MinimaxService } from './ai/minimax.service';
import { BoardEvaluationService } from './ai/board-evaluation.service';
import { TextToSpeechService } from './voice/text-to-speech.service';
import { VoiceService } from './voice/voice.service';

@Module({
  imports: [],
  controllers: [AppController, BoardController],
  providers: [StorageService, BoardService, BoardEvaluationService, MoveValidationService, MoveGenerationService, MinimaxService, TextToSpeechService, VoiceService],
})
export class AppModule {
  
}
