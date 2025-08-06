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
    // baseURL: "https://station-developer-dev-staging.aevatar.ai/proj1-client",
    baseURL:
      "https://station-developer-dev-staging.aevatar.ai/testproject3-client",
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
      console.log(workflowAgentId, result, "onEditWorkflow=");
    },
    [onShowWorkflow]
  );

  const [showAction, setShowAction] = useState<boolean>();

  const getTokenByclient = useCallback(async () => {
    // const sdkToken = await aevatarAI.getAuthTokenWithClient({
    //   grant_type: "password",
    //   scope: "Aevatar",
    //   username: "leotest@teml.net", // "leotest@teml.net", // (import.meta as any).env.VITE_APP_SERVICE_USERNAME,
    //   client_id: "AevatarAuthServer",
    //   password: "Leo123!", //"Leo123!", //(import.meta as any).env.VITE_APP_SERVICE_PASSWORD,
    // } as any);

    const TOKEN =
      "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjUwRjA2OTE5QzIzMUFFQUUxNDZEMzI0ODcyNTU3OEVCNjEyODU2NzUiLCJ4NXQiOiJVUEJwR2NJeHJxNFViVEpJY2xWNDYyRW9WblUiLCJ0eXAiOiJhdCtqd3QifQ.eyJpc3MiOiJodHRwczovL2F1dGgtc3RhdGlvbi1kZXYtc3RhZ2luZy5hZXZhdGFyLmFpLyIsImV4cCI6MTc1NDYyNjQ1NiwiaWF0IjoxNzU0NDUzNjU3LCJhdWQiOiJBZXZhdGFyIiwic2NvcGUiOiJBZXZhdGFyIG9mZmxpbmVfYWNjZXNzIiwianRpIjoiZTYzZjAwNjAtNjlhZC00MjY5LWIxNGMtY2FiMDkzNWY1MWIyIiwic3ViIjoiZjA4Mzk2NGItMmQ0OS00YzM5LWIyN2EtZGJjMmMxN2M3OTM2IiwicHJlZmVycmVkX3VzZXJuYW1lIjoiY2pocm95OThAZ21haWwuY29tQGdvb2dsZSIsImVtYWlsIjoiMjNhYTFiNTUyMmNlNDE5Y2I0ZjZiYjFmOTMwMDlkMjBAQUJQLklPIiwicm9sZSI6WyJiYXNpY1VzZXIiLCIzYTE1NGI2NC1lYjRhLWMyM2YtY2QwMy0zYTFiMWE3YWNhOWRfT3duZXIiXSwicGhvbmVfbnVtYmVyX3ZlcmlmaWVkIjoiRmFsc2UiLCJlbWFpbF92ZXJpZmllZCI6IkZhbHNlIiwidW5pcXVlX25hbWUiOiJjamhyb3k5OEBnbWFpbC5jb21AZ29vZ2xlIiwic2VjdXJpdHlfc3RhbXAiOiJPRUFJWk9GRU0yQ0NURFlXVjRWR1hTSDRDWlRUMk5WUSIsIm9pX3Byc3QiOiJBZXZhdGFyQXV0aFNlcnZlciIsIm9pX2F1X2lkIjoiODBjMDIzOTktZjY0Zi1hYTBhLTI0ZGItM2ExYjhmNzVhNDBmIiwiY2xpZW50X2lkIjoiQWV2YXRhckF1dGhTZXJ2ZXIiLCJvaV90a25faWQiOiI0OTA4YWE4NC02ZmM3LTNjNWQtYzI1NC0zYTFiOGZjMzIxNTMifQ.Bt6ZNqRNmcxdSMVO-wz139oSa_rbRZYNgDElMXkIE2tkUjGBVztkpT4P1O4vOO86t-BUktaRcSOyxVR6BKzTJW1K6sVmV7IewN5Gr17yKPmjLp-8gyphZbyuvYewjKVVXcSW2qig9DTeOJ825xaxNW4Zq8llcXzMqxL1h5WtdXzA2U7sc6ai352oieYMcDCWAIAZcWEl5EqJqWl6HCDOkGRQvU0hV01kAV79s_fTrP0hPuaG48p9Y9xKUPvQhC3vSyjdBZQFCFgPJrPY153l8CqzaeBCQSKVrfGqituvbzpBFvwELSPNtUmltjFfpelKKVw-As1NwZsaAVmUOAhB_Q";
    aevatarAI.fetchRequest.setHeaders({
      // authorization: sdkToken,
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
      // hiddenGAevatarType={
      //   [
      //     // "Aevatar.SignalR.GAgents.SignalRGAgent",
      //     // "Aevatar.GAgents.GroupChat.WorkflowCoordinator.WorkflowCoordinatorGAgent",
      //   ]
      // }
      >
        <LoginButton />

        <AuthButton onFinish={onAuthFinish} />
        <div className="h-[10px]" />

        <Button onClick={getTokenByclient}>getTokenByclient</Button>
        {/* {showAction && (
          <> */}
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
