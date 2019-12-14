import { Injectable } from '@nestjs/common'
import { VoiceService } from '../voice/voice.service'
import { RobotCommandsService } from '../robot/robot-commands.service'

@Injectable()
export class InstructionsService {

    constructor(
        private readonly voice: VoiceService,
        private readonly robot: RobotCommandsService
    ) {}

    async play(): Promise<boolean> {
        // TODO: check if the board is in the initial configuratino

        // Move black to front
        await this.voice.playInstruction('Alright, let me show you how the game of checkers works.')
        await this.robot.queueSavedCommand('5_4')
        await this.robot.lowerAndPickup(5, 4)
        await this.robot.queueSavedCommand('3_2')
        await this.robot.lowerAndDrop()

        // Explain jumps
        await Promise.all([
            this.voice.playInstruction('You have to move diagonally at all times.'),
            this.robot.queueSavedCommand('2_3').then(
                async () => await this.robot.lowerAndPickup(2, 3)
            )
        ])

        await Promise.all([
            this.voice.playInstruction('If a black piece is in front or behind of you, then you have to jump over the piece, like this.'),
            this.robot.queueSavedCommand('4_5').then(
                async () => await this.robot.lowerAndDrop()
            )
        ])

        await this.robot.lowerAndPickup(4, 5)
    
        // Explain kings
        await Promise.all([
            this.voice.playInstruction('Now, if you get to the last line, you will get a king. These can move infinitely far.'),
            this.robot.queueSavedCommand('7_6')
        ])

        await this.robot.queueSavedCommand('3_2')
        await this.robot.lowerAndDrop()

        return Promise.resolve(true)
  }

}
