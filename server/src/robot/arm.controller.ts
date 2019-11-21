import { Controller, Get, Header, Param } from '@nestjs/common'
import { RobotCommandsService } from './robot-commands.service'

@Controller('arm')
export class ArmController {
  constructor(private readonly robotCommandService: RobotCommandsService) {}

  @Get('direct/:command')
  direct(@Param() params): string {
    this.robotCommandService.queueCommand(params.command)
    return 'OK'
  }

  @Get('position/save/:name/:command')
  save(@Param() params): string {
    this.robotCommandService.setSavedCommand(params.name, params.command)
    return 'OK'
  }

  @Get('position/move/:name')
  async move(@Param() params): Promise<string> {
    const ret = await this.robotCommandService.queueSavedCommand(params.name)
    if (ret) return 'OK'
    else return `Failed to send command ${params.name}`
  }

  @Get('position/delete/:name')
  delete(@Param() params): string {
    this.robotCommandService.unsetSavedCommand(params.name)
    return 'OK'
  }

  @Get('position/list')
  @Header('Content-Type', 'text/plain')
  async list(): Promise<string> {
    return this.robotCommandService.getSavedCommands().then((keys: string[]) => keys.join('\n'))
  }

}
