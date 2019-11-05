import { Injectable } from '@nestjs/common'

import { TextToSpeechService } from './text-to-speech.service'
import { messages } from './messages'

@Injectable()
export class VoiceService {

    constructor(private readonly textToSpeechService: TextToSpeechService) {}

    lastSpoken: Date = new Date()

    history: string[] = []

    // TODO: we should count # of moves since every trigger last occurred, and then enforce a minimum move distance for some triggers
    // E.g. the slow move trigger should only occur every 3 human moves at the most

    triggerGameStart() {
        // const text = this.pick(messages.invalidMove(error))
        // this.textToSpeechService.say(text)
    }

    triggerGameWonByAI() {
        // const text = this.pick(messages.invalidMove(error))
        // this.textToSpeechService.say(text)
    }

    triggerGameEndByAI() {
        // const text = this.pick(messages.invalidMove(error))
        // this.textToSpeechService.say(text)
    }

    triggerInvalidMove(error: string) {
        const text = this.pick(messages.invalidMove(error))
        this.textToSpeechService.say(text)
    }

    triggerSlowMove(timeInSeconds: number) {
        const text = this.pick(messages.slowMove(timeInSeconds))
        this.textToSpeechService.say(text)
    }

    triggerRandomTrashtalk() {
        const text = this.pick(messages.randomTrashTalk())
        this.textToSpeechService.say(text)
    }

    private pick(texts: string[]) {
        const nonRepeats = texts.filter((text: string) => !this.history.includes(text))
        const text = nonRepeats[Math.floor(Math.random() * nonRepeats.length)]

        this.history.push(text)
        this.lastSpoken = new Date()

        return text
    }

}
