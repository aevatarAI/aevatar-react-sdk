import {
  MyGAevatar,
  CreateGAevatar,
  aevatarAI,
  EditGAevatarInner,
  AevatarProvider,
  Button,
  WorkflowConfiguration,
  ConfigProvider,
  WorkflowList,
  FullScreenIcon,
} from "@aevatar-react-sdk/ui-react";
// import "@aevatar-react-sdk/ui-react/ui-react.css";
import { useCallback, useRef, useState } from "react";
import { FullScreen, useFullScreenHandle } from "react-full-screen";

import { clientOnly } from "vike-react/clientOnly";
import { sleep } from "@aevatar-react-sdk/utils";

import type {
  IAgentInfoDetail,
  IAgentsConfiguration,
} from "@aevatar-react-sdk/services";
import type { IWorkflowListRef } from "../../../ui-react/dist/types/src/components/WorkflowList";
const LoginButton = clientOnly(
  () => import("../../components/auth/LoginButton")
);

const AuthButton = clientOnly(() => import("../../components/auth/AuthButton"));

// ConfigProvider.setConfig({
//   connectUrl: "https://auth-station-staging.aevatar.ai",
//   requestDefaults: {
//     // baseURL: "/aevatarURL",
//     baseURL: "https://station-developer-staging.aevatar.ai/test-client",
//   },
// });

ConfigProvider.setConfig({
  requestDefaults: {
    timeout: 15000,
    baseURL: "https://station-developer-dev-staging.aevatar.ai/tool-client",
  },
});

enum Stage {
  myGAevatar = "MyGAevatar",
  newGAevatar = "newGAevatar",
  editGAevatar = "editGAevatar",
  Workflow = "Workflow",
  WorkflowList = "WorkflowList",
}

