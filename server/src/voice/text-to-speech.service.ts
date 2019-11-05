import { Injectable } from '@nestjs/common'
const say = require('say')

import { settings } from '../settings'

@Injectable()
export class TextToSpeechService {

    // TODO: consider using Google Cloud Text-to-Speech if it is available
    // https://github.com/googleapis/nodejs-text-to-speech
  
    queue: string[] = []

    say(text: string): void {
        if (settings.voice.enabled) {
            this.queue.push(text)
            if (this.queue.length === 1) {
                this.processQueue()
            }
        } else {
            console.log(`TTS: ${text}`)
        }
    }

    processQueue() {
        say.speak(this.queue[0], null, 1.0, () => {
            this.queue.shift()

            if (this.queue.length > 0) {
                setTimeout(() => this.processQueue(), 1000)
            }
        })
    }

}
