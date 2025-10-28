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
      "https://station-developer-dev-staging.aevatar.ai/default-project-113b-5a7ed924-client",
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
      "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6Ijg5QzAwNzc1RTlGNDhEQUZGN0QzQzZGMjBBNkZDQTdDN0FDMzNDQjIiLCJ4NXQiOiJpY0FIZGVuMGphXzMwOGJ5Q21fS2ZIckRQTEkiLCJ0eXAiOiJhdCtqd3QifQ.eyJpc3MiOiJodHRwczovL2F1dGgtc3RhdGlvbi1kZXYtc3RhZ2luZy5hZXZhdGFyLmFpLyIsImV4cCI6MTc2MTgwNTk2MywiaWF0IjoxNzYxNjMzMTY0LCJhdWQiOiJBZXZhdGFyIiwic2NvcGUiOiJBZXZhdGFyIG9mZmxpbmVfYWNjZXNzIiwianRpIjoiNzA2N2VkZWYtMGIwZi00MDNlLTkyNTQtNDBlZTBjNjJiMTdjIiwic3ViIjoiNTdiYWIyMjAtOTVkZS1kNDYxLTFlODMtM2ExY2VlOGYwYzIzIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiYWZ2b2ppIiwiZW1haWwiOiJhZnZvamlAc25hcG1haWwuY2MiLCJyb2xlIjpbImJhc2ljVXNlciIsIjgwNmQzY2M2LTI2OTMtYTg0NS05Y2FhLTNhMWNlZThmNDY2ZV9Pd25lciIsIjVhN2VkOTI0LTM4NWYtMDA2YS04OWU2LTNhMWNlZThmNDU1NV9Pd25lciJdLCJwaG9uZV9udW1iZXJfdmVyaWZpZWQiOiJGYWxzZSIsImVtYWlsX3ZlcmlmaWVkIjoiRmFsc2UiLCJ1bmlxdWVfbmFtZSI6ImFmdm9qaSIsInNlY3VyaXR5X3N0YW1wIjoiR1NCNE4ySUIyTElBWk5CRzUyM0tGNVo0T0YyUUo3WDIiLCJvaV9wcnN0IjoiQWV2YXRhckF1dGhTZXJ2ZXIiLCJvaV9hdV9pZCI6ImFlNzQ5Yzk4LTg0YzgtODFmMy1lZTkzLTNhMWNlZThmMGUxMiIsImNsaWVudF9pZCI6IkFldmF0YXJBdXRoU2VydmVyIiwib2lfdGtuX2lkIjoiNmRiNTQ2ZjQtZWE0My0wZDQyLTI5N2MtM2ExZDNiYjFiNGM3In0.Oe866mgfN96JSxM45iMa62dNosvYECMPSllj1cFPoC0DOxgNXZH9dFi77_fmAQAZgelHLFXHu8qy2NHEq-kKW22tQcbAvGxSQhnWgjAZ1xlWUTAp3kRybVJNNOlFm5G2EvLzTcTE9NhDf5Vm0_PQ3IgEFWxOdNwSM_11zCLLzesJeu6Yaz5ikFR2OVICbLPoYjSP0mK04edjFX0WVeZ-u19b-yfXXD4io3m2P-zztLL2McD42RLWR58qtEcEK-5qne5va6RU16qJyUjOWI1rtTzaVKPdJ_IkQaLRANSw6ch8VxNVO1mxyhzjdz4P6SWsXrhnoR7HQAnNA3phtim6bw";
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
