import { Module } from '@nestjs/common'
import { AppController } from './app.controller'

import { StorageService } from './storage.service';

import { BoardController } from './board/board.controller'
import { BoardService } from './board/board.service'
import { MoveValidationService } from './game/move-validation.service';
import { MoveGenerationService } from './game/move-generation.service';
import { TurnToMoveService } from './game/turn-to-move.service';
import { MinimaxService } from './ai/minimax.service';
import { BoardEvaluationService } from './ai/board-evaluation.service';
import { TextToSpeechService } from './voice/text-to-speech.service';
import { VoiceService } from './voice/voice.service';
import { GameStateService } from './game/game-state.service';
import { RobotCommandsService } from './robot/robot-commands.service';
import { ArmController } from './robot/arm.controller';
import { BoardStateController } from './board/board-state.controller';
import { AIService } from './ai/ai.service';
import { ConfigController } from './config.controller';
import { MonitoringService } from './misc/monitoring.service';
import { MonitoringController } from './misc/monitoring.controller';

@Module({
  imports: [],
  controllers: [
    AppController,
    BoardController,
    ArmController,
    BoardStateController,
    MonitoringController,
    ConfigController
  ],
  providers: [
    StorageService,
    BoardService,
    BoardEvaluationService,
    GameStateService,
    MoveValidationService,
    MoveGenerationService,
    MonitoringService,
    TurnToMoveService,
    MinimaxService,
    TextToSpeechService,
    RobotCommandsService,
    VoiceService,
    AIService
  ],
})
export class AppModule {
  
}
