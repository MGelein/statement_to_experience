import { Injectable } from '@nestjs/common'
const say = require('say')

import { settings } from '../settings'

@Injectable()
export class TextToSpeechService {

    // TODO: consider using Google Cloud Text-to-Speech if it is available
    // https://github.com/googleapis/nodejs-text-to-speech
  
    queuedMessage: string | null = null
    queuedPriority: number = 0.0

    constructor() {
        setTimeout(() => this.processQueue(), 3000)
    }

    say(text: string, overwrite: boolean = false, priority: number = 1.0): void {
        if (settings.voice.enabled) {
            if (priority >= this.queuedPriority) {
                this.queuedMessage = text
                this.queuedPriority = priority
            }
        } else {
            console.log(`TTS: ${text}`)
        }
    }

    processQueue() {
        if (this.queuedMessage) {
            const text = this.queuedMessage
            this.queuedMessage = null
            this.queuedPriority = 0.0
            
            say.speak(text, null, 1.0, () => {
                setTimeout(() => this.processQueue(), 1000)
            })
        } else {
            setTimeout(() => this.processQueue(), 200)
        }
    }

}
