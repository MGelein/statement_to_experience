import { Injectable } from '@nestjs/common'
const say = require('say')

import { settings } from '../settings'

@Injectable()
export class TextToSpeechService {

    // TODO: consider using Google Cloud Text-to-Speech if it is available
    // https://github.com/googleapis/nodejs-text-to-speech
  
    say(text: string): void {
        if (settings.voice.enabled) {
            say.speak(text)
        } else {
            console.log(`TTS: ${text}`)
        }
    }
}
