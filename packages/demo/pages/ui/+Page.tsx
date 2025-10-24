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
      "https://station-developer-testing.aevatar.ai/test-work-7d33c579-40e1-client",
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
      "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6Ijg4MzZFOERDQjM2QkZERUUwMDY1QTg2MTE3QTE1N0FDNTUxMjhBNUEiLCJ4NXQiOiJpRGJvM0xOcl9lNEFaYWhoRjZGWHJGVVNpbG8iLCJ0eXAiOiJhdCtqd3QifQ.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwODIvIiwiZXhwIjoxNzYxNDU0NTIxLCJpYXQiOjE3NjEyODE3MjIsImF1ZCI6IkFldmF0YXIiLCJzY29wZSI6IkFldmF0YXIgb2ZmbGluZV9hY2Nlc3MiLCJqdGkiOiI0MTBlZDA0Yy0zZDM4LTQ1ODgtOWQ0Ni04ZWE1ZDRkNGZhZTYiLCJzdWIiOiI3NTczY2Y5MS00NmJhLWFkNTctZTU1Yi0zYTFkMTJhMjcxZGUiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJsb3VpcyIsImVtYWlsIjoibGl5aW5ncGVpMzNAMTYzLmNvbSIsInJvbGUiOlsiN2QzM2M1NzktMjg0NC0wM2M1LTIwOWMtM2ExZDEyYTI5MGUyX093bmVyIiwiODQ4MGNkZTgtOWE4Mi1kOTJhLTI3NjMtM2ExZDI2YmYxNmE0X093bmVyIiwiYmFzaWNVc2VyIiwiN2JlZTk5NWItYTY4YS0yMTNiLTE3ZWEtM2ExZDI2YWMwNzI3X093bmVyIl0sInBob25lX251bWJlcl92ZXJpZmllZCI6IkZhbHNlIiwiZW1haWxfdmVyaWZpZWQiOiJGYWxzZSIsInVuaXF1ZV9uYW1lIjoibG91aXMiLCJzZWN1cml0eV9zdGFtcCI6IlVTWU9RTVZDSFJKUzNaQ1YzN1pUS0ZWR1k0RVBITkFZIiwib2lfcHJzdCI6IkFldmF0YXJBdXRoU2VydmVyIiwib2lfYXVfaWQiOiIwOWQ5ODI1MS0zZjZiLTY4Y2YtMmYzNi0zYTFkMTJhMjc3NGUiLCJjbGllbnRfaWQiOiJBZXZhdGFyQXV0aFNlcnZlciIsIm9pX3Rrbl9pZCI6ImZiOWIxN2ZmLWVlODQtNWQxNC02MTEzLTNhMWQyNmJmMWVmZCJ9.MK3k5haJdiyUsVM5nrbyXiePY9t3OvzPQit34oYWJ0uyNnEalilIR1FuaZGEjPTj6U2Ha51o3NwwxdBX8I-qBvYO6EoNaScgs1ed09BM0YO_dj8YsNFB0Z_PG6_BziZe0xHmlOU2PYY-urNopNBMJYvvH6TlusnlSTA2P1SXt_5WNKLFOCUIo6rt9F7cslz9_9BaU08yjnkmeH9QccMRqIrMcEXkqkqXB-jJrH0uCNy3NtmCLn6aXenZNv2kk6v6Xnq-2Bx2cOVCLqz6CxzFXQ-GswUvljZ6fIvXpk2uRlRUg3x6MYcTQtPl_87rSU8mq6IX6V0qvNEHOF56Br5zZA";
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
