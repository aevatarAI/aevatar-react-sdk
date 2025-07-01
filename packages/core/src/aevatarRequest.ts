import { FetchRequest } from "@portkey/request";
import type {
  RequestOpts,
  IBaseRequest,
  HTTPHeaders,
} from "@aevatar-react-sdk/types";
import { aevatarEvents } from "@aevatar-react-sdk/utils";
export interface IAevatarRequest extends IBaseRequest {
  commonHeaders: HTTPHeaders;
  setHeaders(headers: HTTPHeaders): void;
}

export class AevatarRequest extends FetchRequest implements IAevatarRequest {
  commonHeaders: HTTPHeaders = {};
  private getAuthTokenPending = false;

  private async sendOrigin(config: RequestOpts, count = 0) {
    if (count > 3) throw "sendOrigin==error";
    const mergedHeaders = { ...this.commonHeaders, ...config.headers };

    return super.send({
      ...config,
      headers: mergedHeaders,
    });
  }

  async send(config: RequestOpts) {
    try {
      const result = await this.sendOrigin(config);
      if (result?.data) return result.data;
      // get jwt token
      if (result?.access_token) return result;
      if (result.code === "20001") return result.data;
      throw result;
    } catch (error: any) {
      if (!this.commonHeaders.Authorization || error?.status === 401) {
        if (!this.getAuthTokenPending) {
          this.getAuthTokenPending = true;
          aevatarEvents.AuthTokenGet.emit();
        }
        const token: string = await new Promise((resolve) => {
          aevatarEvents.AuthTokenReceive.addListener((data: string) => {
            resolve(data);
          });
        });
        this.getAuthTokenPending = false;
        this.commonHeaders.Authorization = token;
        const _result = await this.sendOrigin(config);
        if (_result?.data) return _result.data;
        // get jwt token
        if (_result?.access_token) return _result;
        if (_result.code === "20001") return _result.data;
        throw _result;
      }

      throw error;
    }
  }

  public setHeaders(headers: HTTPHeaders): void {
    this.commonHeaders = headers;
  }
}
