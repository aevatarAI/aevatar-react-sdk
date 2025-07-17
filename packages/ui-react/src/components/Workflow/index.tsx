import {
  useRef,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useState,
} from "react";
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  useReactFlow,
  MarkerType,
  MiniMap,
  Background as BackgroundFlow,
} from "@xyflow/react";
import Loading from "../../assets/svg/loading.svg?react";
import "@xyflow/react/dist/style.css";
import "./index.css";

import { useDnD } from "./DnDContext";
import ScanCardNode from "../AevatarItem4Workflow";
import Background from "./background";
import type {
  IAgentInfoDetail,
  IWorkflowUnitListItem,
} from "@aevatar-react-sdk/services";
import type { Edge, INode } from "./types";
import { generateWorkflowGraph } from "./utils";
import { useUpdateEffect } from "react-use";
import { Button } from "../ui";
import Play from "../../assets/svg/play.svg?react";
import clsx from "clsx";
import { useWorkflowState } from "../../hooks/useWorkflowState";
import { useDrop } from "react-dnd";
import CustomEdge from "./CustomEdge";

let id = 0;
const getId = () => `dndnode_${id++}`;

interface IProps {
  gaevatarList?: IAgentInfoDetail[];
  editWorkflow?: {
    workflowAgentId: string;
    workflowName: string;
    workUnitRelations: IWorkflowUnitListItem[];
  };
  editAgentOpen?: boolean;
  isRunning?: boolean;
  onCardClick: (
    data: Partial<IAgentInfoDetail>,
    isNew: boolean,
    nodeId: string
  ) => void;
  onNodesChanged?: (nodes: INode[]) => void;
  onRemoveNode?: (nodeId: string) => void;
  onRunWorkflow?: () => Promise<void>;
  extraControlBar?: React.ReactNode;
}

export interface IWorkflowInstance {
  getWorkUnitRelations: () => IWorkflowUnitListItem[];
  setNodes: React.Dispatch<React.SetStateAction<any[]>>;
  setEdges: React.Dispatch<React.SetStateAction<any[]>>;
}

