import type { IAevatarAI, IAevatarAIMethods } from "./types";
import type {
  IServices,
  IConnectService,
  ICreateAgentParams,
  RefreshTokenConfig,
  IClientAuthTokenParams,
} from "@aevatar-react-sdk/services";
import { Connect, Services } from "@aevatar-react-sdk/services";
import type { IConfig } from "@aevatar-react-sdk/types";
import { AevatarConfig } from "./config";
import { TWalletType, AuthTokenSource } from "@aevatar-react-sdk/types";
import {
  setAevatarJWT,
  pubKeyToAddress,
  getAevatarJWT,
} from "@aevatar-react-sdk/utils";
import { AevatarRequest, type IAevatarRequest } from "./aevatarRequest";

export class AevatarAI implements IAevatarAI, IAevatarAIMethods {
  public services: IServices;
  public connectServices: IConnectService;
  public fetchRequest: IAevatarRequest;
  public config: AevatarConfig;
  public connectRequest: IAevatarRequest;

  constructor() {
    this.config = new AevatarConfig();
    this.fetchRequest = new AevatarRequest(this.config.requestConfig);
    this.connectRequest = new AevatarRequest(this.config.connectRequestConfig);
    this.connectServices = new Connect(this.connectRequest);
    this.services = new Services(this.fetchRequest);
  }

  createGAevatar(params: ICreateAgentParams) {
    return this.services.agent.createAgent(params);
  }

  async getAuthToken(params: RefreshTokenConfig) {
    // 1: local storage has JWT token
    const data = await this.getAuthTokenFromStorage(params);
    if (data) return data;

    // 2: local storage don not has JWT token
    return await this.getAuthTokenFromApi({
      pubkey: params.pubkey,
      signature: params.signature,
      plain_text: params.plain_text,
      ca_hash: params?.ca_hash || undefined,
      chain_id: params?.chain_id || undefined,
      source: params.source || AuthTokenSource.Portkey,
      client_id: params.client_id,
      grant_type: params.grant_type,
    });
  }

  async getAuthTokenFromStorage(params: RefreshTokenConfig) {
    // Portkey key = caHash + managerAddress
    // NightElf key = AuthTokenSource.NightElf + managerAddress
    const frontPartKey =
      params.source === TWalletType.NightElf
        ? AuthTokenSource.NightElf
        : params.ca_hash;
    const key = frontPartKey + pubKeyToAddress(params.pubkey);

    if (!this.config.storageMethod) return undefined;

    const data = await getAevatarJWT(this.config.storageMethod, key);
    if (data) {
      this.fetchRequest.setHeaders({
        Authorization: `${data.token_type} ${data.access_token}`,
      });
      return `${data.token_type} ${data.access_token}`;
    }
    return undefined;
  }

  async getAuthTokenFromApi(params: RefreshTokenConfig) {
    const res = await this.connectServices.getConnectToken(params);
    const token_type = res.token_type;
    const access_token = res.access_token;

    this.fetchRequest.setHeaders({
      Authorization: `${token_type} ${access_token}`,
    });

    const frontPartKey =
      params?.source === AuthTokenSource.NightElf
        ? AuthTokenSource.NightElf
        : params?.ca_hash || "";
    const key = frontPartKey + pubKeyToAddress(params.pubkey);
    await setAevatarJWT(this.config.storageMethod, key, res);

    return `${token_type} ${access_token}`;
  }

  async getAuthTokenWithClient(params: IClientAuthTokenParams) {
    const res = await this.connectServices.getAuthTokenWithClient(params);
    const token_type = res.token_type;
    const access_token = res.access_token;
    this.fetchRequest.setHeaders({
      Authorization: `${token_type} ${access_token}`,
    });
    return `${token_type} ${access_token}`;
  }

  setConfig(options: IConfig) {
    this.config.setConfig(options);
  }
}
