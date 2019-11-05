import { Injectable } from '@nestjs/common'
const say = require('say')

import { settings } from '../settings'

@Injectable()
export class TextToSpeechService {
  
    say(text: string): void {
        if (settings.enableTextToSpeech) {
            say.speak(text)
        }
    }
}