export default function UI() {
  const [stage, setStage] = useState<Stage>();
  const [gaevatarList, setGaevatarList] = useState<IAgentInfoDetail[]>();
  const onNewGAevatar = useCallback(() => {
    console.log("onNewGAevatar");
    setStage(Stage.newGAevatar);
  }, []);

  const [editAgents, setEditAgents] = useState<{
    agentTypeList: string[];
    jsonSchemaString?: string;
    properties?: Record<string, string>;
    agentName: string;
    agentId: string;
  }>();

  const onEditGaevatar = useCallback(async (id: string) => {
    const result = await aevatarAI.services.agent.getAgentInfo(id);
    console.log(result, "result===onEditGaevatar");
    const agentTypeList = [result.agentType];

    setEditAgents({
      agentId: result.id,
      agentTypeList,
      jsonSchemaString: result?.propertyJsonSchema,
      agentName: result.name,
      properties: result.properties,
    });

    setStage(Stage.editGAevatar);
  }, []);

  const onAuthFinish = useCallback(() => {
    setShowAction(true);
  }, []);

  const onShowGaevatar = useCallback(() => {
    setStage(Stage.myGAevatar);
  }, []);

  const [agentTypeList, setAgentTypeList] = useState<IAgentsConfiguration[]>();

  const refreshGaevatarList = useCallback(async () => {
    const [gaevatarList, agentTypeList] = await Promise.all([
      aevatarAI.services.agent.getAgents({
        pageIndex: 0,
        pageSize: 100,
      }),
      aevatarAI.services.agent.getAllAgentsConfiguration(),
    ]);
    // const gaevatarList: IAgentInfoDetail[] = [];
    // const agentTypeList: any[] = [
    //   {
    //     agentType: "Aevatar.SignalR.GAgents.SignalRGAgent",
    //     fullName: "Aevatar.SignalR.GAgents.SignalRGAgent",
    //     agentParams: [
    //       {
    //         name: "ConnectionId",
    //         type: "System.String",
    //       },
    //     ],
    //     propertyJsonSchema:
    //       '{\n  "$schema": "http://json-schema.org/draft-04/schema#",\n  "title": "SignalRGAgentConfiguration",\n  "type": "object",\n  "additionalProperties": false,\n  "properties": {\n    "correlationId": {\n      "type": [\n        "null",\n        "string"\n      ],\n      "format": "guid"\n    },\n    "publisherGrainId": {\n      "$ref": "#/definitions/GrainId"\n    },\n    "connectionId": {\n      "type": "string"\n    }\n  },\n  "definitions": {\n    "GrainId": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "type": {\n          "$ref": "#/definitions/GrainType"\n        },\n        "key": {\n          "$ref": "#/definitions/IdSpan"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "GrainType": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "value": {\n          "$ref": "#/definitions/IdSpan"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "IdSpan": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "value": {\n          "$ref": "#/definitions/ReadOnlyMemoryOfByte"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "ReadOnlyMemoryOfByte": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "length": {\n          "type": "integer",\n          "format": "int32"\n        },\n        "isEmpty": {\n          "type": "boolean"\n        },\n        "span": {\n          "$ref": "#/definitions/ReadOnlySpanOfByte"\n        }\n      }\n    },\n    "ReadOnlySpanOfByte": {\n      "type": "object",\n      "x-deprecated": true,\n      "x-deprecatedMessage": "Types with embedded references are not supported in this version of your compiler.",\n      "additionalProperties": false,\n      "properties": {\n        "length": {\n          "type": "integer",\n          "format": "int32"\n        },\n        "isEmpty": {\n          "type": "boolean"\n        }\n      }\n    }\n  }\n}',
    //   },
    //   {
    //     agentType: "agentchildtest",
    //     fullName: "Aevatar.Application.Grains.Agents.TestAgent.AgentChildTest",
    //     agentParams: null,
    //     propertyJsonSchema: null,
    //   },
    //   {
    //     agentType: "agentparenttest",
    //     fullName: "Aevatar.Application.Grains.Agents.TestAgent.AgentParentTest",
    //     agentParams: null,
    //     propertyJsonSchema: null,
    //   },
    //   {
    //     agentType: "agentpermissiontest",
    //     fullName:
    //       "Aevatar.Application.Grains.Agents.TestAgent.AgentPermissionTest",
    //     agentParams: null,
    //     propertyJsonSchema: null,
    //   },
    //   {
    //     agentType: "agenttest",
    //     fullName: "Aevatar.Application.Grains.Agents.TestAgent.AgentTest",
    //     agentParams: null,
    //     propertyJsonSchema: null,
    //   },
    //   {
    //     agentType:
    //       "Aevatar.Application.Grains.Agents.TestAgent.SignalRTestGAgent",
    //     fullName:
    //       "Aevatar.Application.Grains.Agents.TestAgent.SignalRTestGAgent",
    //     agentParams: null,
    //     propertyJsonSchema: null,
    //   },
    //   {
    //     agentType: "demo.dynamictoolai",
    //     fullName:
    //       "Aevatar.Application.Grains.Agents.TestAgent.DynamicToolAIGAgent",
    //     agentParams: null,
    //     propertyJsonSchema: null,
    //   },
    //   {
    //     agentType: "Aevatar.Application.Grains.Agents.Creator.CreatorGAgent",
    //     fullName: "Aevatar.Application.Grains.Agents.Creator.CreatorGAgent",
    //     agentParams: null,
    //     propertyJsonSchema: null,
    //   },
    //   {
    //     agentType: "aevatar.result",
    //     fullName: "Aevatar.GAgents.Executor.ResultGAgent",
    //     agentParams: [
    //       {
    //         name: "ExecutionId",
    //         type: "System.String",
    //       },
    //       {
    //         name: "StreamProvider",
    //         type: "System.String",
    //       },
    //       {
    //         name: "StreamNamespace",
    //         type: "System.String",
    //       },
    //       {
    //         name: "ExpectedResultType",
    //         type: "System.Type",
    //       },
    //     ],
    //     propertyJsonSchema:
    //       '{\n  "$schema": "http://json-schema.org/draft-04/schema#",\n  "title": "ResultGAgentConfiguration",\n  "type": "object",\n  "additionalProperties": false,\n  "properties": {\n    "correlationId": {\n      "type": [\n        "null",\n        "string"\n      ],\n      "format": "guid"\n    },\n    "publisherGrainId": {\n      "$ref": "#/definitions/GrainId"\n    },\n    "executionId": {\n      "type": "string"\n    },\n    "streamProvider": {\n      "type": "string"\n    },\n    "streamNamespace": {\n      "type": "string"\n    },\n    "expectedResultType": {\n      "type": [\n        "null",\n        "string"\n      ]\n    }\n  },\n  "definitions": {\n    "GrainId": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "type": {\n          "$ref": "#/definitions/GrainType"\n        },\n        "key": {\n          "$ref": "#/definitions/IdSpan"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "GrainType": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "value": {\n          "$ref": "#/definitions/IdSpan"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "IdSpan": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "value": {\n          "$ref": "#/definitions/ReadOnlyMemoryOfByte"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "ReadOnlyMemoryOfByte": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "length": {\n          "type": "integer",\n          "format": "int32"\n        },\n        "isEmpty": {\n          "type": "boolean"\n        },\n        "span": {\n          "$ref": "#/definitions/ReadOnlySpanOfByte"\n        }\n      }\n    },\n    "ReadOnlySpanOfByte": {\n      "type": "object",\n      "x-deprecated": true,\n      "x-deprecatedMessage": "Types with embedded references are not supported in this version of your compiler.",\n      "additionalProperties": false,\n      "properties": {\n        "length": {\n          "type": "integer",\n          "format": "int32"\n        },\n        "isEmpty": {\n          "type": "boolean"\n        }\n      }\n    }\n  }\n}',
    //   },
    //   {
    //     agentType:
    //       "Aevatar.GAgents.GroupChat.WorkflowCoordinator.WorkflowCoordinatorGAgent",
    //     fullName:
    //       "Aevatar.GAgents.GroupChat.WorkflowCoordinator.WorkflowCoordinatorGAgent",
    //     agentParams: [
    //       {
    //         name: "WorkflowUnitList",
    //         type: "System.Collections.Generic.List`1[Aevatar.GAgents.GroupChat.WorkflowCoordinator.Dto.WorkflowUnitDto]",
    //       },
    //       {
    //         name: "InitContent",
    //         type: "System.String",
    //       },
    //     ],
    //     propertyJsonSchema:
    //       '{\n  "$schema": "http://json-schema.org/draft-04/schema#",\n  "title": "WorkflowCoordinatorConfigDto",\n  "type": "object",\n  "additionalProperties": false,\n  "properties": {\n    "correlationId": {\n      "type": [\n        "null",\n        "string"\n      ],\n      "format": "guid"\n    },\n    "publisherGrainId": {\n      "$ref": "#/definitions/GrainId"\n    },\n    "workflowUnitList": {\n      "type": "array",\n      "items": {\n        "$ref": "#/definitions/WorkflowUnitDto"\n      }\n    },\n    "initContent": {\n      "type": [\n        "null",\n        "string"\n      ]\n    }\n  },\n  "definitions": {\n    "GrainId": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "type": {\n          "$ref": "#/definitions/GrainType"\n        },\n        "key": {\n          "$ref": "#/definitions/IdSpan"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "GrainType": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "value": {\n          "$ref": "#/definitions/IdSpan"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "IdSpan": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "value": {\n          "$ref": "#/definitions/ReadOnlyMemoryOfByte"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "ReadOnlyMemoryOfByte": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "length": {\n          "type": "integer",\n          "format": "int32"\n        },\n        "isEmpty": {\n          "type": "boolean"\n        },\n        "span": {\n          "$ref": "#/definitions/ReadOnlySpanOfByte"\n        }\n      }\n    },\n    "ReadOnlySpanOfByte": {\n      "type": "object",\n      "x-deprecated": true,\n      "x-deprecatedMessage": "Types with embedded references are not supported in this version of your compiler.",\n      "additionalProperties": false,\n      "properties": {\n        "length": {\n          "type": "integer",\n          "format": "int32"\n        },\n        "isEmpty": {\n          "type": "boolean"\n        }\n      }\n    },\n    "WorkflowUnitDto": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "grainId": {\n          "type": "string"\n        },\n        "nextGrainId": {\n          "type": "string"\n        },\n        "extendedData": {\n          "type": "object",\n          "additionalProperties": {\n            "type": "string"\n          }\n        }\n      }\n    }\n  }\n}',
    //   },
    //   {
    //     agentType: "blackboardgagent",
    //     fullName: "GroupChat.GAgent.Feature.Blackboard.BlackboardGAgent",
    //     agentParams: null,
    //     propertyJsonSchema: null,
    //   },
    //   {
    //     agentType: "Aevatar.GAgents.InputGAgent.GAgent.InputGAgent",
    //     fullName: "Aevatar.GAgents.InputGAgent.GAgent.InputGAgent",
    //     agentParams: [
    //       {
    //         name: "Input",
    //         type: "System.String",
    //       },
    //     ],
    //     propertyJsonSchema:
    //       '{\n  "$schema": "http://json-schema.org/draft-04/schema#",\n  "title": "InputConfigDto",\n  "type": "object",\n  "additionalProperties": false,\n  "properties": {\n    "memberName": {\n      "type": "string"\n    },\n    "correlationId": {\n      "type": [\n        "null",\n        "string"\n      ],\n      "format": "guid"\n    },\n    "publisherGrainId": {\n      "$ref": "#/definitions/GrainId"\n    },\n    "input": {\n      "type": "string"\n    }\n  },\n  "definitions": {\n    "GrainId": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "type": {\n          "$ref": "#/definitions/GrainType"\n        },\n        "key": {\n          "$ref": "#/definitions/IdSpan"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "GrainType": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "value": {\n          "$ref": "#/definitions/IdSpan"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "IdSpan": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "value": {\n          "$ref": "#/definitions/ReadOnlyMemoryOfByte"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "ReadOnlyMemoryOfByte": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "length": {\n          "type": "integer",\n          "format": "int32"\n        },\n        "isEmpty": {\n          "type": "boolean"\n        },\n        "span": {\n          "$ref": "#/definitions/ReadOnlySpanOfByte"\n        }\n      }\n    },\n    "ReadOnlySpanOfByte": {\n      "type": "object",\n      "x-deprecated": true,\n      "x-deprecatedMessage": "Types with embedded references are not supported in this version of your compiler.",\n      "additionalProperties": false,\n      "properties": {\n        "length": {\n          "type": "integer",\n          "format": "int32"\n        },\n        "isEmpty": {\n          "type": "boolean"\n        }\n      }\n    }\n  }\n}',
    //   },
    //   {
    //     agentType: "aevatar.mcp",
    //     fullName: "Aevatar.GAgents.MCP.GAgents.MCPGAgent",
    //     agentParams: [
    //       {
    //         name: "Server",
    //         type: "Aevatar.GAgents.MCP.Options.MCPServerConfig",
    //       },
    //       {
    //         name: "RequestTimeout",
    //         type: "System.TimeSpan",
    //       },
    //       {
    //         name: "EnableToolDiscovery",
    //         type: "System.Boolean",
    //       },
    //     ],
    //     propertyJsonSchema:
    //       '{\n  "$schema": "http://json-schema.org/draft-04/schema#",\n  "title": "MCPGAgentConfig",\n  "type": "object",\n  "additionalProperties": false,\n  "properties": {\n    "memberName": {\n      "type": "string"\n    },\n    "correlationId": {\n      "type": [\n        "null",\n        "string"\n      ],\n      "format": "guid"\n    },\n    "publisherGrainId": {\n      "$ref": "#/definitions/GrainId"\n    },\n    "server": {\n      "$ref": "#/definitions/MCPServerConfig"\n    },\n    "requestTimeout": {\n      "type": "string",\n      "format": "duration"\n    },\n    "enableToolDiscovery": {\n      "type": "boolean"\n    }\n  },\n  "definitions": {\n    "GrainId": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "type": {\n          "$ref": "#/definitions/GrainType"\n        },\n        "key": {\n          "$ref": "#/definitions/IdSpan"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "GrainType": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "value": {\n          "$ref": "#/definitions/IdSpan"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "IdSpan": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "value": {\n          "$ref": "#/definitions/ReadOnlyMemoryOfByte"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "ReadOnlyMemoryOfByte": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "length": {\n          "type": "integer",\n          "format": "int32"\n        },\n        "isEmpty": {\n          "type": "boolean"\n        },\n        "span": {\n          "$ref": "#/definitions/ReadOnlySpanOfByte"\n        }\n      }\n    },\n    "ReadOnlySpanOfByte": {\n      "type": "object",\n      "x-deprecated": true,\n      "x-deprecatedMessage": "Types with embedded references are not supported in this version of your compiler.",\n      "additionalProperties": false,\n      "properties": {\n        "length": {\n          "type": "integer",\n          "format": "int32"\n        },\n        "isEmpty": {\n          "type": "boolean"\n        }\n      }\n    },\n    "MCPServerConfig": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "serverName": {\n          "type": "string"\n        },\n        "command": {\n          "type": "string"\n        },\n        "args": {\n          "type": "array",\n          "items": {\n            "type": "string"\n          }\n        },\n        "env": {\n          "type": "object",\n          "additionalProperties": {\n            "type": "string"\n          }\n        },\n        "description": {\n          "type": "string"\n        },\n        "autoReconnect": {\n          "type": "boolean"\n        },\n        "reconnectDelay": {\n          "type": "string",\n          "format": "duration"\n        },\n        "url": {\n          "type": [\n            "null",\n            "string"\n          ]\n        },\n        "transportType": {\n          "type": [\n            "null",\n            "string"\n          ]\n        },\n        "initialDelayMs": {\n          "type": [\n            "integer",\n            "null"\n          ],\n          "format": "int32"\n        },\n        "maxRetries": {\n          "type": [\n            "integer",\n            "null"\n          ],\n          "format": "int32"\n        },\n        "toolDiscoveryEndpoint": {\n          "type": [\n            "null",\n            "string"\n          ]\n        },\n        "predefinedTools": {\n          "type": [\n            "array",\n            "null"\n          ],\n          "items": {\n            "$ref": "#/definitions/MCPToolDefinition"\n          }\n        }\n      }\n    },\n    "MCPToolDefinition": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "name": {\n          "type": "string"\n        },\n        "description": {\n          "type": "string"\n        },\n        "parameters": {\n          "type": [\n            "null",\n            "object"\n          ],\n          "additionalProperties": {\n            "$ref": "#/definitions/MCPParameterDefinition"\n          }\n        }\n      }\n    },\n    "MCPParameterDefinition": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "type": {\n          "type": "string"\n        },\n        "description": {\n          "type": [\n            "null",\n            "string"\n          ]\n        },\n        "required": {\n          "type": "boolean"\n        }\n      }\n    }\n  }\n}',
    //   },
    //   {
    //     agentType: "psi.omni",
    //     fullName: "Aevatar.GAgents.PsiOmni.PsiOmniGAgent",
    //     agentParams: [
    //       {
    //         name: "Depth",
    //         type: "System.Int32",
    //       },
    //       {
    //         name: "LLMConfig",
    //         type: "Aevatar.GAgents.AIGAgent.Dtos.LLMConfigDto",
    //       },
    //     ],
    //     propertyJsonSchema:
    //       '{\n  "$schema": "http://json-schema.org/draft-04/schema#",\n  "title": "PsiOmniGAgentConfig",\n  "type": "object",\n  "additionalProperties": false,\n  "properties": {\n    "memberName": {\n      "type": "string"\n    },\n    "correlationId": {\n      "type": [\n        "null",\n        "string"\n      ],\n      "format": "guid"\n    },\n    "publisherGrainId": {\n      "$ref": "#/definitions/GrainId"\n    },\n    "depth": {\n      "type": "integer",\n      "format": "int32"\n    },\n    "llmConfig": {\n      "oneOf": [\n        {\n          "type": "null"\n        },\n        {\n          "$ref": "#/definitions/LLMConfigDto"\n        }\n      ]\n    }\n  },\n  "definitions": {\n    "GrainId": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "type": {\n          "$ref": "#/definitions/GrainType"\n        },\n        "key": {\n          "$ref": "#/definitions/IdSpan"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "GrainType": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "value": {\n          "$ref": "#/definitions/IdSpan"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "IdSpan": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "value": {\n          "$ref": "#/definitions/ReadOnlyMemoryOfByte"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "ReadOnlyMemoryOfByte": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "length": {\n          "type": "integer",\n          "format": "int32"\n        },\n        "isEmpty": {\n          "type": "boolean"\n        },\n        "span": {\n          "$ref": "#/definitions/ReadOnlySpanOfByte"\n        }\n      }\n    },\n    "ReadOnlySpanOfByte": {\n      "type": "object",\n      "x-deprecated": true,\n      "x-deprecatedMessage": "Types with embedded references are not supported in this version of your compiler.",\n      "additionalProperties": false,\n      "properties": {\n        "length": {\n          "type": "integer",\n          "format": "int32"\n        },\n        "isEmpty": {\n          "type": "boolean"\n        }\n      }\n    },\n    "LLMConfigDto": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "systemLLM": {\n          "type": [\n            "null",\n            "string"\n          ]\n        },\n        "selfLLMConfig": {\n          "oneOf": [\n            {\n              "type": "null"\n            },\n            {\n              "$ref": "#/definitions/SelfLLMConfig"\n            }\n          ]\n        }\n      }\n    },\n    "SelfLLMConfig": {\n      "type": "object",\n      "additionalProperties": false,\n      "required": [\n        "providerEnum",\n        "modelId"\n      ],\n      "properties": {\n        "providerEnum": {\n          "$ref": "#/definitions/LLMProviderEnum"\n        },\n        "modelId": {\n          "$ref": "#/definitions/ModelIdEnum"\n        },\n        "modelName": {\n          "type": "string"\n        },\n        "apiKey": {\n          "type": "string"\n        },\n        "endpoint": {\n          "type": "string"\n        },\n        "memo": {\n          "type": [\n            "null",\n            "object"\n          ],\n          "additionalProperties": {}\n        }\n      }\n    },\n    "LLMProviderEnum": {\n      "type": "integer",\n      "description": "0 = Azure\\n1 = OpenAI\\n2 = DeepSeek\\n3 = Google",\n      "x-enumNames": [\n        "Azure",\n        "OpenAI",\n        "DeepSeek",\n        "Google"\n      ],\n      "enum": [\n        0,\n        1,\n        2,\n        3\n      ]\n    },\n    "ModelIdEnum": {\n      "type": "integer",\n      "description": "0 = OpenAI\\n1 = DeepSeek\\n2 = Gemini\\n3 = OpenAITextToImage",\n      "x-enumNames": [\n        "OpenAI",\n        "DeepSeek",\n        "Gemini",\n        "OpenAITextToImage"\n      ],\n      "enum": [\n        0,\n        1,\n        2,\n        3\n      ]\n    }\n  }\n}',
    //   },
    //   {
    //     agentType: "Aevatar.GAgents.Twitter.Agent.TwitterGAgent",
    //     fullName: "Aevatar.GAgents.Twitter.Agent.TwitterGAgent",
    //     agentParams: [
    //       {
    //         name: "ConsumerKey",
    //         type: "System.String",
    //       },
    //       {
    //         name: "ConsumerSecret",
    //         type: "System.String",
    //       },
    //       {
    //         name: "EncryptionPassword",
    //         type: "System.String",
    //       },
    //       {
    //         name: "BearerToken",
    //         type: "System.String",
    //       },
    //       {
    //         name: "ReplyLimit",
    //         type: "System.Int32",
    //       },
    //     ],
    //     propertyJsonSchema:
    //       '{\n  "$schema": "http://json-schema.org/draft-04/schema#",\n  "title": "InitTwitterOptionsDto",\n  "type": "object",\n  "additionalProperties": false,\n  "properties": {\n    "correlationId": {\n      "type": [\n        "null",\n        "string"\n      ],\n      "format": "guid"\n    },\n    "publisherGrainId": {\n      "$ref": "#/definitions/GrainId"\n    },\n    "consumerKey": {\n      "type": "string"\n    },\n    "consumerSecret": {\n      "type": "string"\n    },\n    "encryptionPassword": {\n      "type": "string"\n    },\n    "bearerToken": {\n      "type": "string"\n    },\n    "replyLimit": {\n      "type": "integer",\n      "format": "int32"\n    }\n  },\n  "definitions": {\n    "GrainId": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "type": {\n          "$ref": "#/definitions/GrainType"\n        },\n        "key": {\n          "$ref": "#/definitions/IdSpan"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "GrainType": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "value": {\n          "$ref": "#/definitions/IdSpan"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "IdSpan": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "value": {\n          "$ref": "#/definitions/ReadOnlyMemoryOfByte"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "ReadOnlyMemoryOfByte": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "length": {\n          "type": "integer",\n          "format": "int32"\n        },\n        "isEmpty": {\n          "type": "boolean"\n        },\n        "span": {\n          "$ref": "#/definitions/ReadOnlySpanOfByte"\n        }\n      }\n    },\n    "ReadOnlySpanOfByte": {\n      "type": "object",\n      "x-deprecated": true,\n      "x-deprecatedMessage": "Types with embedded references are not supported in this version of your compiler.",\n      "additionalProperties": false,\n      "properties": {\n        "length": {\n          "type": "integer",\n          "format": "int32"\n        },\n        "isEmpty": {\n          "type": "boolean"\n        }\n      }\n    }\n  }\n}',
    //   },
    //   {
    //     agentType: "Aevatar.GAgents.Twitter.GAgents.ChatAIAgent.ChatAIGAgent",
    //     fullName: "Aevatar.GAgents.Twitter.GAgents.ChatAIAgent.ChatAIGAgent",
    //     agentParams: [
    //       {
    //         name: "Instructions",
    //         type: "System.String",
    //       },
    //       {
    //         name: "SystemLLM",
    //         type: "System.String",
    //       },
    //       {
    //         name: "MCPServers",
    //         type: "System.Collections.Generic.List`1[Aevatar.GAgents.MCP.Options.MCPServerConfig]",
    //       },
    //       {
    //         name: "SelectedGAgents",
    //         type: "System.Collections.Generic.List`1[Orleans.Runtime.GrainType]",
    //       },
    //     ],
    //     propertyJsonSchema:
    //       '{\n  "$schema": "http://json-schema.org/draft-04/schema#",\n  "title": "ChatAIGAgentConfigDto",\n  "type": "object",\n  "additionalProperties": false,\n  "properties": {\n    "memberName": {\n      "type": "string"\n    },\n    "correlationId": {\n      "type": [\n        "null",\n        "string"\n      ],\n      "format": "guid"\n    },\n    "publisherGrainId": {\n      "$ref": "#/definitions/GrainId"\n    },\n    "instructions": {\n      "type": "string"\n    },\n    "systemLLM": {\n      "type": "string"\n    },\n    "mcpServers": {\n      "type": "array",\n      "items": {\n        "$ref": "#/definitions/MCPServerConfig"\n      }\n    },\n    "selectedGAgents": {\n      "type": "array",\n      "items": {\n        "$ref": "#/definitions/GrainType"\n      }\n    }\n  },\n  "definitions": {\n    "GrainId": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "type": {\n          "$ref": "#/definitions/GrainType"\n        },\n        "key": {\n          "$ref": "#/definitions/IdSpan"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "GrainType": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "value": {\n          "$ref": "#/definitions/IdSpan"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "IdSpan": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "value": {\n          "$ref": "#/definitions/ReadOnlyMemoryOfByte"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "ReadOnlyMemoryOfByte": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "length": {\n          "type": "integer",\n          "format": "int32"\n        },\n        "isEmpty": {\n          "type": "boolean"\n        },\n        "span": {\n          "$ref": "#/definitions/ReadOnlySpanOfByte"\n        }\n      }\n    },\n    "ReadOnlySpanOfByte": {\n      "type": "object",\n      "x-deprecated": true,\n      "x-deprecatedMessage": "Types with embedded references are not supported in this version of your compiler.",\n      "additionalProperties": false,\n      "properties": {\n        "length": {\n          "type": "integer",\n          "format": "int32"\n        },\n        "isEmpty": {\n          "type": "boolean"\n        }\n      }\n    },\n    "MCPServerConfig": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "serverName": {\n          "type": "string"\n        },\n        "command": {\n          "type": "string"\n        },\n        "args": {\n          "type": "array",\n          "items": {\n            "type": "string"\n          }\n        },\n        "env": {\n          "type": "object",\n          "additionalProperties": {\n            "type": "string"\n          }\n        },\n        "description": {\n          "type": "string"\n        },\n        "autoReconnect": {\n          "type": "boolean"\n        },\n        "reconnectDelay": {\n          "type": "string",\n          "format": "duration"\n        },\n        "url": {\n          "type": [\n            "null",\n            "string"\n          ]\n        },\n        "transportType": {\n          "type": [\n            "null",\n            "string"\n          ]\n        },\n        "initialDelayMs": {\n          "type": [\n            "integer",\n            "null"\n          ],\n          "format": "int32"\n        },\n        "maxRetries": {\n          "type": [\n            "integer",\n            "null"\n          ],\n          "format": "int32"\n        },\n        "toolDiscoveryEndpoint": {\n          "type": [\n            "null",\n            "string"\n          ]\n        },\n        "predefinedTools": {\n          "type": [\n            "array",\n            "null"\n          ],\n          "items": {\n            "$ref": "#/definitions/MCPToolDefinition"\n          }\n        }\n      }\n    },\n    "MCPToolDefinition": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "name": {\n          "type": "string"\n        },\n        "description": {\n          "type": "string"\n        },\n        "parameters": {\n          "type": [\n            "null",\n            "object"\n          ],\n          "additionalProperties": {\n            "$ref": "#/definitions/MCPParameterDefinition"\n          }\n        }\n      }\n    },\n    "MCPParameterDefinition": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "type": {\n          "type": "string"\n        },\n        "description": {\n          "type": [\n            "null",\n            "string"\n          ]\n        },\n        "required": {\n          "type": "boolean"\n        }\n      }\n    }\n  }\n}',
    //   },
    // ];
    console.log(gaevatarList, agentTypeList, "gaevatarList==");

    setAgentTypeList(agentTypeList);
    const list = gaevatarList.map((item) => {
      const agentType = agentTypeList.find(
        (type) => type.agentType === item.agentType
      );
      item.propertyJsonSchema = agentType?.propertyJsonSchema;
      // TODO
      item.businessAgentGrainId =
        item.businessAgentGrainId ??
        `${item.agentType}/${item.id.replace(/-/g, "")}`;
      return { ...item };
    });
    setGaevatarList(list);
  }, []);

  const onShowWorkflow = useCallback(async () => {
    await refreshGaevatarList();
    setStage(Stage.Workflow);
  }, [refreshGaevatarList]);

  const [editWorkflow, setEditWorkflow] = useState<any>();

  const onEditWorkflow = useCallback(
    async (workflowAgentId: string) => {
      const result = await aevatarAI.getWorkflowUnitRelationByAgentId(
        workflowAgentId
      );
      setEditWorkflow({
        workflowAgentId,
        workflowName: result.workflowName,
        // workUnitRelations: workUnitRelations,
        workUnitRelations: result.workUnitRelations,
      });
      onShowWorkflow();
      console.log(workflowAgentId, result, "onEditWorkflow=");
    },
    [onShowWorkflow]
  );

  const [showAction, setShowAction] = useState<boolean>();

  const getTokenByclient = useCallback(async () => {
    // await aevatarAI.getAuthTokenWithClient({
    //   grant_type: "password",
    //   scope: "Aevatar",
    //   username: "runulr@snapmail.cc", // "leotest@teml.net", // (import.meta as any).env.VITE_APP_SERVICE_USERNAME,
    //   client_id: "AevatarAuthServer",
    //   password: "Aa1234!", //"Leo123!", //(import.meta as any).env.VITE_APP_SERVICE_PASSWORD,
    // } as any);
    aevatarAI.fetchRequest.setHeaders({
      // authorization: sdkToken,
      Authorization:
        "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IkJGRUI5QzEwMDMzNDJGNTdBQTMzOEM5RUI0MTAyRENFQzNEOEE2M0EiLCJ4NXQiOiJ2LXVjRUFNMEwxZXFNNHlldEJBdHpzUFlwam8iLCJ0eXAiOiJhdCtqd3QifQ.eyJpc3MiOiJodHRwczovL2F1dGgtcHJlLXN0YXRpb24tZGV2LXN0YWdpbmcuYWV2YXRhci5haS8iLCJleHAiOjE3NTI5OTY0ODUsImlhdCI6MTc1MjgyMzY4NiwiYXVkIjoiQWV2YXRhciIsInNjb3BlIjoiQWV2YXRhciBvZmZsaW5lX2FjY2VzcyIsImp0aSI6IjU0MWIyYTljLTFlYmEtNDhlNC04NWE0LWYzY2RjODcwNjg0ZSIsInN1YiI6ImUwYmEyYTA5LTlmNDMtYmE0MS1mN2M2LTNhMWFkNjIzNzVlOSIsInByZWZlcnJlZF91c2VybmFtZSI6InJ1bnVsciIsImVtYWlsIjoicnVudWxyQHNuYXBtYWlsLmNjIiwicm9sZSI6WyJiYXNpY1VzZXIiLCI5MzcyZjhmZC1hMTZiLWI0NDEtY2JlZC0zYTFiMDVkOGM0M2RfT3duZXIiLCI0YTc0MGJhYy0xNjA2LTU3NTgtZjRjMy0zYTFhZDYyNzI4NWRfT3duZXIiLCIyMGJkOWE3Mi1jOGM3LTJmZWItMmM1Zi0zYTFiMDVkMmJmOTlfT3duZXIiLCI0Nzk5YTVmMS0yZjVmLWYwODctMDNkZC0zYTFiMDVkNzgyZTJfT3duZXIiLCJkM2E5ZWMzMS1lNGQ4LWY4ZDctMDM5Ni0zYTFiMDVkZGM4YzNfT3duZXIiXSwicGhvbmVfbnVtYmVyX3ZlcmlmaWVkIjoiRmFsc2UiLCJlbWFpbF92ZXJpZmllZCI6IkZhbHNlIiwidW5pcXVlX25hbWUiOiJydW51bHIiLCJzZWN1cml0eV9zdGFtcCI6IlFITDNHVFZIMkVVT0FHNEpGSUlXVVczVVNKWFRRNERKIiwib2lfcHJzdCI6IkFldmF0YXJBdXRoU2VydmVyIiwib2lfYXVfaWQiOiIwN2QwZDA3MS1mMmU3LTVhNzEtOGNmNS0zYTFiMjM4OGRiMzQiLCJjbGllbnRfaWQiOiJBZXZhdGFyQXV0aFNlcnZlciIsIm9pX3Rrbl9pZCI6ImRlMTE3M2VkLTc0ZmItZmI0My1kOTAyLTNhMWIyZTliYmViZSJ9.Ae2wSpHTM5XXdAVAEj8gpqozYv55txXljB5FosspPhmEf3IPVJQ5Z-QRDGKcozn5i_p2hBkklCKiF7Ytb14MHdQEjy8xj16d2MYV93_Ir0KQveyLVZK2tT0-axwHjtuUtZJ-uwHiD3kKlJxIh3AZqOFZa_XzR_cTSwDpTXxOLQfyenkeV2zCPtPbSxcnt2_e2WVbjMnMSaOVmRZWlWpMsHW_xulxBh2NaqY1oR9sMHpn7GNghOoN5kb9_MlmJ81__45PDJuEq9vK9aAkdI1pD0jH-JXtryZdTirickAXFSMJWTw6vkI8P-FueWovjJjTwJaAGlp8uZCN17EP1cjntg",
    });
    setShowAction(true);
  }, []);

  const onGaevatarChange = useCallback(
    async (isCreate: boolean, data: { params: any; agentId?: string }) => {
      console.log(isCreate, data, "isCreate, data=");
      let result: IAgentInfoDetail;
      if (isCreate) {
        result = await aevatarAI.services.agent.createAgent(data.params);
      } else {
        if (!data.agentId) throw "Not agentId";
        result = await aevatarAI.services.agent.updateAgentInfo(
          data.agentId,
          data.params
        );
      }
      await sleep(2000);
      await refreshGaevatarList();

      return result;
    },
    [refreshGaevatarList]
  );

  const fullscreenHandle = useFullScreenHandle();

  const workflowListRef = useRef<IWorkflowListRef>(null);

  const getWorkflowDetail = useCallback(async (workflowAgentId: string) => {
    await sleep(2000);
    const result = await aevatarAI.getWorkflowUnitRelationByAgentId(
      workflowAgentId
    );
    console.log("getWorkflowDetail", result);
    setEditWorkflow({
      workflowAgentId,
      workflowName: result.workflowName,
      workUnitRelations: result.workUnitRelations,
    });
  }, []);

  return (
    <div className="min-w-[375px]">
      <AevatarProvider
      hiddenGAevatarType={[
        // "Aevatar.SignalR.GAgents.SignalRGAgent",
        // "Aevatar.GAgents.GroupChat.WorkflowCoordinator.WorkflowCoordinatorGAgent",
      ]}
      >
        <LoginButton />

        <AuthButton onFinish={onAuthFinish} />
        <div className="h-[10px]" />

        <Button onClick={getTokenByclient}>getTokenByclient</Button>
        {/* {showAction && (
          <> */}
        <Button onClick={onShowGaevatar}>show gaevatar</Button>
        <Button onClick={onShowWorkflow}>show workflow</Button>
        <Button
          onClick={() => {
            onEditWorkflow(localStorage.getItem("workflowAgentId") ?? "");
          }}>
          edit workflow
        </Button>
        <div className="h-[10px]" />
        <Button
          onClick={() => {
            setStage(Stage.WorkflowList);
          }}>
          show workflowList
        </Button>
        <Button
          onClick={() => {
            workflowListRef.current?.refresh();
          }}>
          refresh workflowList
        </Button>

        {/* </>
        )} */}

        <div className="text-[12px] lg:text-[24px]">aad</div>

        {stage === Stage.myGAevatar && (
          <MyGAevatar
            height={600}
            // maxGAevatarCount={1}
            onNewGAevatar={onNewGAevatar}
            onEditGaevatar={onEditGaevatar}
          />
        )}
        {stage === Stage.editGAevatar && editAgents && (
          <EditGAevatarInner
            type="edit"
            className="h-[600px]"
            {...editAgents}
            onBack={() => {
              setStage(Stage.myGAevatar);
            }}
            onSuccess={() => {
              setStage(Stage.myGAevatar);
            }}
          />
        )}
        {stage === Stage.newGAevatar && (
          <CreateGAevatar
            className="h-[600px]"
            onBack={() => {
              setStage(Stage.myGAevatar);
            }}
            onSuccess={() => {
              setStage(Stage.myGAevatar);
            }}
          />
        )}
        {stage === Stage.Workflow && (
          <FullScreen className="h-[900px]" handle={fullscreenHandle}>
            <WorkflowConfiguration
              sidebarConfig={{
                gaevatarList, //: [],
                isNewGAevatar: true,
                gaevatarTypeList: agentTypeList,
                // type: "newAgent",
              }}
              extraControlBar={
                <div className="w-full h-full bg-[#141415] flex flow-row border-[1px] border-[#303030]">
                  {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
                  <div
                    className={`p-[4px] w-[26px] h-[26px] flex justify-center items-center cursor-pointer ${
                      fullscreenHandle.active ? "bg-[#AFC6DD]" : ""
                    }`}
                    onClick={() => {
                      fullscreenHandle.active
                        ? fullscreenHandle.exit()
                        : fullscreenHandle.enter();
                    }}>
                    <FullScreenIcon
                      style={{
                        width: 16,
                        height: 16,
                      }}
                      className={
                        fullscreenHandle.active
                          ? "text-[#606060]"
                          : "text-[#B9B9B9]"
                      }
                    />
                  </div>
                </div>
              }
              onBack={() => {
                setStage(undefined);
              }}
              onSave={(workflowAgentId: string) => {
                console.log(workflowAgentId, "workflowAgentId==");
                workflowAgentId &&
                  localStorage.setItem("workflowAgentId", workflowAgentId);
                getWorkflowDetail(workflowAgentId);
              }}
              editWorkflow={editWorkflow}
              onGaevatarChange={onGaevatarChange}
            />
          </FullScreen>
        )}
        {stage === Stage.WorkflowList && (
          <div className="h-[500px]">
            <WorkflowList
              ref={workflowListRef}
              onEditWorkflow={(workflowAgentId) => {
                onEditWorkflow(workflowAgentId);
              }}
              onNewWorkflow={() => {
                onShowWorkflow();
              }}
            />
          </div>
        )}
      </AevatarProvider>
    </div>
  );
}
