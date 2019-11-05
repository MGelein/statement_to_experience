import { Injectable } from '@nestjs/common'

import { TextToSpeechService } from './text-to-speech.service'
import { messages } from './messages'
import { settings } from '../settings'

@Injectable()
export class VoiceService {

    constructor(private readonly textToSpeechService: TextToSpeechService) {}

    lastSpoken: Date = new Date()
    history: string[] = []
    
    inGameInterval: any = null
    idleInterval: any = null

    // TODO: we should count # of moves since every trigger last occurred, and then enforce a minimum move distance for some triggers
    // E.g. the slow move trigger should only occur every 3 human moves at the most

    triggerGameStart() {
        this.pick(messages.gameStart())

        this.inGameInterval = setInterval(this.runInGameInterval, settings.voice.intervalInSeconds * 1000)
        if (this.idleInterval) clearInterval(this.idleInterval)
    }

    triggerGameEnd() {
        // TODO: determine winner and choose correct message type
        this.pick(messages.gameWonByAI())

        this.idleInterval = setInterval(this.runIdleInterval, settings.voice.intervalInSeconds * 1000)
        if (this.inGameInterval) clearInterval(this.inGameInterval)
    }

    // Note: This is the only non-optional trigger, and cannot be skipped
    triggerInvalidMove(error: string) {
        this.pick(messages.invalidMove(error))
    }

    triggerBadMove(probabilityOfWinning: number, numberOfSuperiorPossibleMoves: number) {
        if (this.shouldSpeak) this.pick(messages.badMoveByHuman(probabilityOfWinning, numberOfSuperiorPossibleMoves))
    }

    triggerSlowMove(timeInSeconds: number) {
        if (this.shouldSpeak) this.pick(messages.slowMove(timeInSeconds))
    }

    triggerGrabKing(numberOfMoves: number) {
        if (this.shouldSpeak) this.pick(messages.grabKing(numberOfMoves))
    }

    runInGameInterval() {
        // TODO: check that some thing wasn't said in the last x seconds
        // TODO: add some randomnness here (e.g. 50% over an interval of 10 seconds)
        if (this.shouldSpeak) this.pick(messages.randomTrashTalk())
    }

    runIdleInterval() {
        // TODO: check that some thing wasn't said in the last x seconds
        // TODO: add some randomnness here (e.g. 25% over an interval of 10 seconds)
        this.pick(messages.idleTalk())
    }

    private pick(texts: string[]) {
        const nonRepeats = texts.filter((text: string) => !this.history.includes(text))
        const text = nonRepeats[Math.floor(Math.random() * nonRepeats.length)]

        this.history.push(text)
        this.lastSpoken = new Date()

        this.textToSpeechService.say(text)
    }

    private shouldSpeak() {
        const diff = (new Date().getTime()) - this.lastSpoken.getTime()
        return diff > settings.voice.minTimeBetweenMessagesInSeconds * 1000
    }

}
