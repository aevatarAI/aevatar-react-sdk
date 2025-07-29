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
    baseURL: "https://station-developer-dev-staging.aevatar.ai/snow-client",
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
        "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IkJGRUI5QzEwMDMzNDJGNTdBQTMzOEM5RUI0MTAyRENFQzNEOEE2M0EiLCJ4NXQiOiJ2LXVjRUFNMEwxZXFNNHlldEJBdHpzUFlwam8iLCJ0eXAiOiJhdCtqd3QifQ.eyJpc3MiOiJodHRwczovL2F1dGgtcHJlLXN0YXRpb24tZGV2LXN0YWdpbmcuYWV2YXRhci5haS8iLCJleHAiOjE3NTM4NDIyMjQsImlhdCI6MTc1MzY2OTQyNSwiYXVkIjoiQWV2YXRhciIsInNjb3BlIjoiQWV2YXRhciBvZmZsaW5lX2FjY2VzcyIsImp0aSI6IjYyNzM4NWU2LTE0YWMtNGMwNi05ZTFhLWRhYTBhY2ZjNTgyMCIsInN1YiI6IjFmYzdkMWU4LTUyNjItYWUxZS04YzM0LTNhMWFkYjU5ZTdlZSIsInByZWZlcnJlZF91c2VybmFtZSI6Imxlb3Rlc3QiLCJlbWFpbCI6Imxlb3Rlc3RAdGVtbC5uZXQiLCJyb2xlIjpbImU0Y2IxYTM5LWUxM2ItZWViMi1iYjg2LTNhMWFkYjY3YTZkY19Pd25lciIsImY2NGFiNjMwLTNiNDYtNzVkNi1lN2EyLTNhMWIwNjA4YTQyMV9Pd25lciIsImJhc2ljVXNlciIsIjA0N2YxM2JiLTMyNWItODhlYi1lZjcyLTNhMWIxOTM0ZjI1N19SZWFkZXIiLCI4ZTcwYWE5My1hNjY1LTkyMGYtZTY3NS0zYTFiMWYyYTlmMzRfT3duZXIiLCIyYmU1MTJkOS1jZDU0LWEwYTgtOWJhNi0zYTFiMGEzMDRlNDNfT3duZXIiLCJkNGJjMTczMC0zODM2LTBhOTItNjk5YS0zYTFiNDk1YWFmYWFfT3duZXIiLCIwNTczOGY2Ny1lOTgwLTEwNGMtNWJiMi0zYTFhZGMxNjFlMmRfT3duZXIiLCI5MjQzZGY0Ni05ZWU3LWNkMzktMGI0YS0zYTFiMDYwZjZmZDlfT3duZXIiXSwicGhvbmVfbnVtYmVyX3ZlcmlmaWVkIjoiRmFsc2UiLCJlbWFpbF92ZXJpZmllZCI6IkZhbHNlIiwidW5pcXVlX25hbWUiOiJsZW90ZXN0Iiwic2VjdXJpdHlfc3RhbXAiOiJPNk5SNVNOT0o3WUdYVktESDY2UERJSEhUSjQ1TFc0TSIsIm9pX3Byc3QiOiJBZXZhdGFyQXV0aFNlcnZlciIsIm9pX2F1X2lkIjoiMDU3ZGZhYzMtMDkxZS01ODlhLTEzMTUtM2ExYjRkZmRhZjdjIiwiY2xpZW50X2lkIjoiQWV2YXRhckF1dGhTZXJ2ZXIiLCJvaV90a25faWQiOiI3ZTcxNjZiMy02Zjc1LTMxNTItZjg5Ni0zYTFiNjEwNGFmZTgifQ.d2OmGmsVwdBBbc-8SbMW0TrO944VBk4Hnri67sTiTZViOyj1wmS_dh-97P_MSQ4ob3rHTqqN7XNQWi8t5rTCTqW-omZEcTlONIOH8RBFAJwJyxOu3vYGwzTGwOUuWMLGldTqYg07Bo81JKk8nWh64N3yry95L2H3epDfezVzxTLUA1-ToTpeBeLs0B09A5d7E5xXnoZS9wWAtF0-74-LB4AB9XP-lKeDftH-I94SP2RkDlRuyAW_bO7YnZ5VD1NdFYMbzmeI2B8jGy8oBiu6boXURtzPrMTSq6pfW_YCCUx_V9SPAloG3AegnHmwSsuFaym7PXvXG1sP2WRcQOXS0A",
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
                onShowWorkflow();
              }}
            />
          </div>
        )}
      </AevatarProvider>
    </div>
  );
}
