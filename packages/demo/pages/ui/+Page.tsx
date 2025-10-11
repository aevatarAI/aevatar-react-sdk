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
  type Theme,
} from "@aevatar-react-sdk/ui-react";
import { useCallback, useEffect, useRef, useState } from "react";
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
      "https://station-developer-testing.aevatar.ai/default-project-0b0a-0aa4fc74-1c53-client",
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
  const [theme, setTheme] = useState<Theme>("light");
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
      "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjU0NDVCQzY0RUFDM0YxOTVDRDBCNTQwRTQwNjA1NkQ3NzI0QTQ3RkYiLCJ4NXQiOiJWRVc4Wk9yRDhaWE5DMVFPUUdCVzEzSktSXzgiLCJ0eXAiOiJhdCtqd3QifQ.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwODIvIiwiZXhwIjoxNzYwMzQwODEzLCJpYXQiOjE3NjAxNjgwMTQsImF1ZCI6IkFldmF0YXIiLCJzY29wZSI6IkFldmF0YXIgb2ZmbGluZV9hY2Nlc3MiLCJqdGkiOiI5ZGZhNGZkOC0wM2U0LTQxODgtODNiZS0xMmMxYWI0YmQ3MzAiLCJzdWIiOiIxZTJkMWU5OC05N2IzLTA0NGYtNjk1MC0zYTFjZDkwMzU5YjUiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJydW51bHIiLCJlbWFpbCI6InJ1bnVsckBzbmFwbWFpbC5jYyIsInJvbGUiOlsiYmFzaWNVc2VyIiwiMGFhNGZjNzQtOGNhMi01ODVmLWE2MzUtM2ExY2Q5MDM4M2EwX093bmVyIiwiNzQ5MjVjN2EtZmJjNy1kZGM5LWM5YmQtM2ExY2Q5MDM4NWU1X093bmVyIl0sInBob25lX251bWJlcl92ZXJpZmllZCI6IkZhbHNlIiwiZW1haWxfdmVyaWZpZWQiOiJGYWxzZSIsInVuaXF1ZV9uYW1lIjoicnVudWxyIiwic2VjdXJpdHlfc3RhbXAiOiJFMjNUQklMSEFUWUlSUlpRWUhKSU9HRzNRREJYVUdXUyIsIm9pX3Byc3QiOiJBZXZhdGFyQXV0aFNlcnZlciIsIm9pX2F1X2lkIjoiYWY3OWY4ZWQtMjlkNy02ZWMwLWI4ZTktM2ExY2Q5MDM1ZjU5IiwiY2xpZW50X2lkIjoiQWV2YXRhckF1dGhTZXJ2ZXIiLCJvaV90a25faWQiOiJmYzFmMTAzNi00MjY5LThkZDctZjhiYy0zYTFjZTQ1ZDQ5MjIifQ.qVBXpAmxk5dzXxkpyyOMe3OYhkVPL-Xm_l8JKd4E0ACV5ZGsfhFqo8lQ0PA4M47UgMcLqRMfEbF4-iIL99twveAyAqkD84XJOLH5SdoVPWKdU-QGfYnFdY3xpdShiv8w_Un5FMTxUF747YIEOzCzfWuQNJoaskL_hz0kFjEqMfe8bj7Vyw0w7FhuKXSCMGH-SqaovgZzhYLzZ8G9f8jhlZRtVI3ICDhf6xtrrac9eP2mfGPA5HdQjLAmhdsr5g1CI9Cm2g-cbGW0LZ0zjJHn3Mcqr4Egu1Sx7AvnFxSvKQhR3JHRaB4wbJHlEB0Weliz0SA6kAJ3OIiygglhN4Ye4w";
    aevatarAI.fetchRequest.setHeaders({
      Authorization: TOKEN,
    });

    setShowAction(true);
    return TOKEN;
  }, []);

  useEffect(() => {
    ConfigProvider.setConfig({
      getAevatarAuthToken: getTokenByclient,
    });
  }, [getTokenByclient]);

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
      <AevatarProvider theme={theme}>
        <LoginButton />

        <AuthButton onFinish={onAuthFinish} />
        <div className="h-[10px]" />
        <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          change {theme} to {theme === "dark" ? "light" : "dark"}
        </Button>
        <Button onClick={getTokenByclient}>getTokenByclient</Button>
        <Button onClick={onShowGaevatar}>show gaevatar</Button>

        <Button
          onClick={() => {
            setEditWorkflow(undefined);
            onShowWorkflow();
          }}>
          show workflow
        </Button>
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
        <Button
          onClick={() => {
            setStage(Stage.ExecutionList);
          }}>
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
                <div className="w-full h-full bg-[var(--sdk-workflow-menu-bg)] flex flow-row border-[1px] border-[var(--sdk-border-color)]">
                  {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
                  <div
                    className={`p-[4px] w-[26px] h-[26px] flex justify-center items-center cursor-pointer ${
                      fullscreenHandle.active
                        ? "bg-[var(--sdk-color-highlight-blue)]"
                        : ""
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
                          ? "text-[var(--sdk-color-text-primary)]"
                          : "text-[var(--sdk-color-text-primary)]"
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
