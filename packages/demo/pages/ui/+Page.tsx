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
    // const sdkToken = await aevatarAI.getAuthTokenWithClient({
    //   grant_type: "password",
    //   scope: "Aevatar",
    //   username: "leotest@teml.net", // "leotest@teml.net", // (import.meta as any).env.VITE_APP_SERVICE_USERNAME,
    //   client_id: "AevatarAuthServer",
    //   password: "Leo123!", //"Leo123!", //(import.meta as any).env.VITE_APP_SERVICE_PASSWORD,
    // } as any);

    aevatarAI.fetchRequest.setHeaders({
      // authorization: sdkToken,
      Authorization:
        "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IkJGRUI5QzEwMDMzNDJGNTdBQTMzOEM5RUI0MTAyRENFQzNEOEE2M0EiLCJ4NXQiOiJ2LXVjRUFNMEwxZXFNNHlldEJBdHpzUFlwam8iLCJ0eXAiOiJhdCtqd3QifQ.eyJpc3MiOiJodHRwczovL2F1dGgtcHJlLXN0YXRpb24tZGV2LXN0YWdpbmcuYWV2YXRhci5haS8iLCJleHAiOjE3NTQwMjc4NTksImlhdCI6MTc1Mzg1NTA2MCwiYXVkIjoiQWV2YXRhciIsInNjb3BlIjoiQWV2YXRhciBvZmZsaW5lX2FjY2VzcyIsImp0aSI6IjIwZjVjM2FlLTA3NWQtNGU5YS1iNDQ2LWQ0MDE2ZTc3NGM1ZSIsInN1YiI6ImYwODM5NjRiLTJkNDktNGMzOS1iMjdhLWRiYzJjMTdjNzkzNiIsInByZWZlcnJlZF91c2VybmFtZSI6ImNqaHJveTk4QGdtYWlsLmNvbUBnb29nbGUiLCJlbWFpbCI6IjIzYWExYjU1MjJjZTQxOWNiNGY2YmIxZjkzMDA5ZDIwQEFCUC5JTyIsInJvbGUiOlsiYmFzaWNVc2VyIiwiM2ExNTRiNjQtZWI0YS1jMjNmLWNkMDMtM2ExYjFhN2FjYTlkX093bmVyIl0sInBob25lX251bWJlcl92ZXJpZmllZCI6IkZhbHNlIiwiZW1haWxfdmVyaWZpZWQiOiJGYWxzZSIsInVuaXF1ZV9uYW1lIjoiY2pocm95OThAZ21haWwuY29tQGdvb2dsZSIsInNlY3VyaXR5X3N0YW1wIjoiT0VBSVpPRkVNMkNDVERZV1Y0VkdYU0g0Q1pUVDJOVlEiLCJvaV9wcnN0IjoiQWV2YXRhckF1dGhTZXJ2ZXIiLCJvaV9hdV9pZCI6IjQxNWJiNmJmLWUyZDEtMzk2ZS1jNDRiLTNhMWI2YzE1M2Y2OSIsImNsaWVudF9pZCI6IkFldmF0YXJBdXRoU2VydmVyIiwib2lfdGtuX2lkIjoiN2NmNzkwNjgtMmI1My0wNmNlLTRiZjktM2ExYjZjMTU0MjgzIn0.EqdmuAghmcPin9BDOu9fd4zrTvHZA4-ws48G6IisX5QWZLr4FZrADSun9kGvIkEw_Yklt-V0Sb5u1VbtRT2FQ6OY_kcRHEmA2mEtPV6OWvHwrcevFCwD_WPZGyw2vOFyju1MJSPhYgWJPWJFQexU6DlOtVr32POBj6EyeUsrj-cxXrXDGRsOawOj7q86dPmtYpThQCGF_WGGYsXJTB7mz5yyFQj8OeTw3rXqTiROhFAPtVtVy_aeKNy_T-nH7Hfg6nKcrXrXxigICnTG0hGZw8Ft4ikVhYwm4BRM5EMBuwICJMQ-Jd013kMScsXJDg3IQusIovkZv_8h1lUf3TWEKg",
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
