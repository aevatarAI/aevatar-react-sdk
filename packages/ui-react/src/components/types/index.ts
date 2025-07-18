import z from "zod"
import type { IAgentParams } from "@aevatar-react-sdk/services";

export type Theme = "light" | "dark";

export interface IConfigurationParams extends IAgentParams {
  value?: string;
}

export type TJSONSchemaType =
  | "object"
  | "array"
  | "string"
  | "number"
  | "boolean"
  | "integer"
  | "file"
  | "null";

export type TDefinitions = {
  description?: string;
  enum: any[];
  type: TJSONSchemaType;
  "x-enumNames": any[];
};

export type JSONSchemaType<T> = {
  $schema?: string;
  type: TJSONSchemaType[] | TJSONSchemaType;
  // properties?: { [key: string]: JSONSchemaType<any> };
  required?: string[];
  enum?: any[];
  // items?: JSONSchemaType<any>;
  additionalProperties?: boolean | JSONSchemaType<any>;
  pattern?: string;
  description?: string;
  default?: T;
  format?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  uniqueItems?: boolean;
  definitions?: TDefinitions;
  value?: string;
  // allOf?: JSONSchemaType<any>[];
  // anyOf?: JSONSchemaType<any>[];
  // oneOf?: JSONSchemaType<any>[];
  // not?: JSONSchemaType<any>;
  // file?: boolean;
};

// export interface IGAevatarPropertiesItem {

// }

export interface IGAevatarProperties {
  [x: string]: JSONSchemaType<any>;
}

export type TEditExecutionsFilterForm = z.infer<
  typeof editExecutionsFilterForm
>;

export const editExecutionsFilterForm = z.object({
  name: z.string(),
  status: z.string(),
  date: z.string(),
  id: z.string(),
});
