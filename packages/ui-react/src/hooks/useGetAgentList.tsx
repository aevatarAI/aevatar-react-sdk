import { useQuery } from "@tanstack/react-query";

export const useGetAgentList = () => {
  return useQuery({
    queryKey: ["agent-list"],
    queryFn: () => {
      return Promise.resolve({
        data: [
          {
            agentType: "Aevatar.SignalR.GAgents.SignalRGAgent",
            fullName: "Aevatar.SignalR.GAgents.SignalRGAgent",
            description: "SignalR Publisher.",
            agentParams: [
              {
                name: "ConnectionId",
                type: "System.String",
              },
            ],
            propertyJsonSchema:
              '{\n  "$schema": "http://json-schema.org/draft-04/schema#",\n  "title": "SignalRGAgentConfiguration",\n  "type": "object",\n  "additionalProperties": false,\n  "properties": {\n    "correlationId": {\n      "type": [\n        "null",\n        "string"\n      ],\n      "format": "guid"\n    },\n    "publisherGrainId": {\n      "$ref": "#/definitions/GrainId"\n    },\n    "connectionId": {\n      "type": "string"\n    }\n  },\n  "definitions": {\n    "GrainId": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "type": {\n          "$ref": "#/definitions/GrainType"\n        },\n        "key": {\n          "$ref": "#/definitions/IdSpan"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "GrainType": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "value": {\n          "$ref": "#/definitions/IdSpan"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "IdSpan": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "value": {\n          "$ref": "#/definitions/ReadOnlyMemoryOfByte"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "ReadOnlyMemoryOfByte": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "length": {\n          "type": "integer",\n          "format": "int32"\n        },\n        "isEmpty": {\n          "type": "boolean"\n        },\n        "span": {\n          "$ref": "#/definitions/ReadOnlySpanOfByte"\n        }\n      }\n    },\n    "ReadOnlySpanOfByte": {\n      "type": "object",\n      "x-deprecated": true,\n      "x-deprecatedMessage": "Types with embedded references are not supported in this version of your compiler.",\n      "additionalProperties": false,\n      "properties": {\n        "length": {\n          "type": "integer",\n          "format": "int32"\n        },\n        "isEmpty": {\n          "type": "boolean"\n        }\n      }\n    }\n  }\n}',
            defaultValues: {
              connectionId: "",
            },
          },
          {
            agentType: "agentchildtest",
            fullName:
              "Aevatar.Application.Grains.Agents.TestAgent.AgentChildTest",
            description: "this is used for front child test",
            agentParams: null,
            propertyJsonSchema: null,
            defaultValues: null,
          },
          {
            agentType: "agentparenttest",
            fullName:
              "Aevatar.Application.Grains.Agents.TestAgent.AgentParentTest",
            description: "this is used for front parent test",
            agentParams: null,
            propertyJsonSchema: null,
            defaultValues: null,
          },
          {
            agentType: "agentpermissiontest",
            fullName:
              "Aevatar.Application.Grains.Agents.TestAgent.AgentPermissionTest",
            description: "This is a permission test agent",
            agentParams: null,
            propertyJsonSchema: null,
            defaultValues: null,
          },
          {
            agentType: "agenttest",
            fullName: "Aevatar.Application.Grains.Agents.TestAgent.AgentTest",
            description: "this is used for front test",
            agentParams: null,
            propertyJsonSchema: null,
            defaultValues: null,
          },
          {
            agentType:
              "Aevatar.Application.Grains.Agents.TestAgent.SignalRTestGAgent",
            fullName:
              "Aevatar.Application.Grains.Agents.TestAgent.SignalRTestGAgent",
            description: "This is a GAgent for testing SignalRGAgent",
            agentParams: null,
            propertyJsonSchema: null,
            defaultValues: null,
          },
          {
            agentType: "hostconfigurationgagent",
            fullName:
              "Aevatar.Application.Grains.Agents.Configuration.HostConfigurationGAgent",
            description:
              "Simplified agent for persistent storage and retrieval of business configuration JSON.",
            agentParams: null,
            propertyJsonSchema: null,
            defaultValues: null,
          },
          {
            agentType: "Aevatar.Application.Grains.Agents.AI.TextCompletion",
            fullName:
              "Aevatar.Application.Grains.Agents.AI.TextCompletionGAgent",
            description:
              "AI text completion agent that generates 5 different completion results based on user input.",
            agentParams: null,
            propertyJsonSchema: null,
            defaultValues: null,
          },
          {
            agentType: "Aevatar.Application.Grains.Agents.AI.WorkflowComposer",
            fullName:
              "Aevatar.Application.Grains.Agents.AI.WorkflowComposerGAgent",
            description:
              "AI workflow generation agent that creates complete workflow JSON from user goals and available agent descriptions. Analyzes user goals and available agent capabilities to generate optimized workflow configurations with proper node connections and data flow management.",
            agentParams: null,
            propertyJsonSchema: null,
            defaultValues: null,
          },
          {
            agentType: "aevatar.event-handler-executor",
            fullName: "Aevatar.GAgents.Executor.EventHandlerExecutorGAgent",
            description:
              "Event Handler Executor GAgent - Executes event handlers within Orleans grain context",
            agentParams: null,
            propertyJsonSchema: null,
            defaultValues: null,
          },
          {
            agentType: "aevatar.result",
            fullName: "Aevatar.GAgents.Executor.ResultGAgent",
            description:
              "This is a GAgent for collecting GAgent's event handler execution results with Streams support.",
            agentParams: [
              {
                name: "ExecutionId",
                type: "System.String",
              },
              {
                name: "StreamProvider",
                type: "System.String",
              },
              {
                name: "StreamNamespace",
                type: "System.String",
              },
              {
                name: "ExpectedResultType",
                type: "System.Type",
              },
            ],
            propertyJsonSchema:
              '{\n  "$schema": "http://json-schema.org/draft-04/schema#",\n  "title": "ResultGAgentConfiguration",\n  "type": "object",\n  "additionalProperties": false,\n  "properties": {\n    "correlationId": {\n      "type": [\n        "null",\n        "string"\n      ],\n      "format": "guid"\n    },\n    "publisherGrainId": {\n      "$ref": "#/definitions/GrainId"\n    },\n    "executionId": {\n      "type": "string"\n    },\n    "streamProvider": {\n      "type": "string"\n    },\n    "streamNamespace": {\n      "type": "string"\n    },\n    "expectedResultType": {\n      "type": [\n        "null",\n        "string"\n      ]\n    }\n  },\n  "definitions": {\n    "GrainId": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "type": {\n          "$ref": "#/definitions/GrainType"\n        },\n        "key": {\n          "$ref": "#/definitions/IdSpan"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "GrainType": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "value": {\n          "$ref": "#/definitions/IdSpan"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "IdSpan": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "value": {\n          "$ref": "#/definitions/ReadOnlyMemoryOfByte"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "ReadOnlyMemoryOfByte": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "length": {\n          "type": "integer",\n          "format": "int32"\n        },\n        "isEmpty": {\n          "type": "boolean"\n        },\n        "span": {\n          "$ref": "#/definitions/ReadOnlySpanOfByte"\n        }\n      }\n    },\n    "ReadOnlySpanOfByte": {\n      "type": "object",\n      "x-deprecated": true,\n      "x-deprecatedMessage": "Types with embedded references are not supported in this version of your compiler.",\n      "additionalProperties": false,\n      "properties": {\n        "length": {\n          "type": "integer",\n          "format": "int32"\n        },\n        "isEmpty": {\n          "type": "boolean"\n        }\n      }\n    }\n  }\n}',
            defaultValues: {
              executionId: null,
              streamProvider: null,
              streamNamespace: null,
              expectedResultType: null,
            },
          },
          {
            agentType:
              "Aevatar.GAgents.GroupChat.WorkflowCoordinator.WorkflowCoordinatorGAgent",
            fullName:
              "Aevatar.GAgents.GroupChat.WorkflowCoordinator.WorkflowCoordinatorGAgent",
            description:
              "WorkflowCoordinatorGAgent - Orchestrates complex workflow execution with DAG-based task dependencies. Manages workflow lifecycle (Pending→InProgress→Finished), validates topology to prevent loops, coordinates parallel execution of independent nodes, and ensures data flow through the Blackboard pattern. Current Status: Pending, Nodes: 0 (Completed: 0)",
            agentParams: [
              {
                name: "WorkflowUnitList",
                type: "System.Collections.Generic.List`1[Aevatar.GAgents.GroupChat.WorkflowCoordinator.Dto.WorkflowUnitDto]",
              },
              {
                name: "InitContent",
                type: "System.String",
              },
              {
                name: "EnableExecutionRecord",
                type: "System.Boolean",
              },
            ],
            propertyJsonSchema:
              '{\n  "$schema": "http://json-schema.org/draft-04/schema#",\n  "title": "WorkflowCoordinatorConfigDto",\n  "type": "object",\n  "additionalProperties": false,\n  "properties": {\n    "correlationId": {\n      "type": [\n        "null",\n        "string"\n      ],\n      "format": "guid"\n    },\n    "publisherGrainId": {\n      "$ref": "#/definitions/GrainId"\n    },\n    "workflowUnitList": {\n      "type": "array",\n      "description": "List of workflow units that define the execution sequence and flow",\n      "items": {\n        "$ref": "#/definitions/WorkflowUnitDto"\n      }\n    },\n    "initContent": {\n      "type": [\n        "null",\n        "string"\n      ],\n      "description": "Initial content or context to start the workflow execution"\n    },\n    "enableExecutionRecord": {\n      "type": "boolean",\n      "description": "Enables recording and tracking of workflow execution steps for debugging and monitoring"\n    }\n  },\n  "definitions": {\n    "GrainId": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "type": {\n          "$ref": "#/definitions/GrainType"\n        },\n        "key": {\n          "$ref": "#/definitions/IdSpan"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "GrainType": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "value": {\n          "$ref": "#/definitions/IdSpan"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "IdSpan": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "value": {\n          "$ref": "#/definitions/ReadOnlyMemoryOfByte"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "ReadOnlyMemoryOfByte": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "length": {\n          "type": "integer",\n          "format": "int32"\n        },\n        "isEmpty": {\n          "type": "boolean"\n        },\n        "span": {\n          "$ref": "#/definitions/ReadOnlySpanOfByte"\n        }\n      }\n    },\n    "ReadOnlySpanOfByte": {\n      "type": "object",\n      "x-deprecated": true,\n      "x-deprecatedMessage": "Types with embedded references are not supported in this version of your compiler.",\n      "additionalProperties": false,\n      "properties": {\n        "length": {\n          "type": "integer",\n          "format": "int32"\n        },\n        "isEmpty": {\n          "type": "boolean"\n        }\n      }\n    },\n    "WorkflowUnitDto": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "grainId": {\n          "type": "string",\n          "description": "Unique identifier for the current workflow unit/GAgent"\n        },\n        "nextGrainId": {\n          "type": "string",\n          "description": "Identifier for the next workflow unit/GAgent in the execution sequence"\n        },\n        "extendedData": {\n          "type": "object",\n          "description": "Additional configuration data and parameters specific to this workflow unit",\n          "additionalProperties": {\n            "type": "string"\n          }\n        }\n      }\n    }\n  }\n}',
            defaultValues: {
              workflowUnitList: [],
              initContent: null,
              enableExecutionRecord: false,
            },
          },
          {
            agentType:
              "Aevatar.GAgents.GroupChat.WorkflowCoordinator.WorkflowExecutionRecordGAgent",
            fullName:
              "Aevatar.GAgents.GroupChat.WorkflowCoordinator.WorkflowExecutionRecordGAgent",
            description: "Workflow Execution Record GAgent",
            agentParams: null,
            propertyJsonSchema: null,
            defaultValues: null,
          },
          {
            agentType:
              "Aevatar.GAgents.GroupChat.GAgent.Coordinator.WorkflowView.WorkflowViewGAgent",
            fullName:
              "Aevatar.GAgents.GroupChat.GAgent.Coordinator.WorkflowView.WorkflowViewGAgent",
            description: "Workflow View GAgent",
            agentParams: [
              {
                name: "WorkflowNodeList",
                type: "System.Collections.Generic.List`1[Aevatar.GAgents.GroupChat.GAgent.Coordinator.WorkflowView.Dto.WorkflowNodeDto]",
              },
              {
                name: "WorkflowNodeUnitList",
                type: "System.Collections.Generic.List`1[Aevatar.GAgents.GroupChat.GAgent.Coordinator.WorkflowView.Dto.WorkflowNodeUnitDto]",
              },
              {
                name: "Name",
                type: "System.String",
              },
              {
                name: "WorkflowCoordinatorGAgentId",
                type: "System.Guid",
              },
            ],
            propertyJsonSchema:
              '{\n  "$schema": "http://json-schema.org/draft-04/schema#",\n  "title": "WorkflowViewConfigDto",\n  "type": "object",\n  "additionalProperties": false,\n  "properties": {\n    "correlationId": {\n      "type": [\n        "null",\n        "string"\n      ],\n      "format": "guid"\n    },\n    "publisherGrainId": {\n      "$ref": "#/definitions/GrainId"\n    },\n    "workflowNodeList": {\n      "type": "array",\n      "items": {\n        "$ref": "#/definitions/WorkflowNodeDto"\n      }\n    },\n    "workflowNodeUnitList": {\n      "type": "array",\n      "items": {\n        "$ref": "#/definitions/WorkflowNodeUnitDto"\n      }\n    },\n    "name": {\n      "type": "string"\n    },\n    "workflowCoordinatorGAgentId": {\n      "type": "string",\n      "format": "guid"\n    }\n  },\n  "definitions": {\n    "GrainId": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "type": {\n          "$ref": "#/definitions/GrainType"\n        },\n        "key": {\n          "$ref": "#/definitions/IdSpan"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "GrainType": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "value": {\n          "$ref": "#/definitions/IdSpan"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "IdSpan": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "value": {\n          "$ref": "#/definitions/ReadOnlyMemoryOfByte"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "ReadOnlyMemoryOfByte": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "length": {\n          "type": "integer",\n          "format": "int32"\n        },\n        "isEmpty": {\n          "type": "boolean"\n        },\n        "span": {\n          "$ref": "#/definitions/ReadOnlySpanOfByte"\n        }\n      }\n    },\n    "ReadOnlySpanOfByte": {\n      "type": "object",\n      "x-deprecated": true,\n      "x-deprecatedMessage": "Types with embedded references are not supported in this version of your compiler.",\n      "additionalProperties": false,\n      "properties": {\n        "length": {\n          "type": "integer",\n          "format": "int32"\n        },\n        "isEmpty": {\n          "type": "boolean"\n        }\n      }\n    },\n    "WorkflowNodeDto": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "agentType": {\n          "type": "string"\n        },\n        "name": {\n          "type": "string"\n        },\n        "extendedData": {\n          "type": "object",\n          "additionalProperties": {\n            "type": "string"\n          }\n        },\n        "jsonProperties": {\n          "type": "string"\n        },\n        "nodeId": {\n          "type": "string",\n          "format": "guid"\n        },\n        "agentId": {\n          "type": "string",\n          "format": "guid"\n        }\n      }\n    },\n    "WorkflowNodeUnitDto": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "nodeId": {\n          "type": "string",\n          "format": "guid"\n        },\n        "nextNodeId": {\n          "type": "string",\n          "format": "guid"\n        }\n      }\n    }\n  }\n}',
            defaultValues: {
              workflowNodeList: [],
              workflowNodeUnitList: [],
              name: null,
              workflowCoordinatorGAgentId:
                "00000000-0000-0000-0000-000000000000",
            },
          },
          {
            agentType: "blackboardgagent",
            fullName: "GroupChat.GAgent.Feature.Blackboard.BlackboardGAgent",
            description:
              "BlackboardGAgent - A shared memory space for workflow execution. Stores conversation history, intermediate results, and enables data sharing between non-connected workflow nodes. Acts as the central data repository following the Blackboard architectural pattern.",
            agentParams: null,
            propertyJsonSchema: null,
            defaultValues: null,
          },
          {
            agentType: "Aevatar.GAgents.InputGAgent.GAgent.InputGAgent",
            fullName: "Aevatar.GAgents.InputGAgent.GAgent.InputGAgent",
            description: "Input agent that returns configured input text",
            agentParams: [
              {
                name: "Input",
                type: "System.String",
              },
            ],
            propertyJsonSchema:
              '{\n  "$schema": "http://json-schema.org/draft-04/schema#",\n  "title": "InputConfigDto",\n  "type": "object",\n  "additionalProperties": false,\n  "required": [\n    "memberName",\n    "input"\n  ],\n  "properties": {\n    "memberName": {\n      "type": "string",\n      "description": "The name of the group member agent, used for identification and display purposes",\n      "maxLength": 100,\n      "minLength": 1\n    },\n    "correlationId": {\n      "type": [\n        "null",\n        "string"\n      ],\n      "format": "guid"\n    },\n    "publisherGrainId": {\n      "$ref": "#/definitions/GrainId"\n    },\n    "input": {\n      "type": "string",\n      "description": "The input text that will be returned as a chat response when the agent is queried",\n      "maxLength": 5000,\n      "minLength": 1\n    }\n  },\n  "definitions": {\n    "GrainId": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "type": {\n          "$ref": "#/definitions/GrainType"\n        },\n        "key": {\n          "$ref": "#/definitions/IdSpan"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "GrainType": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "value": {\n          "$ref": "#/definitions/IdSpan"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "IdSpan": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "value": {\n          "$ref": "#/definitions/ReadOnlyMemoryOfByte"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "ReadOnlyMemoryOfByte": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "length": {\n          "type": "integer",\n          "format": "int32"\n        },\n        "isEmpty": {\n          "type": "boolean"\n        },\n        "span": {\n          "$ref": "#/definitions/ReadOnlySpanOfByte"\n        }\n      }\n    },\n    "ReadOnlySpanOfByte": {\n      "type": "object",\n      "x-deprecated": true,\n      "x-deprecatedMessage": "Types with embedded references are not supported in this version of your compiler.",\n      "additionalProperties": false,\n      "properties": {\n        "length": {\n          "type": "integer",\n          "format": "int32"\n        },\n        "isEmpty": {\n          "type": "boolean"\n        }\n      }\n    }\n  }\n}',
            defaultValues: {
              input: "",
            },
          },
          {
            agentType: "aevatar.mcp",
            fullName: "Aevatar.GAgents.MCP.GAgents.MCPGAgent",
            description:
              "MCP GAgent for interacting with Model Context Protocol servers",
            agentParams: [
              {
                name: "ServerConfig",
                type: "Aevatar.GAgents.MCP.Options.MCPServerConfig",
              },
              {
                name: "RequestTimeout",
                type: "System.TimeSpan",
              },
            ],
            propertyJsonSchema:
              '{\n  "$schema": "http://json-schema.org/draft-04/schema#",\n  "title": "MCPGAgentConfig",\n  "type": "object",\n  "additionalProperties": false,\n  "required": [\n    "memberName",\n    "serverConfig"\n  ],\n  "properties": {\n    "memberName": {\n      "type": "string",\n      "description": "The name of the group member agent, used for identification and display purposes",\n      "maxLength": 100,\n      "minLength": 1\n    },\n    "correlationId": {\n      "type": [\n        "null",\n        "string"\n      ],\n      "format": "guid"\n    },\n    "publisherGrainId": {\n      "$ref": "#/definitions/GrainId"\n    },\n    "serverConfig": {\n      "description": "Configuration for the MCP (Model Context Protocol) server that provides tools and capabilities",\n      "oneOf": [\n        {\n          "$ref": "#/definitions/MCPServerConfig"\n        }\n      ]\n    },\n    "requestTimeout": {\n      "type": "string",\n      "description": "Timeout duration for MCP server requests to prevent hanging operations",\n      "format": "duration"\n    }\n  },\n  "definitions": {\n    "GrainId": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "type": {\n          "$ref": "#/definitions/GrainType"\n        },\n        "key": {\n          "$ref": "#/definitions/IdSpan"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "GrainType": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "value": {\n          "$ref": "#/definitions/IdSpan"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "IdSpan": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "value": {\n          "$ref": "#/definitions/ReadOnlyMemoryOfByte"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "ReadOnlyMemoryOfByte": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "length": {\n          "type": "integer",\n          "format": "int32"\n        },\n        "isEmpty": {\n          "type": "boolean"\n        },\n        "span": {\n          "$ref": "#/definitions/ReadOnlySpanOfByte"\n        }\n      }\n    },\n    "ReadOnlySpanOfByte": {\n      "type": "object",\n      "x-deprecated": true,\n      "x-deprecatedMessage": "Types with embedded references are not supported in this version of your compiler.",\n      "additionalProperties": false,\n      "properties": {\n        "length": {\n          "type": "integer",\n          "format": "int32"\n        },\n        "isEmpty": {\n          "type": "boolean"\n        }\n      }\n    },\n    "MCPServerConfig": {\n      "type": "object",\n      "additionalProperties": false,\n      "required": [\n        "serverName",\n        "command"\n      ],\n      "properties": {\n        "serverName": {\n          "type": "string",\n          "maxLength": 100,\n          "minLength": 1\n        },\n        "command": {\n          "type": "string",\n          "maxLength": 200,\n          "minLength": 1\n        },\n        "args": {\n          "type": "array",\n          "items": {\n            "type": "string"\n          }\n        },\n        "env": {\n          "type": "object",\n          "additionalProperties": {\n            "type": "string"\n          }\n        },\n        "description": {\n          "type": "string",\n          "maxLength": 500,\n          "minLength": 0\n        },\n        "url": {\n          "type": [\n            "null",\n            "string"\n          ],\n          "maxLength": 1000,\n          "minLength": 0,\n          "pattern": "^https?://[^\\\\s/$.?#].[^\\\\s]*$"\n        },\n        "type": {\n          "$ref": "#/definitions/MCPServerType"\n        }\n      }\n    },\n    "MCPServerType": {\n      "type": "integer",\n      "description": "0 = Stdio\\n1 = StreamableHttp",\n      "x-enumNames": [\n        "Stdio",\n        "StreamableHttp"\n      ],\n      "enum": [\n        0,\n        1\n      ]\n    }\n  }\n}',
            defaultValues: {
              serverConfig: {
                serverName: "",
                command: "",
                args: [],
                env: {},
                description: "",
                url: null,
                type: 0,
              },
              requestTimeout: "00:00:30",
            },
          },
          {
            agentType: "psi.omni",
            fullName: "Aevatar.GAgents.PsiOmni.PsiOmniGAgent",
            description: "PsiOmni Integration Agent",
            agentParams: [
              {
                name: "ParentId",
                type: "System.String",
              },
              {
                name: "Name",
                type: "System.String",
              },
              {
                name: "Depth",
                type: "System.Int32",
              },
              {
                name: "LLMConfig",
                type: "Aevatar.GAgents.AIGAgent.Dtos.LLMConfigDto",
              },
              {
                name: "Description",
                type: "System.String",
              },
              {
                name: "Examples",
                type: "System.String",
              },
            ],
            propertyJsonSchema:
              '{\n  "$schema": "http://json-schema.org/draft-04/schema#",\n  "title": "PsiOmniGAgentConfig",\n  "type": "object",\n  "additionalProperties": false,\n  "properties": {\n    "memberName": {\n      "type": "string",\n      "description": "The name of the group member agent, used for identification and display purposes"\n    },\n    "correlationId": {\n      "type": [\n        "null",\n        "string"\n      ],\n      "format": "guid"\n    },\n    "publisherGrainId": {\n      "$ref": "#/definitions/GrainId"\n    },\n    "parentId": {\n      "type": "string"\n    },\n    "name": {\n      "type": "string"\n    },\n    "depth": {\n      "type": "integer",\n      "format": "int32"\n    },\n    "llmConfig": {\n      "oneOf": [\n        {\n          "type": "null"\n        },\n        {\n          "$ref": "#/definitions/LLMConfigDto"\n        }\n      ]\n    },\n    "description": {\n      "type": "string"\n    },\n    "examples": {\n      "type": "string"\n    }\n  },\n  "definitions": {\n    "GrainId": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "type": {\n          "$ref": "#/definitions/GrainType"\n        },\n        "key": {\n          "$ref": "#/definitions/IdSpan"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "GrainType": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "value": {\n          "$ref": "#/definitions/IdSpan"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "IdSpan": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "value": {\n          "$ref": "#/definitions/ReadOnlyMemoryOfByte"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "ReadOnlyMemoryOfByte": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "length": {\n          "type": "integer",\n          "format": "int32"\n        },\n        "isEmpty": {\n          "type": "boolean"\n        },\n        "span": {\n          "$ref": "#/definitions/ReadOnlySpanOfByte"\n        }\n      }\n    },\n    "ReadOnlySpanOfByte": {\n      "type": "object",\n      "x-deprecated": true,\n      "x-deprecatedMessage": "Types with embedded references are not supported in this version of your compiler.",\n      "additionalProperties": false,\n      "properties": {\n        "length": {\n          "type": "integer",\n          "format": "int32"\n        },\n        "isEmpty": {\n          "type": "boolean"\n        }\n      }\n    },\n    "LLMConfigDto": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "systemLLM": {\n          "type": [\n            "null",\n            "string"\n          ],\n          "description": "The system-level LLM configuration name to use, references a pre-configured LLM setup",\n          "maxLength": 100,\n          "minLength": 1\n        },\n        "selfLLMConfig": {\n          "description": "Self-contained LLM configuration with provider, model, and API settings",\n          "oneOf": [\n            {\n              "type": "null"\n            },\n            {\n              "$ref": "#/definitions/SelfLLMConfig"\n            }\n          ]\n        }\n      }\n    },\n    "SelfLLMConfig": {\n      "type": "object",\n      "additionalProperties": false,\n      "required": [\n        "providerEnum",\n        "modelId"\n      ],\n      "properties": {\n        "providerEnum": {\n          "description": "The LLM provider to use (e.g., OpenAI, Azure, Anthropic)",\n          "oneOf": [\n            {\n              "$ref": "#/definitions/LLMProviderEnum"\n            }\n          ]\n        },\n        "modelId": {\n          "description": "The specific model ID to use from the selected provider",\n          "oneOf": [\n            {\n              "$ref": "#/definitions/ModelIdEnum"\n            }\n          ]\n        },\n        "modelName": {\n          "type": "string",\n          "description": "Custom model name, used when the standard ModelId doesn\'t match the actual model name",\n          "maxLength": 200,\n          "minLength": 0\n        },\n        "apiKey": {\n          "type": "string",\n          "description": "The API key for authenticating with the LLM provider",\n          "maxLength": 500,\n          "minLength": 0\n        },\n        "endpoint": {\n          "type": "string",\n          "description": "The API endpoint URL for the LLM provider service",\n          "format": "uri",\n          "maxLength": 500,\n          "minLength": 0\n        },\n        "memo": {\n          "type": [\n            "null",\n            "object"\n          ],\n          "description": "Additional configuration parameters and metadata for the LLM setup",\n          "additionalProperties": {}\n        }\n      }\n    },\n    "LLMProviderEnum": {\n      "type": "integer",\n      "description": "0 = Azure\\n1 = OpenAI\\n2 = DeepSeek\\n3 = Google",\n      "x-enumNames": [\n        "Azure",\n        "OpenAI",\n        "DeepSeek",\n        "Google"\n      ],\n      "enum": [\n        0,\n        1,\n        2,\n        3\n      ]\n    },\n    "ModelIdEnum": {\n      "type": "integer",\n      "description": "0 = OpenAI\\n1 = DeepSeek\\n2 = Gemini\\n3 = OpenAITextToImage",\n      "x-enumNames": [\n        "OpenAI",\n        "DeepSeek",\n        "Gemini",\n        "OpenAITextToImage"\n      ],\n      "enum": [\n        0,\n        1,\n        2,\n        3\n      ]\n    }\n  }\n}',
            defaultValues: {
              parentId: "",
              name: "",
              depth: 0,
              lLMConfig: null,
              description: "",
              examples: "",
            },
          },
          {
            agentType: "Aevatar.GAgents.Twitter.Agent.TwitterGAgent",
            fullName: "Aevatar.GAgents.Twitter.Agent.TwitterGAgent",
            description: "Twitter Integration Agent",
            agentParams: [
              {
                name: "ConsumerKey",
                type: "System.String",
              },
              {
                name: "ConsumerSecret",
                type: "System.String",
              },
              {
                name: "EncryptionPassword",
                type: "System.String",
              },
              {
                name: "BearerToken",
                type: "System.String",
              },
              {
                name: "ReplyLimit",
                type: "System.Int32",
              },
            ],
            propertyJsonSchema:
              '{\n  "$schema": "http://json-schema.org/draft-04/schema#",\n  "title": "InitTwitterOptionsDto",\n  "type": "object",\n  "additionalProperties": false,\n  "required": [\n    "consumerKey",\n    "consumerSecret",\n    "encryptionPassword",\n    "bearerToken"\n  ],\n  "properties": {\n    "correlationId": {\n      "type": [\n        "null",\n        "string"\n      ],\n      "format": "guid"\n    },\n    "publisherGrainId": {\n      "$ref": "#/definitions/GrainId"\n    },\n    "consumerKey": {\n      "type": "string",\n      "minLength": 1,\n      "pattern": "^[A-Za-z0-9]+$"\n    },\n    "consumerSecret": {\n      "type": "string",\n      "minLength": 1,\n      "pattern": "^[A-Za-z0-9]+$"\n    },\n    "encryptionPassword": {\n      "type": "string",\n      "minLength": 1\n    },\n    "bearerToken": {\n      "type": "string",\n      "minLength": 1,\n      "pattern": "^[A-Za-z0-9_-]+$"\n    },\n    "replyLimit": {\n      "type": "integer",\n      "format": "int32"\n    }\n  },\n  "definitions": {\n    "GrainId": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "type": {\n          "$ref": "#/definitions/GrainType"\n        },\n        "key": {\n          "$ref": "#/definitions/IdSpan"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "GrainType": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "value": {\n          "$ref": "#/definitions/IdSpan"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "IdSpan": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "value": {\n          "$ref": "#/definitions/ReadOnlyMemoryOfByte"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "ReadOnlyMemoryOfByte": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "length": {\n          "type": "integer",\n          "format": "int32"\n        },\n        "isEmpty": {\n          "type": "boolean"\n        },\n        "span": {\n          "$ref": "#/definitions/ReadOnlySpanOfByte"\n        }\n      }\n    },\n    "ReadOnlySpanOfByte": {\n      "type": "object",\n      "x-deprecated": true,\n      "x-deprecatedMessage": "Types with embedded references are not supported in this version of your compiler.",\n      "additionalProperties": false,\n      "properties": {\n        "length": {\n          "type": "integer",\n          "format": "int32"\n        },\n        "isEmpty": {\n          "type": "boolean"\n        }\n      }\n    }\n  }\n}',
            defaultValues: {
              consumerKey: "YOUR_TWITTER_API_KEY",
              consumerSecret: "YOUR_API_SECRET",
              encryptionPassword: "YOUR_ENCRYPTION_PASSWORD",
              bearerToken: "YOUR_BEARER_TOKEN",
              replyLimit: 10,
            },
          },
          {
            agentType: "social.twitter.twitter-webapi",
            fullName: "Aevatar.GAgents.Twitter.GAgents.TwitterWebApiGAgent",
            description:
              "Twitter Web API GAgent (Refactored) - Modular Twitter/X API v2 Integration\n\nARCHITECTURE:\n• TwitterApiClient - Handles HTTP communication with rate limiting\n• TwitterAuthenticationHandler - Manages OAuth 1.0a and Bearer token auth\n• TwitterRateLimiter - Implements token bucket rate limiting\n\nCAPABILITIES:\n• Tweet Management (post, reply, quote, delete, search)\n• User Interactions (like, retweet, follow)\n• Timeline Operations (home, mentions, user timelines)\n• User Profile Management\n• Relationship Management\n\nAll operations use event sourcing for state management and support both\ninterface methods and event handlers for maximum flexibility.",
            agentParams: [
              {
                name: "ConsumerKey",
                type: "System.String",
              },
              {
                name: "ConsumerSecret",
                type: "System.String",
              },
              {
                name: "OAuthToken",
                type: "System.String",
              },
              {
                name: "OAuthTokenSecret",
                type: "System.String",
              },
              {
                name: "BearerToken",
                type: "System.String",
              },
              {
                name: "BaseApiUrl",
                type: "System.String",
              },
              {
                name: "RequestTimeoutSeconds",
                type: "System.Int32",
              },
              {
                name: "MaxRequestsPerWindow",
                type: "System.Int32",
              },
              {
                name: "RateLimitWindowMinutes",
                type: "System.Int32",
              },
              {
                name: "EnableRateLimiting",
                type: "System.Boolean",
              },
            ],
            propertyJsonSchema:
              '{\n  "$schema": "http://json-schema.org/draft-04/schema#",\n  "title": "TwitterWebApiGAgentConfiguration",\n  "type": "object",\n  "additionalProperties": false,\n  "properties": {\n    "correlationId": {\n      "type": [\n        "null",\n        "string"\n      ],\n      "format": "guid"\n    },\n    "publisherGrainId": {\n      "$ref": "#/definitions/GrainId"\n    },\n    "consumerKey": {\n      "type": "string"\n    },\n    "consumerSecret": {\n      "type": "string"\n    },\n    "oAuthToken": {\n      "type": "string"\n    },\n    "oAuthTokenSecret": {\n      "type": "string"\n    },\n    "bearerToken": {\n      "type": "string"\n    },\n    "baseApiUrl": {\n      "type": "string"\n    },\n    "requestTimeoutSeconds": {\n      "type": "integer",\n      "format": "int32"\n    },\n    "maxRequestsPerWindow": {\n      "type": "integer",\n      "format": "int32"\n    },\n    "rateLimitWindowMinutes": {\n      "type": "integer",\n      "format": "int32"\n    },\n    "enableRateLimiting": {\n      "type": "boolean"\n    }\n  },\n  "definitions": {\n    "GrainId": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "type": {\n          "$ref": "#/definitions/GrainType"\n        },\n        "key": {\n          "$ref": "#/definitions/IdSpan"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "GrainType": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "value": {\n          "$ref": "#/definitions/IdSpan"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "IdSpan": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "value": {\n          "$ref": "#/definitions/ReadOnlyMemoryOfByte"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "ReadOnlyMemoryOfByte": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "length": {\n          "type": "integer",\n          "format": "int32"\n        },\n        "isEmpty": {\n          "type": "boolean"\n        },\n        "span": {\n          "$ref": "#/definitions/ReadOnlySpanOfByte"\n        }\n      }\n    },\n    "ReadOnlySpanOfByte": {\n      "type": "object",\n      "x-deprecated": true,\n      "x-deprecatedMessage": "Types with embedded references are not supported in this version of your compiler.",\n      "additionalProperties": false,\n      "properties": {\n        "length": {\n          "type": "integer",\n          "format": "int32"\n        },\n        "isEmpty": {\n          "type": "boolean"\n        }\n      }\n    }\n  }\n}',
            defaultValues: {
              consumerKey: "",
              consumerSecret: "",
              oAuthToken: "",
              oAuthTokenSecret: "",
              bearerToken: "",
              baseApiUrl: "https://api.twitter.com/2",
              requestTimeoutSeconds: 30,
              maxRequestsPerWindow: 300,
              rateLimitWindowMinutes: 15,
              enableRateLimiting: true,
            },
          },
          {
            agentType:
              "Aevatar.GAgents.Twitter.GAgents.ChatAIAgent.ChatAIGAgent",
            fullName:
              "Aevatar.GAgents.Twitter.GAgents.ChatAIAgent.ChatAIGAgent",
            description: "Chat AI Agent for group conversations",
            agentParams: [
              {
                name: "Instructions",
                type: "System.String",
              },
              {
                name: "SystemLLM",
                type: "Aevatar.GAgents.Twitter.GAgents.ChatAIAgent.ChatAISystemLLMEnum",
              },
              {
                name: "MCPServers",
                type: "System.Collections.Generic.List`1[Aevatar.GAgents.MCP.Options.MCPServerConfig]",
              },
              {
                name: "ToolGAgentTypes",
                type: "System.Collections.Generic.List`1[Orleans.Runtime.GrainType]",
              },
              {
                name: "ToolGAgents",
                type: "System.Collections.Generic.List`1[Orleans.Runtime.GrainId]",
              },
            ],
            propertyJsonSchema:
              '{\n  "$schema": "http://json-schema.org/draft-04/schema#",\n  "title": "ChatAIGAgentConfigDto",\n  "type": "object",\n  "additionalProperties": false,\n  "properties": {\n    "memberName": {\n      "type": "string",\n      "description": "The name of the group member agent, used for identification and display purposes"\n    },\n    "correlationId": {\n      "type": [\n        "null",\n        "string"\n      ],\n      "format": "guid"\n    },\n    "publisherGrainId": {\n      "$ref": "#/definitions/GrainId"\n    },\n    "instructions": {\n      "type": "string",\n      "description": "System instructions that define the AI assistant\'s behavior and capabilities"\n    },\n    "systemLLM": {\n      "description": "The system LLM configuration to use for AI chat functionality",\n      "oneOf": [\n        {\n          "$ref": "#/definitions/ChatAISystemLLMEnum"\n        }\n      ]\n    },\n    "mcpServers": {\n      "type": "array",\n      "description": "List of MCP (Model Context Protocol) servers to enable additional tools and capabilities",\n      "items": {\n        "$ref": "#/definitions/MCPServerConfig"\n      }\n    },\n    "toolGAgentTypes": {\n      "type": "array",\n      "description": "List of GAgent types that can be used as tools by the AI chat agent",\n      "items": {\n        "$ref": "#/definitions/GrainType"\n      }\n    },\n    "toolGAgents": {\n      "type": "array",\n      "description": "List of specific GAgent instances that can be invoked as tools by the AI chat agent",\n      "items": {\n        "$ref": "#/definitions/GrainId"\n      }\n    }\n  },\n  "definitions": {\n    "GrainId": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "type": {\n          "$ref": "#/definitions/GrainType"\n        },\n        "key": {\n          "$ref": "#/definitions/IdSpan"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "GrainType": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "value": {\n          "$ref": "#/definitions/IdSpan"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "IdSpan": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "value": {\n          "$ref": "#/definitions/ReadOnlyMemoryOfByte"\n        },\n        "isDefault": {\n          "type": "boolean"\n        }\n      }\n    },\n    "ReadOnlyMemoryOfByte": {\n      "type": "object",\n      "additionalProperties": false,\n      "properties": {\n        "length": {\n          "type": "integer",\n          "format": "int32"\n        },\n        "isEmpty": {\n          "type": "boolean"\n        },\n        "span": {\n          "$ref": "#/definitions/ReadOnlySpanOfByte"\n        }\n      }\n    },\n    "ReadOnlySpanOfByte": {\n      "type": "object",\n      "x-deprecated": true,\n      "x-deprecatedMessage": "Types with embedded references are not supported in this version of your compiler.",\n      "additionalProperties": false,\n      "properties": {\n        "length": {\n          "type": "integer",\n          "format": "int32"\n        },\n        "isEmpty": {\n          "type": "boolean"\n        }\n      }\n    },\n    "ChatAISystemLLMEnum": {\n      "type": "integer",\n      "description": "0 = OpenAI\\n1 = DeepSeek\\n2 = AzureOpenAI\\n3 = AzureOpenAIEmbeddings\\n4 = OpenAIEmbeddings",\n      "x-enumNames": [\n        "OpenAI",\n        "DeepSeek",\n        "AzureOpenAI",\n        "AzureOpenAIEmbeddings",\n        "OpenAIEmbeddings"\n      ],\n      "enum": [\n        0,\n        1,\n        2,\n        3,\n        4\n      ],\n      "x-enumMetadatas": {\n        "OpenAI": {\n          "provider": "openai",\n          "type": "general-purpose llm",\n          "strengths": "creative writing, general reasoning, versatile, well-balanced performance",\n          "best_for": "general tasks, creative writing, conversational AI, content generation",\n          "speed": "fast and reliable"\n        },\n        "DeepSeek": {\n          "provider": "deepseek",\n          "type": "reasoning-optimized llm",\n          "strengths": "advanced reasoning, mathematical thinking, logical analysis, deep problem-solving",\n          "best_for": "complex reasoning, mathematical problems, analytical tasks, research assistance",\n          "speed": "moderate, optimized for accuracy over speed"\n        },\n        "AzureOpenAI": {\n          "provider": "azure_openai",\n          "type": "enterprise llm",\n          "strengths": "enterprise security, compliance, scalability, data privacy, regional deployment",\n          "best_for": "enterprise applications, production systems, secure environments, regulated industries",\n          "speed": "fast with enterprise-grade reliability"\n        },\n        "AzureOpenAIEmbeddings": {\n          "provider": "azure_openai",\n          "type": "embedding model",\n          "strengths": "semantic understanding, enterprise security, high-quality embeddings, data privacy",\n          "best_for": "semantic search, document similarity, enterprise RAG systems, secure vector operations",\n          "speed": "fast embedding generation with enterprise features"\n        },\n        "OpenAIEmbeddings": {\n          "provider": "openai",\n          "type": "embedding model",\n          "strengths": "semantic understanding, high-quality embeddings, versatile text representation",\n          "best_for": "semantic search, similarity tasks, RAG applications, content recommendation",\n          "speed": "fast embedding generation"\n        }\n      }\n    },\n    "MCPServerConfig": {\n      "type": "object",\n      "additionalProperties": false,\n      "required": [\n        "serverName",\n        "command"\n      ],\n      "properties": {\n        "serverName": {\n          "type": "string",\n          "maxLength": 100,\n          "minLength": 1\n        },\n        "command": {\n          "type": "string",\n          "maxLength": 200,\n          "minLength": 1\n        },\n        "args": {\n          "type": "array",\n          "items": {\n            "type": "string"\n          }\n        },\n        "env": {\n          "type": "object",\n          "additionalProperties": {\n            "type": "string"\n          }\n        },\n        "description": {\n          "type": "string",\n          "maxLength": 500,\n          "minLength": 0\n        },\n        "url": {\n          "type": [\n            "null",\n            "string"\n          ],\n          "maxLength": 1000,\n          "minLength": 0,\n          "pattern": "^https?://[^\\\\s/$.?#].[^\\\\s]*$"\n        },\n        "type": {\n          "$ref": "#/definitions/MCPServerType"\n        }\n      }\n    },\n    "MCPServerType": {\n      "type": "integer",\n      "description": "0 = Stdio\\n1 = StreamableHttp",\n      "x-enumNames": [\n        "Stdio",\n        "StreamableHttp"\n      ],\n      "enum": [\n        0,\n        1\n      ]\n    }\n  }\n}',
            defaultValues: {
              instructions: "You are a helpful AI assistant",
              systemLLM: 0,
              mCPServers: [],
              toolGAgentTypes: [],
              toolGAgents: [],
            },
          },
        ],
      });
    },
  });
};
