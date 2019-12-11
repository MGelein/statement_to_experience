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
        this.idleInterval = setInterval(() => this.runIdleInterval(this.shouldSpeak), settings.voice.intervalInSeconds * 1000)
    }

    lastSpoken: Date = new Date()
    history: string[] = []
    
    inGameInterval: any = null
    idleInterval: any = null

    triggerGameSetupReady() {
        this.pick(messages.gameSetupReady(), 1.6)}


    triggerResign() {
        this.pick(messages.resign(), 2.2)
    }
    
    triggerGameStart() {
        this.pick(messages.gameStart(), 1.8)

        this.inGameInterval = setInterval(() => this.runInGameInterval(this.shouldSpeak), settings.voice.intervalInSeconds * 1000)
        if (this.idleInterval) clearInterval(this.idleInterval)
    }

    triggerGameEnd(winner: Winner) {
        if (winner === 'b') this.pick(messages.gameWonByAI(), 2.0)
        else if (winner === 'w') this.pick(messages.gameLostByAI(), 2.0)
        else this.pick(messages.gameDraw(), 2.0)

        this.idleInterval = setInterval(() => this.runIdleInterval(this.shouldSpeak), settings.voice.intervalInSeconds * 1000)
        if (this.inGameInterval) clearInterval(this.inGameInterval)
    }

    triggerInvalidMove(error: string) {
        this.pick(messages.invalidMove(error), 1.5)
    }

    triggerForceJump() {
        this.pick(messages.forceJump(), 1.5)
    }

    triggerBadMove(probabilityOfWinning: number, numberOfSuperiorPossibleMoves: number) {
        if (this.shouldSpeak) this.pick(messages.badMoveByHuman(probabilityOfWinning, numberOfSuperiorPossibleMoves))
    }

    triggerSlowMove(timeInSeconds: number) {
        if (this.shouldSpeak) this.pick(messages.slowMove(timeInSeconds))
    }

    triggerNotYourTurn() {
        if (this.shouldSpeak) this.pick(messages.notYourTurn())
    }

    triggerGrabKing(numberOfMoves: number) {
        if (this.shouldSpeak) this.pick(messages.grabKing(numberOfMoves))
    }

    triggerAICanWin() {
        if (this.shouldSpeak) this.pick(messages.aiCanWin())
    }

    triggerBoardSetupProgress(progress: number) {
        this.pick(messages.boardSetupProgress(progress))
    }

    triggerBlackPieceHasMoved() {
        this.pick(messages.blackPieceHasMoved())
    }

    runInGameInterval(shouldSpeak: () => boolean) {
        if (shouldSpeak && randomChance(0.20)) this.pick(messages.randomTrashTalk(), 0.8)
    }

    runIdleInterval(shouldSpeak: () => boolean) {
        const chance = randomChance(0.10)
        if (settings.voice.idleTalkEnabled) {
            if (shouldSpeak && chance) this.pick(messages.idleTalk())
        }
    }

    pick(texts: string[], priority: number = 1.0) {
        // TODO: should basically clear history after every message of this message type has been said
        // const nonRepeats = texts.filter((text: string) => this.history.includes(text))

        const text = texts[Math.floor(Math.random() * texts.length)]

        this.history.push(text)
        this.lastSpoken = new Date()

        this.textToSpeechService.say(text, false, priority)
    }

    shouldSpeak(): boolean {
        const diff = (new Date().getTime()) - this.lastSpoken.getTime()
        return diff > settings.voice.minTimeBetweenMessagesInSeconds * 1000
    }

}
