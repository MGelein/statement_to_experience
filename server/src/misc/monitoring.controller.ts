import { Controller, Get, Header } from '@nestjs/common'
import { MonitoringService } from './monitoring.service'
import { RobotCommandsService } from '../robot/robot-commands.service'
import { GameStateService } from '../game/game-state.service'
import { InstructionsService } from './instructions.service'

@Controller('monitoring')
export class MonitoringController {
  constructor(
      private readonly monitoringService: MonitoringService,
      private readonly robotCommandsService: RobotCommandsService,
      private readonly instructionsService: InstructionsService,
      private readonly gameStateService: GameStateService) {}

  @Get('')
  index(): any {
    return {
        'status': this.monitoringService.getStatus(),
        'winRates': this.gameStateService.state.winRates
    }
  }

  @Get('reset-arduino')
  resetArduino(): string {
    console.log('Server: Reset the Arduino.')
    return this.robotCommandsService.sendDirectCommand('RESET')
  }

  @Get('play-instructions')
  playInstructions(): Promise<boolean> {
    console.log('Server: Start the instruction sequence.')
    return this.instructionsService.play()
  }

}
