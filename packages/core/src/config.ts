import type {
  HTTPHeaders,
  HTTPMethod,
  IConfig,
  IRequestDefaults,
  IStorageSuite,
} from "@aevatar-react-sdk/types";
import type { IAevatarConfig } from "./types";

export class StorageConfig implements IStorageSuite {
  public storage?: IStorageSuite;
  constructor(storage?: IStorageSuite) {
    this.storage = storage;
  }
  async getItem(key: string) {
    if (!this.storage) throw new Error("Please set storage first");
    return this.storage.getItem(key);
  }
  async setItem(key: string, value: string) {
    if (!this.storage) throw new Error("Please set storage first");
    return this.storage.setItem(key, value);
  }
  async removeItem(key: string) {
    if (!this.storage) throw new Error("Please set storage first");
    return this.storage.removeItem(key);
  }
  setStorage(storage: IStorageSuite) {
    this.storage = storage;
  }
}

export class RequestDefaultsConfig {
  public headers?: HTTPHeaders;
  public baseURL?: string;
  public url?: string;
  public method?: HTTPMethod;
  public timeout?: number;
  public connectUrl?: string;
  constructor(config?: IRequestDefaults) {
    this.setConfig(config);
  }
  setConfig(config?: IRequestDefaults) {
    if (config) {
      Object.entries(config).forEach(([key, value]) => {
        this[key as keyof IRequestDefaults] = value;
      });
    }
  }
}

export class AevatarConfig implements IAevatarConfig {
  public requestDefaults?: IRequestDefaults;
  public requestConfig: RequestDefaultsConfig;
  public connectRequestConfig: RequestDefaultsConfig;
  public graphQLUrl?: string;
  public connectUrl?: string;
  public storageMethod: StorageConfig;

  constructor(options?: IConfig) {
    this.storageMethod = new StorageConfig();
    this.requestConfig = new RequestDefaultsConfig();
    this.connectRequestConfig = new RequestDefaultsConfig();
    if (options) this.setConfig(options);
  }
  setConfig(options: IConfig) {
    Object.entries(options).forEach(([key, value]) => {
      if (!value) return;
      switch (key) {
        case "storageMethod":
          this.storageMethod.setStorage(value);
          break;
        case "requestDefaults": {
          this.requestConfig.setConfig(value);
          this.requestDefaults = value;
          const connectRequestDefaults = { ...value };
          this.connectRequestConfig.setConfig(connectRequestDefaults);
          break;
        }
        case "connectUrl":
          this.connectRequestConfig.setConfig({
            ...this.requestDefaults,
            ...(options.requestDefaults || {}),
            baseURL: value,
          });
          break;

        default:
          this[key as keyof IConfig] = value;
          break;
      }
    });
  }
}
