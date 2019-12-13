import { Injectable } from '@nestjs/common'

@Injectable()
export class MonitoringService {

  status: any = { 'serial': false, 'camera': false }

  setStatus(key: string, value: boolean): boolean {
    this.status[key] = value
    return true
  }

  getStatus(): any {
      return this.status
  }

}
