import { Injectable } from '@nestjs/common'

import { TextToSpeechService } from './text-to-speech.service'
import { messages } from './messages'
import { settings } from '../settings'
import { Winner } from '../ai/board-evaluation.service'

// TODO: should move to a util pkg
const randomChance = (chance: number = 0.25): boolean => {
    return Math.random() < chance
}

@Injectable()
export class VoiceService {

    constructor(private readonly textToSpeechService: TextToSpeechService) {
        this.idleInterval = setInterval(() => this.runInGameInterval(this.shouldSpeak), settings.voice.intervalInSeconds * 1000)
    }

    lastSpoken: Date = new Date()
    history: string[] = []
    
    inGameInterval: any = null
    idleInterval: any = null

    // TODO: we should count # of moves since every trigger last occurred, and then enforce a minimum move distance for some triggers
    // E.g. the slow move trigger should only occur every 3 human moves at the most

    triggerGameStart() {
        this.pick(messages.gameStart())

        this.inGameInterval = setInterval(() => this.runInGameInterval(this.shouldSpeak), settings.voice.intervalInSeconds * 1000)
        if (this.idleInterval) clearInterval(this.idleInterval)
    }

    triggerGameEnd(winner: Winner) {
        if (winner === 'b') this.pick(messages.gameWonByAI())
        else if (winner === 'w') this.pick(messages.gameLostByAI())
        else this.pick(messages.gameDraw())

        this.idleInterval = setInterval(() => this.runInGameInterval(this.shouldSpeak), settings.voice.intervalInSeconds * 1000)
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

    triggerAICanWin() {
        if (this.shouldSpeak) this.pick(messages.aiCanWin())
    }

    runInGameInterval(shouldSpeak: () => boolean) {
        if (shouldSpeak && randomChance(0.50)) this.pick(messages.randomTrashTalk())
    }

    runIdleInterval(shouldSpeak: () => boolean) {
        const chance = randomChance(0.25)
        if (settings.voice.idleTalkEnabled) {
            if (shouldSpeak && chance) this.pick(messages.idleTalk())
        }
    }

    pick(texts: string[]) {
        // TODO: should basically clear history after every message of this message type has been said
        // const nonRepeats = texts.filter((text: string) => this.history.includes(text))

        const text = texts[Math.floor(Math.random() * texts.length)]

        this.history.push(text)
        this.lastSpoken = new Date()

        this.textToSpeechService.say(text)
    }

    shouldSpeak(): boolean {
        const diff = (new Date().getTime()) - this.lastSpoken.getTime()
        return diff > settings.voice.minTimeBetweenMessagesInSeconds * 1000
    }

}
