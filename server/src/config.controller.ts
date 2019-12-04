import { Controller, Get, Param, Post, Body } from '@nestjs/common'

import { StorageService } from './storage.service'

@Controller('config')
export class ConfigController {

    constructor(private readonly storage: StorageService) {}

    @Get(':key')
    get(@Param() params): Promise<string> {
        return this.storage.get('config/' + params.key)
    }

    @Get(':key/:value')
    set(@Param() params): string {
        console.log(`Config: Set ${params.key} to ${params.value}`)
        this.storage.set('config/' + params.key, params.value)
        return 'OK'
    }

}
