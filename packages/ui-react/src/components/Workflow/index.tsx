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
} from "@xyflow/react";

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

let id = 0;
const getId = () => `dndnode_${id++}`;

interface IProps {
  gaevatarList?: IAgentInfoDetail[];

  editWorkflow?: {
    workflowAgentId: string;
    workflowName: string;
    workUnitRelations: IWorkflowUnitListItem[];
  };
  onCardClick: (
    data: Partial<IAgentInfoDetail>,
    isNew: boolean,
    nodeId: string
  ) => void;
  onNodesChanged?: (nodes: INode[]) => void;
}

export interface IWorkflowInstance {
  getWorkUnitRelations: () => IWorkflowUnitListItem[];
  setNodes: React.Dispatch<React.SetStateAction<any[]>>;
  setEdges: React.Dispatch<React.SetStateAction<any[]>>;
}

export const Workflow = forwardRef(
  (
    { gaevatarList, editWorkflow, onCardClick, onNodesChanged }: IProps,
    ref
  ) => {
    const deleteNode = useCallback((nodeId) => {
      setNodes((prevNodes) => prevNodes.filter((node) => node.id !== nodeId));
      setEdges((prevEdges) =>
        prevEdges.filter(
          (edge) => edge.source !== nodeId && edge.target !== nodeId
        )
      );
    }, []);

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
    const nodesRef = useRef<INode[]>(nodes);
    useEffect(() => {
      nodesRef.current = nodes;
    }, [nodes]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
      if (!editWorkflow?.workUnitRelations) return;

      const { nodes, edges } = generateWorkflowGraph(
        editWorkflow.workUnitRelations,
        gaevatarList,
        onCardClick,
        deleteNode
      );
      setNodes(nodes);
      setEdges(edges);
    }, [
      editWorkflow,
      // deleteNode,
      onCardClick,
      gaevatarList,
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
          return item;
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
        return result.flat();
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
      (params) =>
        setEdges(
          (eds) =>
            addEdge(
              {
                ...params,
                markerEnd: { type: MarkerType.ArrowClosed },
                style: {
                  strokeWidth: 2,
                  stroke: "#B9B9B9",
                },
              },
              eds
            ) as any
        ),
      [setEdges]
    );

    const onDragOver = useCallback((event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    }, []);

    const onDrop = useCallback(
      (event) => {
        event.preventDefault();

        // check if the dropped element is valid
        if (!dragInfo.nodeType) {
          return;
        }

        // project was renamed to screenToFlowPosition
        // and you don't need to subtract the reactFlowBounds.left/top anymore
        // details: https://reactflow.dev/whats-new/2023-11-10
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
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

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    const nodeTypes = useMemo(
      () => ({ ScanCard: ScanCardNode }),
      [updaterList]
    );

    return (
      <div className="dndflow sdk:w-full">
        <div className="reactflow-wrapper sdk:relative" ref={reactFlowWrapper}>
          <ReactFlow
            colorMode="dark"
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
            nodeTypes={nodeTypes}
            defaultEdgeOptions={{ type: "smoothstep" }}
            connectionLineStyle={{
              strokeDasharray: "10 10",
              stroke: "#B9B9B9",
              strokeWidth: 2,
            }}>
            {nodes.length === 0 && <Background />}
            <Controls />
            <div
              className="sdk:absolute sdk:right-[40px] sdk:bottom-[35px] sdk:text-[#B9B9B9] sdk:text-center sdk:font-normal sdk:leading-normal sdk:lowercase sdk:text-[11px] sdk:font-pro"
            >
              powered by aevatar.ai
            </div>
          </ReactFlow>
        </div>
      </div>
    );
  }
);
