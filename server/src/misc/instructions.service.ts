import { Injectable } from '@nestjs/common'
import { VoiceService } from 'src/voice/voice.service'
import { RobotCommandsService } from 'src/robot/robot-commands.service'

@Injectable()
export class InstructionsService {

    constructor(
        private readonly voiceService: VoiceService,
        private readonly robotCommandsService: RobotCommandsService
    ) {}

    async play(): Promise<boolean> {
        // TODO: check if the board is in the initial configuratino

        await this.voiceService.playInstruction(0)
        await this.voiceService.playInstruction(1)

        this.voiceService.playInstruction(2)
        await this.robotCommandsService.applyTurn([{ fromRow: 5, fromCol: 4, toRow: 3, toCol: 4 }])
        await this.robotCommandsService.applyTurn([{ fromRow: 2, fromCol: 3, toRow: 4, toCol: 5 }])
        // this.voiceService.playInstruction(3)

        return Promise.resolve(true)
  }

}
