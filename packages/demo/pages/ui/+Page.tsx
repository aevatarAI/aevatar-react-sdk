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

ConfigProvider.setConfig({
  requestDefaults: {
    timeout: 15000,
    baseURL:
      // "https://station-developer-dev-staging.aevatar.ai/testproject-client",
      "https://station-developer-dev-staging.aevatar.ai/testproject7-client",
  },
});

enum Stage {
  myGAevatar = "MyGAevatar",
  newGAevatar = "newGAevatar",
  editGAevatar = "editGAevatar",
  Workflow = "Workflow",
  WorkflowList = "WorkflowList",
  ExecutionList = "ExecutionList",
}

export default function UI() {
  const [stage, setStage] = useState<Stage>();
  const [gaevatarList, setGaevatarList] = useState<IAgentInfoDetail[]>();
  const onNewGAevatar = useCallback(() => {
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
    const agentTypeList =
      await aevatarAI.services.agent.getAllAgentsConfiguration();

    setAgentTypeList(agentTypeList);
  }, []);

  const onShowWorkflow = useCallback(async () => {
    await refreshGaevatarList();
    setStage(Stage.Workflow);
  }, [refreshGaevatarList]);

  const [editWorkflow, setEditWorkflow] = useState<any>();

  const onEditWorkflow = useCallback(
    async (workflowAgentId: string) => {
      const result = await aevatarAI.getWorkflowViewDataByAgentId(
        workflowAgentId
      );
      setEditWorkflow({
        workflowAgentId,
        workflowId: result.workflowId,
        workflowName: result.workflowName,
        workflowViewData: result.workflowViewData,
      });
      onShowWorkflow();
    },
    [onShowWorkflow]
  );

  const [showAction, setShowAction] = useState<boolean>();

  const getTokenByclient = useCallback(async () => {
    const TOKEN =
      "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjUwRjA2OTE5QzIzMUFFQUUxNDZEMzI0ODcyNTU3OEVCNjEyODU2NzUiLCJ4NXQiOiJVUEJwR2NJeHJxNFViVEpJY2xWNDYyRW9WblUiLCJ0eXAiOiJhdCtqd3QifQ.eyJpc3MiOiJodHRwczovL2F1dGgtc3RhdGlvbi1kZXYtc3RhZ2luZy5hZXZhdGFyLmFpLyIsImV4cCI6MTc1NTcyMTgzOCwiaWF0IjoxNzU1NTQ5MDM5LCJhdWQiOiJBZXZhdGFyIiwic2NvcGUiOiJBZXZhdGFyIG9mZmxpbmVfYWNjZXNzIiwianRpIjoiZGQ1M2UzZjAtMDlmZC00NWM0LTlkYjAtNGVlNmUwY2I1ZTFiIiwic3ViIjoiZTYyYjdmNmQtNjgyOS00NDI4LWIxN2MtZTE2M2NhOGZmMDQ5IiwicHJlZmVycmVkX3VzZXJuYW1lIjoicm95LmNoZW9uZ0BhZWxmLmlvQGdvb2dsZSIsImVtYWlsIjoiOGZiZjY5MzhkNzJhNGZlNGFhMWYyOTA1MWM1MWRlYzZAQUJQLklPIiwicm9sZSI6WyJiYXNpY1VzZXIiLCJlZTRhYmVkMC1jYzlkLWYwYzctMjRiZC0zYTFiMWRmODEwNGVfT3duZXIiXSwicGhvbmVfbnVtYmVyX3ZlcmlmaWVkIjoiRmFsc2UiLCJlbWFpbF92ZXJpZmllZCI6IkZhbHNlIiwidW5pcXVlX25hbWUiOiJyb3kuY2hlb25nQGFlbGYuaW9AZ29vZ2xlIiwic2VjdXJpdHlfc3RhbXAiOiI1NkxJQ0ZMTDVQTUJTQkZaQUNSVlU0N1A1RDJOWVhJRyIsImlzX25ld191c2VyIjpmYWxzZSwib2lfcHJzdCI6IkFldmF0YXJBdXRoU2VydmVyIiwib2lfYXVfaWQiOiI4MWZhY2IzZC03YzY4LThmYzYtZDBmNC0zYTFiZDEwZDUxYTQiLCJjbGllbnRfaWQiOiJBZXZhdGFyQXV0aFNlcnZlciIsIm9pX3Rrbl9pZCI6ImEwZjU0ZTlhLTM1OTgtNGM0MC00MjVkLTNhMWJkMTBkNTFiMiJ9.Sz4hrPCvaIJlc6_-20VHQYPjMucbYZOVfyrWZhKkKwclnlcAM-GSHqG8yFyxxt7za16IcrysJu_7YavU-TIY702DrgNWFo1jmv4FMrd5KHluTZ5pXBKc6QIG5KA2KGT7irHjMITJXC_IoSoxfS_Zw1aJRJDJgU1CzZR6ppsR08OPQqS2hagsrpfYF1ksPOqX88ug1Tdo354M5zeTZXiYj2nqWqxSONx0qPeCMYqzd704weWFOhtfBvwloprMXjXQga5G_bzFVB2OFC8H8Ax0GhNARu6_xC1DI8SGPav4cBBUkv3qZI39-fLZzJfCSaI2CoDs-6SMFKWDxRvpBTsh4A";
    aevatarAI.fetchRequest.setHeaders({
      Authorization: TOKEN,
    });

    setShowAction(true);
  }, []);

  const fullscreenHandle = useFullScreenHandle();
  const workflowListRef = useRef<IWorkflowListRef>(null);

  const getWorkflowDetail = useCallback(async (workflowAgentId: string) => {
    await sleep(2000);
    const result = await aevatarAI.getWorkflowUnitRelationByAgentId(
      workflowAgentId
    );
    setEditWorkflow({
      workflowAgentId,
      workflowName: result.workflowName,
      workUnitRelations: result.workUnitRelations,
    });
  }, []);

  return (
    <div className="min-w-[375px]">
      <AevatarProvider>
        <LoginButton />

        <AuthButton onFinish={onAuthFinish} />
        <div className="h-[10px]" />

        <Button onClick={getTokenByclient}>getTokenByclient</Button>
        <Button onClick={onShowGaevatar}>show gaevatar</Button>
        <Button
          onClick={() => {
            setEditWorkflow(undefined);
            onShowWorkflow();
          }}
        >
          show workflow
        </Button>
        <Button
          onClick={() => {
            onEditWorkflow(localStorage.getItem("workflowAgentId") ?? "");
          }}
        >
          edit workflow
        </Button>
        <div className="h-[10px]" />
        <Button
          onClick={() => {
            setStage(Stage.WorkflowList);
          }}
        >
          show workflowList
        </Button>
        <Button
          onClick={() => {
            workflowListRef.current?.refresh();
          }}
        >
          refresh workflowList
        </Button>
        <Button
          onClick={() => {
            setStage(Stage.ExecutionList);
          }}
        >
          show executions
        </Button>

        <div className="text-[12px] lg:text-[24px]">aad</div>

        {stage === Stage.myGAevatar && (
          <MyGAevatar
            height={600}
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
                gaevatarList,
                isNewGAevatar: true,
                gaevatarTypeList: agentTypeList,
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
                    }}
                  >
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
              editWorkflow={editWorkflow}
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
                setEditWorkflow(undefined);
                onShowWorkflow();
              }}
            />
          </div>
        )}
      </AevatarProvider>
    </div>
  );
}

// const sdkToken = await aevatarAI.getAuthTokenWithClient({
//   grant_type: "password",
//   scope: "Aevatar",
//   username: "leotest@teml.net", // "leotest@teml.net", // (import.meta as any).env.VITE_APP_SERVICE_USERNAME,
//   client_id: "AevatarAuthServer",
//   password: "Leo123!", //"Leo123!", //(import.meta as any).env.VITE_APP_SERVICE_PASSWORD,
// } as any);
