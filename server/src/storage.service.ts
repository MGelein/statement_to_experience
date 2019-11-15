import { Injectable } from '@nestjs/common'
import * as storage from 'node-persist'

export interface IStorageService {
  getItem(key: string): Promise<any>
  setItem(key: string, value: any): Promise<any>
  removeItem(key: string): Promise<any>
  keys(): Promise<any>
}

@Injectable()
export class StorageService {
  private storage!: IStorageService

  constructor() {
    storage.init({
      dir: 'storage'
    })
    
    this.storage = storage
  }

  public get(key: string): Promise<any> {
    return this.storage.getItem(key)
  }

  public set(key: string, value: any): Promise<any> {
    return this.storage.setItem(key, value)
  }

  public delete(key: string): Promise<any> {
    return this.storage.removeItem(key)
  }

  public keys(): Promise<any> {
    return this.storage.keys()
  }

}