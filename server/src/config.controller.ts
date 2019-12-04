import { Controller, Get, Param } from '@nestjs/common'
const loudness = require('loudness')

import { StorageService } from './storage.service'

@Controller('config')
export class ConfigController {

    constructor(private readonly storage: StorageService) {}

    @Get(':key')
    get(@Param() params): Promise<string> {
        if (params.key === 'volume') {
            return loudness.getVolume().then((volume: number) => {
                return volume.toString()
            })
        } else {
            return this.storage.get('config/' + params.key)
        }
    }

    @Get(':key/:value')
    set(@Param() params): string {
        if (params.key === 'volume') {
            loudness.setVolume(Number(params.value))
        } else {
            console.log(`Config: Set ${params.key} to ${params.value}`)
            this.storage.set('config/' + params.key, params.value)
            return 'OK'
        }
    }

}
