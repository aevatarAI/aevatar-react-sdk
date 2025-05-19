import type { HTTPHeaders, IBaseRequest } from "@aevatar-react-sdk/types";

export class BaseService<T = IBaseRequest> {
  protected readonly _request: T;
  protected _headers?: HTTPHeaders;
  public constructor(request: T) {
    this._request = request;
  }
}

export type BaseListResponse<T = any> = {
  data: T[];
  totalRecordCount: number;
};

export type BaseApiResponse<T = any> = {
  code: string;
  message?: string;
  data: BaseListResponse<T>;
};

export * from "./agent";
export * from "./services";
export * from "./connect";
export * from "./workflow";
