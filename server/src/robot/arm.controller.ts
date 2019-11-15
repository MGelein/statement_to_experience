import { Controller, Get, Header, Param } from '@nestjs/common'
import { RobotCommandsService } from './robot-commands.service'

@Controller('arm')
export class ArmController {
  constructor(private readonly robotCommandService: RobotCommandsService) {}

  @Get('direct/:command')
  direct(@Param() params): string {
    this.robotCommandService.sendCommand(params.command)
    return 'OK'
  }

  @Get('position/save/:name/:command')
  save(@Param() params): string {
    this.robotCommandService.setSavedCommand(params.name, params.command)
    return 'OK'
  }

  @Get('position/move/:name')
  move(@Param() params): string {
    const ret = this.robotCommandService.sendSavedCommand(params.name)
    if (ret) return 'OK'
    else return `Failed to send command ${params.name}`
  }

  @Get('position/delete/:name')
  delete(@Param() params): string {
    this.robotCommandService.unsetSavedCommand(params.name)
    return 'OK'
  }

}
