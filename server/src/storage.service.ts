import { Injectable } from '@nestjs/common';
import * as storage from 'node-persist';

export interface IStorageService {
  getItem(key: string): Promise<any>;
  setItem(key: string, value: any): Promise<any>;
}

@Injectable()
export class StorageService {
  private storage!: IStorageService;

  constructor() {
    storage.init({
      dir: 'storage'
    })
    
    this.storage = storage;
  }

  public get(key: string): Promise<any> {
    return this.storage.getItem(key);
  }

  public set(key: string, value: any): Promise<any> {
    return this.storage.setItem(key, value);
  }
}