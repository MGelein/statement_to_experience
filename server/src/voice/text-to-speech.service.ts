import { Injectable } from '@nestjs/common'
const say = require('say')

import { StorageService } from '../storage.service'

@Injectable()
export class TextToSpeechService {

    // TODO: consider using Google Cloud Text-to-Speech if it is available
    // https://github.com/googleapis/nodejs-text-to-speech
  
    queuedMessage: string | null = null
    queuedPriority: number = 0.0

    constructor(private readonly storage: StorageService) {
        setTimeout(() => this.processQueue(), 3000)
    }

    say(text: string, overwrite: boolean = false, priority: number = 1.0): void {
        this.storage.get('config/voice').then((voiceEnabled: number) => {
            if (voiceEnabled == 1) {
                if (priority >= this.queuedPriority) {
                    this.queuedMessage = text
                    this.queuedPriority = priority
                }
            } else {
                console.log(`TTS: ${text}`)
            }
        })
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

    async sayNow(text: string): Promise<boolean> {
        return say.speak(text, null, 1.0, () => {
            return Promise.resolve(true)
        })
    }

}