export const Workflow = forwardRef(
  (
    {
      gaevatarList,
      editWorkflow,
      editAgentOpen,
      isRunning,
      onCardClick,
      onNodesChanged,
      onRunWorkflow,
      onRemoveNode,
      extraControlBar,
    }: IProps,
    ref
  ) => {
    const deleteNode = useCallback(
      (nodeId) => {
        setNodes((prevNodes) => prevNodes.filter((node) => node.id !== nodeId));
        onRemoveNode?.(nodeId);
        setEdges((prevEdges) =>
          prevEdges.filter(
            (edge) => edge.source !== nodeId && edge.target !== nodeId
          )
        );
      },
      [onRemoveNode]
    );

    const initialNodes = useMemo(() => {
      return [];
      // const initialNodes = [
      //   {
      //     id: getId(),
      //     type: "ScanCard",
      //     position: {
      //       x: 100,
      //       y: 300,
      //     },
      //     data: {
      //       label: "ScanCard Node",
      //       isNew: true,
      //       onClick,
      //       deleteNode,
      //     },
      //   },
      // ];
    }, []);

    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { screenToFlowPosition } = useReactFlow();
    const [dragInfo] = useDnD();
    console.log(dragInfo, "dragInfo===dragData");
    const nodesRef = useRef<INode[]>(nodes);
    const gaevatarListRef = useRef<IAgentInfoDetail[]>([]);
    useEffect(() => {
      nodesRef.current = nodes;
    }, [nodes]);
    useEffect(() => {
      gaevatarListRef.current = gaevatarList;
    }, [gaevatarList]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
      if (!editWorkflow?.workUnitRelations) return;

      const { nodes, edges } = generateWorkflowGraph(
        editWorkflow.workUnitRelations,
        gaevatarListRef.current,
        onCardClick,
        deleteNode
      );
      console.log(
        "useEffect===onNodesChanged",
        nodes,
        edges,
        editWorkflow.workUnitRelations,
        gaevatarListRef.current
      );
      setNodes(nodes);
      setEdges(edges);

      // setNodes((prevNodes) => {
      //   const merged = [...nodes, ...prevNodes];
      //   const map = new Map();
      //   merged.forEach((node) => map.set(node?.data?.agentInfo?.id, node));
      //   return Array.from(map.values());
      // });

      // setEdges(edges);
      // setEdges((preEdges) => {
      //   const merged = [...edges, ...preEdges];
      //   const map = new Map();
      //   merged.forEach((edge) => map.set(edge.id, edge));
      //   return Array.from(map.values());
      // });
    }, [
      editWorkflow,
      // deleteNode,
      onCardClick,
      // setNodes,
      // setEdges,
    ]);

    const [updaterList, setUpdaterList] = useState<IAgentInfoDetail[]>();

    useUpdateEffect(() => {
      setUpdaterList(gaevatarList);
      const agentMap: Map<string, IAgentInfoDetail> = new Map();
      gaevatarList.forEach((item) => {
        agentMap.set(item.id, item);
      });
      setNodes((node) => {
        const updateNodes = node?.map((item) => {
          if (agentMap.get(item.data.agentInfo.id)) {
            item.data.agentInfo = agentMap.get(item.data.agentInfo.id);
          }
          return { ...item };
        });

        return [...updateNodes];
      });
    }, [gaevatarList]);

    useUpdateEffect(() => {
      onNodesChanged?.(nodes);
    }, [nodes, onNodesChanged]);

    const getWorkUnitRelations: () => IWorkflowUnitListItem[] =
      useCallback(() => {
        const data = { nodes, edges } as { nodes: INode[]; edges: Edge[] };

        if (edges.length < 1 && nodes.length === 1) {
          const node = nodes[0];
          return [
            {
              grainId: node.data.agentInfo.businessAgentGrainId,
              nextGrainId: "",
              extendedData: {
                xPosition: String(node.position.x),
                yPosition: String(node.position.y),
              },
            },
          ];
        }
        const result = data.nodes.map((node) => {
          const grainId = node.data.agentInfo.businessAgentGrainId;

          const nextGrainIds = data.edges
            .filter((edge) => edge.source === node.id)
            .map((edge) => {
              const targetNode = data.nodes.find((n) => n.id === edge.target);
              return targetNode?.data.agentInfo.businessAgentGrainId || "";
            });
          // .filter((nextGrainId) => nextGrainId !== '');

          if (nextGrainIds.length === 0) {
            return [
              {
                grainId,
                nextGrainId: "",
                extendedData: {
                  xPosition: String(node.position.x),
                  yPosition: String(node.position.y),
                },
              },
            ];
          }
          return nextGrainIds.map((nextGrainId) => ({
            grainId,
            nextGrainId,
            extendedData: {
              xPosition: String(node.position.x),
              yPosition: String(node.position.y),
            },
          }));
        });
        const flatResult = result.flat();
        const seen = new Set();
        const deduped = flatResult.filter((item) => {
          const key = `${item.grainId}|${item.nextGrainId}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        return deduped;
      }, [nodes, edges]);

    useImperativeHandle(
      ref,
      () => ({
        getWorkUnitRelations,
        setNodes,
        setEdges,
      }),
      [getWorkUnitRelations, setNodes, setEdges]
    );

    const onConnect = useCallback(
      (params) => {
        console.log(params, "params==onConnect");
        if (params.source === params.target) {
          return;
        }
        setEdges((eds) => {
          console.log(eds, "eds==onConnect");
          if(eds.find(item => item.source === params.target && item.target === params.source)) {
            return eds;
          }
          return addEdge(
            {
              ...params,
              type: "bezier",
              // markerEnd: {
              //   type: MarkerType.ArrowClosed,
              //   color: "#53FF8A",
              // },
              style: {
                strokeWidth: 2,
                stroke: "#B9B9B9",
              },
            },
            eds
          ) as any;
        });
      },
      [setEdges]
    );

    const onDragOver = useCallback((event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    }, []);

    // Original onDrop logic
    const handleDrop = useCallback(
      (item, monitor) => {
        // Compatible with react-dnd drop event
        if (!dragInfo.nodeType) return;
        // Get mouse position
        const clientOffset = monitor.getClientOffset();
        if (!clientOffset) return;
        const position = screenToFlowPosition({
          x: clientOffset.x,
          y: clientOffset.y,
        });
        const newNode =
          dragInfo.nodeType === "new"
            ? {
                id: getId(),
                type: "ScanCard",
                position,
                data: {
                  label: "ScanCard Node",
                  agentInfo: dragInfo.agentInfo,
                  isNew: true,
                  onClick: onCardClick,
                  deleteNode,
                },
                measured: {
                  width: 234,
                  height: 301,
                },
              }
            : {
                id: dragInfo.agentInfo.id,
                type: "ScanCard",
                position,
                data: {
                  label: "ScanCard Node",
                  agentInfo: dragInfo.agentInfo,
                  isNew: false,
                  onClick: onCardClick,
                  deleteNode,
                },
                measured: {
                  width: 234,
                  height: 301,
                },
              };
        setNodes((nds) => nds.concat(newNode as any));
        if (dragInfo.nodeType === "new")
          onCardClick(dragInfo.agentInfo, true, newNode.id);
      },
      [screenToFlowPosition, dragInfo, setNodes, onCardClick, deleteNode]
    );

    const [, dropRef] = useDrop({
      accept: ["AEVATAR_TYPE_ITEM", "AEVATAR_ITEM_MINI"],
      drop: handleDrop,
    });

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    const nodeTypes = useMemo(
      () => ({ ScanCard: ScanCardNode }),
      [updaterList]
    );

    // Added: register edgeTypes
    const edgeTypes = useMemo(
      () => ({
        bezier: (edgeProps) => (
          <CustomEdge {...edgeProps} setEdges={setEdges} />
        ),
      }),
      [setEdges]
    );

    const isRunningRef = useRef(isRunning);

    useEffect(() => {
      isRunningRef.current = isRunning;
    }, [isRunning]);

    const onRunningHandler = useCallback(async () => {
      if (isRunningRef.current) return;
      await onRunWorkflow?.();
    }, [onRunWorkflow]);

    return (
      <div
        className={clsx(
          "dndflow sdk:w-full",
          editAgentOpen && "editAgentOpen-workflow-inner"
        )}>
        <div
          className="reactflow-wrapper sdk:relative"
          ref={(node) => {
            reactFlowWrapper.current = node;
            dropRef(node);
          }}>
          <ReactFlow
            colorMode="dark"
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            deleteKeyCode={["Backspace", "Delete"]}
            // onDrop={onDrop} // Remove native onDrop
            onDragOver={onDragOver}
            fitView
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={{ type: "bezier" }}
            connectionLineStyle={{
              strokeDasharray: "10 10",
              stroke: "#B9B9B9",
              strokeWidth: 2,
            }}>
            <div className="sdk:absolute sdk:left-[15px] sdk:bottom-[130px] sdk:z-5">
              {extraControlBar}
            </div>
            <Button
              onClick={onRunningHandler}
              className="sdk:z-10 sdk:absolute sdk:cursor-pointer sdk:hover:text-[#000] sdk:right-[16px] sdk:top-[12px] sdk:text-white sdk:text-center sdk:font-normal sdk:leading-normal sdk:lowercase sdk:text-[12px] sdk:font-outfit sdk:font-semibold sdk:border-[1px] sdk:border-[#303030]">
              {isRunning ? (
                <Loading
                  key={"save"}
                  className={clsx("aevatarai-loading-icon")}
                  style={{ width: 14, height: 14 }}
                />
              ) : (
                <Play />
              )}
              {isRunning ? "running" : "run"}
            </Button>
            {nodes.length === 0 && <Background />}
            <Controls />
            <MiniMap
              pannable
              zoomable
              style={{
                width: 100,
                height: 64,
              }}
              nodeColor={"#cecece"}
              bgColor={"#000"}
              maskColor={"#141415"}
            />
            <BackgroundFlow bgColor={"#000"} size={2} color={"#D2D6DB4D"} />
            <div className="sdk:absolute sdk:right-[0px] sdk:bottom-[0px] sdk:text-[#B9B9B9] sdk:text-center sdk:font-normal sdk:leading-normal sdk:lowercase sdk:text-[11px] sdk:font-pro aevatar-ai-watermark">
              powered by aevatar.ai
            </div>
          </ReactFlow>
        </div>
      </div>
    );
  }
);
