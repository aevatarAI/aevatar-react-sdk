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
  MiniMap,
  Background as BackgroundFlow,
} from "@xyflow/react";
import Loading from "../../assets/svg/loading.svg?react";
import "@xyflow/react/dist/style.css";
import "./index.css";
import { useDnD } from "./DnDContext";
import AevatarItem4Workflow from "../AevatarItem4Workflow";
import Background from "./background";
import type {
  IAgentInfoDetail,
  IAgentsConfiguration,
  IWorkflowUnitListItem,
  IWorkflowViewDataParams,
} from "@aevatar-react-sdk/services";
import type { Edge, INode } from "./types";
import { generateWorkflowGraph } from "./utils";
import { useUpdateEffect } from "react-use";
import { Button } from "../ui";
import Refresh from "../../assets/svg/refresh.svg?react";
import Play from "../../assets/svg/play.svg?react";
import clsx from "clsx";
import { useDrop } from "react-dnd";
import CustomEdge from "./CustomEdge";
import { v4 as uuidv4 } from "uuid";
import { useHistory } from "./hooks/useHistory";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { getPropertiesByDefaultValues } from "../../utils/jsonSchemaParse";
import { applyHorizontalLayout } from "./layoutUtils";
import { LayoutDashboard } from "lucide-react";
import { WORKFLOW_NODE_HEIGHT, WORKFLOW_NODE_WIDTH } from "../../constants/workflow";

const getId = () => `${uuidv4()}`;

const fitViewOptions = {
  padding: 0.1,
  includeHiddenNodes: false,
  minZoom: 0.1,
  maxZoom: 1,
};

interface IProps {
  gaevatarList?: IAgentInfoDetail[];
  editWorkflow?: {
    workflowAgentId?: string;
    workflowId?: string;
    workflowName: string;
    workflowViewData: IWorkflowViewDataParams;
  };
  sideDialogOpen?: boolean;
  isRunning?: boolean;
  isStopping?: boolean;
  gaevatarTypeList?: IAgentsConfiguration[];
  disabledRun?: boolean;
  onCardClick: (
    data: Partial<IAgentInfoDetail>,
    isNew: boolean,
    nodeId: string
  ) => void;
  onNodesChanged?: (nodes: INode[]) => void;
  onEdgesChanged?: (edges: Edge[]) => void;
  onRemoveNode?: (nodeId: string) => void;
  onRunWorkflow?: () => Promise<void>;
  onStopWorkflow?: () => Promise<void>;
  onNewNode?: (
    agentInfo: Partial<IAgentInfoDetail> & {
      defaultValues?: Record<string, any[]>;
      jsonProperties?: string;
    }
  ) => void;
  extraControlBar?: React.ReactNode;
  onUndoAction?: () => void;
  onRedoAction?: () => void;
}

export interface IWorkflowInstance {
  getWorkUnitRelations: () => IWorkflowUnitListItem[];
  setNodes: React.Dispatch<React.SetStateAction<any[]>>;
  setEdges: React.Dispatch<React.SetStateAction<any[]>>;
  onAiGenerateWorkflow: (
    aiGenerateWorkflowViewData: IWorkflowViewDataParams
  ) => Promise<void>;
}

export const Workflow = forwardRef(
  (
    {
      gaevatarList,
      editWorkflow,
      sideDialogOpen,
      isRunning,
      isStopping,
      disabledRun,
      onCardClick,
      onNodesChanged,
      onRunWorkflow,
      onStopWorkflow,
      onRemoveNode,
      onEdgesChanged,
      onNewNode,
      extraControlBar,
      gaevatarTypeList,
      onUndoAction,
      onRedoAction,
    }: IProps,
    ref
  ) => {
    // Add state to track used indexes for each agent type
    const [agentTypeUsedIndexes, setAgentTypeUsedIndexes] = useState<
      Record<string, Set<number>>
    >({});

    // Use ref to synchronously manage usedIndexes
    const usedIndexesRef = useRef<Record<string, Set<number>>>({});

    // Sync ref with state
    useEffect(() => {
      usedIndexesRef.current = agentTypeUsedIndexes;
    }, [agentTypeUsedIndexes]);

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

    const deleteNode = useCallback(
      (nodeId) => {
        setNodes((prevNodes) => {
          const newNodes = prevNodes.filter((node) => node.id !== nodeId);
          // Find the node to be deleted to get its agent type
          const nodeToDelete = prevNodes.find((node) => node.id === nodeId);
          // Update agent type count when deleting a new node
          if (
            nodeToDelete?.data?.isNew &&
            nodeToDelete?.data?.agentInfo?.agentType
          ) {
            const agentType = nodeToDelete.data.agentInfo.agentType;
            const name = nodeToDelete.data.agentInfo.name;

            // Extract index from name (e.g., "AgentType 1" -> 1)
            const match = name?.match(new RegExp(`^${agentType} (\\d+)$`));
            if (match) {
              const index = Number.parseInt(match[1], 10);

              // Synchronously update ref
              const currentIndexes =
                usedIndexesRef.current[agentType] || new Set();
              const newIndexes = new Set(currentIndexes);
              newIndexes.delete(index);
              usedIndexesRef.current = {
                ...usedIndexesRef.current,
                [agentType]: newIndexes,
              };

              // Update state
              setAgentTypeUsedIndexes(usedIndexesRef.current);
            } else {
              console.log("Failed to extract index from name:", name);
            }
          }
          return newNodes;
        });
        onRemoveNode?.(nodeId);
        setEdges((prevEdges) =>
          prevEdges.filter(
            (edge) => edge.source !== nodeId && edge.target !== nodeId
          )
        );
      },
      [onRemoveNode, setNodes, setEdges]
    );

    const { screenToFlowPosition, fitView } = useReactFlow();
    const [dragInfo] = useDnD();
    const nodesRef = useRef<INode[]>(nodes);
    const gaevatarListRef = useRef<IAgentInfoDetail[]>([]);
    const gaevatarTypeListRef = useRef<IAgentsConfiguration[]>([]);
    // History management
    const {
      canUndo,
      canRedo,
      undo,
      redo,
      pushState,
      clearHistory,
      initializeState,
      updateFunction,
    } = useHistory();
    const isInitialized = useRef(false);
    useEffect(() => {
      nodesRef.current = nodes;
    }, [nodes]);
    useEffect(() => {
      gaevatarListRef.current = gaevatarList;
    }, [gaevatarList]);

    useEffect(() => {
      gaevatarTypeListRef.current = gaevatarTypeList;
    }, [gaevatarTypeList]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
      if (!editWorkflow?.workflowViewData) return;

      const { nodes, edges } = generateWorkflowGraph(
        editWorkflow.workflowViewData,
        gaevatarListRef.current,
        gaevatarTypeListRef.current,
        onCardClick,
        deleteNode
      );

      setNodes(nodes);
      setEdges(edges);

      // Clear history when loading new workflow
      clearHistory();
      isInitialized.current = false;
    }, [editWorkflow, onCardClick, clearHistory]);

    const onAiGenerateWorkflow = useCallback(
      async (aiGenerateWorkflowViewData: IWorkflowViewDataParams) => {
        const { nodes, edges } = generateWorkflowGraph(
          aiGenerateWorkflowViewData,
          gaevatarListRef.current,
          gaevatarTypeListRef.current,
          onCardClick,
          deleteNode
        );
        setNodes(nodes);
        setEdges(edges);
      },
      [onCardClick, deleteNode, setNodes, setEdges]
    );

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
    }, [gaevatarList, setNodes]);

    useUpdateEffect(() => {
      onNodesChanged?.(nodes);
    }, [nodes]);

    useUpdateEffect(() => {
      onEdgesChanged?.(edges);
    }, [edges]);

    useEffect(() => {
      // Initialize history state on first load
      if (!isInitialized.current && nodes.length > 0 && edges.length > 0) {
        initializeState(nodes, edges);
        isInitialized.current = true;
        return;
      }

      // Record state changes in history
      pushState(nodes, edges);
    }, [nodes, edges, initializeState, pushState]);

    // Update function references when they change
    useEffect(() => {
      // Update onCardClick function reference
      if (onCardClick) {
        // This will be handled by the function registry when functions are serialized
      }
    }, [onCardClick]);

    const getWorkUnitRelations: () => IWorkflowUnitListItem[] =
      useCallback(() => {
        const data = { nodes, edges } as { nodes: INode[]; edges: Edge[] };

        if (edges.length < 1 && nodes.length === 1) {
          const node = nodes[0];
          return [
            {
              grainId: node.id,
              nextGrainId: "",
              extendedData: {
                xPosition: String(node.position.x),
                yPosition: String(node.position.y),
              },
            },
          ];
        }
        const result = data.nodes.map((node) => {
          const grainId = node.id;

          const nextGrainIds = data.edges
            .filter((edge) => edge.source === node.id)
            .map((edge) => {
              const targetNode = data.nodes.find((n) => n.id === edge.target);
              return targetNode?.id || "";
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
        onAiGenerateWorkflow,
      }),
      [getWorkUnitRelations, setNodes, setEdges, onAiGenerateWorkflow]
    );

    // Add function to detect cycles in the workflow graph
    const hasCycle = useCallback(
      (nodes: INode[], edges: Edge[], newSource: string, newTarget: string) => {
        // Create adjacency list
        const graph: Record<string, string[]> = {};
        nodes.forEach((node) => {
          graph[node.id] = [];
        });

        // Add existing edges
        edges.forEach((edge) => {
          if (graph[edge.source]) {
            graph[edge.source].push(edge.target);
          }
        });

        // Add the new edge temporarily
        if (graph[newSource]) {
          graph[newSource].push(newTarget);
        }

        // DFS to detect cycle
        const visited = new Set<string>();
        const recStack = new Set<string>();

        const dfs = (nodeId: string): boolean => {
          if (recStack.has(nodeId)) {
            return true; // Found cycle
          }
          if (visited.has(nodeId)) {
            return false;
          }

          visited.add(nodeId);
          recStack.add(nodeId);

          const neighbors = graph[nodeId] || [];
          for (const neighbor of neighbors) {
            if (dfs(neighbor)) {
              return true;
            }
          }

          recStack.delete(nodeId);
          return false;
        };

        // Check all nodes for cycles
        for (const nodeId of Object.keys(graph)) {
          if (!visited.has(nodeId)) {
            if (dfs(nodeId)) {
              return true; // Cycle detected
            }
          }
        }

        return false; // No cycle
      },
      []
    );

    const onConnect = useCallback(
      (params) => {
        if (params.source === params.target) {
          return;
        }
        setEdges((eds) => {
          if (
            eds.find(
              (item) =>
                item.source === params.target && item.target === params.source
            )
          ) {
            return eds;
          }

          // Check if adding this edge would create a cycle
          if (hasCycle(nodes, eds, params.source, params.target)) {
            console.warn("Cannot add edge: would create a cycle in workflow");
            return eds;
          }

          return addEdge(
            {
              ...params,
              type: "bezier",
              // markerEnd: {
              //   type: MarkerType.ArrowClosed,
              //   color: "var(--sdk-success-color)",
              // },
              style: {
                strokeWidth: 2,
                stroke: "var(--sdk-muted-foreground)",
              },
            },
            eds
          ) as any;
        });
      },
      [setEdges, hasCycle, nodes]
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

        // Create a copy of agentInfo to avoid modifying the original
        const agentInfoCopy = { ...dragInfo.agentInfo };

        // Handle new node creation with indexing
        if (dragInfo.nodeType === "new") {
          const agentType = agentInfoCopy.agentType;

          // Synchronously find the smallest available index
          const usedIndexes = usedIndexesRef.current[agentType] || new Set();
          let newIndex = 1;

          // Find the smallest available index starting from 1
          while (usedIndexes.has(newIndex)) {
            newIndex++;
          }

          // Update agentInfo copy with new name (only for new nodes)
          agentInfoCopy.name = `${agentType.split(".").pop()} ${newIndex}`;

          // Synchronously update ref
          const newUsedIndexes = new Set([...usedIndexes, newIndex]);
          usedIndexesRef.current = {
            ...usedIndexesRef.current,
            [agentType]: newUsedIndexes,
          };

          // Update state
          setAgentTypeUsedIndexes(usedIndexesRef.current);
        }

        const newNode =
          dragInfo.nodeType === "new"
            ? {
                id: getId(),
                type: "ScanCard",
                position,
                data: {
                  label: "ScanCard Node",
                  agentInfo: agentInfoCopy,
                  isNew: true,
                  onClick: onCardClick,
                  deleteNode,
                },
                measured: {
                  width: WORKFLOW_NODE_WIDTH,
                  height: WORKFLOW_NODE_HEIGHT,
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
                  width: WORKFLOW_NODE_WIDTH,
                  height: WORKFLOW_NODE_HEIGHT,
                },
              };
        setNodes((nds) => nds.concat(newNode as any));
        if (dragInfo.nodeType === "new") {
          onCardClick(agentInfoCopy, true, newNode.id);
          onNewNode?.({
            id: agentInfoCopy.id || newNode.id,
            name: agentInfoCopy.name,
            agentType: agentInfoCopy.agentType,
            properties: getPropertiesByDefaultValues(
              agentInfoCopy?.defaultValues
            ),
            jsonProperties: JSON.stringify(agentInfoCopy?.properties),
            propertyJsonSchema: agentInfoCopy.propertyJsonSchema,
            defaultValues: agentInfoCopy?.defaultValues,
          });
        }
      },
      [
        screenToFlowPosition,
        dragInfo,
        setNodes,
        onCardClick,
        deleteNode,
        onNewNode,
      ]
    );

    const [, dropRef] = useDrop({
      accept: ["AEVATAR_TYPE_ITEM", "AEVATAR_ITEM_MINI"],
      drop: handleDrop,
    });

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    const nodeTypes = useMemo(
      () => ({ ScanCard: AevatarItem4Workflow }),
      [updaterList]
    );

    // Added: register edgeTypes
    const edgeTypes = useMemo(
      () => ({
        bezier: (edgeProps) => (
          <CustomEdge
            {...edgeProps}
            isRunning={isRunning}
            setEdges={setEdges}
          />
        ),
      }),
      [setEdges, isRunning]
    );

    const isRunningRef = useRef(isRunning);

    useEffect(() => {
      isRunningRef.current = isRunning;
    }, [isRunning]);

    const onRunningHandler = useCallback(async () => {
      if (isRunningRef.current) return;
      await onRunWorkflow?.();
    }, [onRunWorkflow]);

    const onStopHandler = useCallback(async () => {
      if (isRunningRef.current) return;
      await onStopWorkflow?.();
    }, [onStopWorkflow]);

    const onUndoHandler = useCallback(async () => {
      const previousState = undo();
      if (previousState) {
        setNodes(previousState.nodes);
        setEdges(previousState.edges);
        onUndoAction?.();
      }
    }, [undo, setNodes, setEdges, onUndoAction]);

    const onRedoHandler = useCallback(async () => {
      const nextState = redo();
      if (nextState) {
        setNodes(nextState.nodes);
        setEdges(nextState.edges);
        onRedoAction?.();
      }
    }, [redo, setNodes, setEdges, onRedoAction]);

    const onFormatLayoutHandler = useCallback(() => {
      if (nodes.length === 0) return;

      const { nodes: layoutedNodes, edges: layoutedEdges } =
        applyHorizontalLayout(nodes, edges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      fitView(fitViewOptions);
    }, [nodes, edges, setNodes, fitView, setEdges]);

    return (
      <div
        className={clsx(
          "dndflow sdk:w-full",
          sideDialogOpen && "aevatar-sideDialogOpen-workflow-inner"
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
            fitViewOptions={fitViewOptions}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={{ type: "bezier" }}
            connectionLineStyle={{
              strokeDasharray: "10 10",
              stroke: "var(--sdk-muted-foreground-border)",
              strokeWidth: 2,
            }}>
            <div className="sdk:absolute sdk:left-[15px] sdk:bottom-[130px] sdk:z-5">
              {extraControlBar}
            </div>
            <div className="sdk:absolute sdk:right-[16px] sdk:top-[12px] sdk:z-5 sdk:flex sdk:items-center sdk:gap-[8px]">
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className={clsx(
                        "sdk:cursor-pointer sdk:p-[7px]",
                        (!canUndo || isRunning) &&
                          "sdk:opacity-50 sdk:cursor-not-allowed"
                      )}
                      onClick={onUndoHandler}
                      disabled={!canUndo || isRunning}
                      aria-label="undo">
                      <Refresh />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    className={clsx(
                      "sdk:z-1000 sdk:text-[12px] sdk:font-geist sdk:text-[var(--sdk-muted-foreground)] sdk:bg-[var(--sdk-color-bg-primary)] sdk:p-[4px]",
                      "sdk:whitespace-pre-wrap sdk:break-words sdk:text-left"
                    )}
                    side="top">
                    Undo
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className={clsx(
                        "sdk:cursor-pointer sdk:p-[7px]",
                        (!canRedo || isRunning) &&
                          "sdk:opacity-50 sdk:cursor-not-allowed"
                      )}
                      onClick={onRedoHandler}
                      disabled={!canRedo || isRunning}
                      aria-label="redo">
                      <Refresh
                        className=""
                        style={{ transform: "scaleX(-1)" }}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    className={clsx(
                      "sdk:z-1000 sdk:text-[12px] sdk:font-geist sdk:text-[var(--sdk-muted-foreground)] sdk:bg-[var(--sdk-color-bg-primary)] sdk:p-[4px]",
                      "sdk:whitespace-pre-wrap sdk:break-words sdk:text-left"
                    )}
                    side="top">
                    Redo
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className={clsx(
                        "sdk:cursor-pointer sdk:p-[7px]",
                        (nodes.length === 0 || isRunning) &&
                          "sdk:opacity-50 sdk:cursor-not-allowed"
                      )}
                      onClick={onFormatLayoutHandler}
                      disabled={nodes.length === 0 || isRunning}
                      aria-label="format layout">
                      <LayoutDashboard className="sdk:w-[14px] sdk:h-[14px]" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    className={clsx(
                      "sdk:z-1000 sdk:text-[12px] sdk:font-geist sdk:text-[var(--sdk-muted-foreground)] sdk:bg-[var(--sdk-color-bg-primary)] sdk:p-[4px]",
                      "sdk:whitespace-pre-wrap sdk:break-words sdk:text-left"
                    )}
                    side="top">
                    Format Layout
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                variant="outline"
                disabled={disabledRun}
                onClick={async () => {
                  onRunningHandler();
                }}
                className="sdk:cursor-pointer sdk:py-[7px]  sdk:px-[17px] sdk:text-center sdk:font-normal sdk:text-[12px] sdk:font-geist sdk:font-semibold">
                {isRunning ? (
                  <Loading
                    key={"save"}
                    className={clsx("aevatarai-loading-icon")}
                    style={{ width: 14, height: 14 }}
                  />
                ) : (
                  <Play />
                )}
                <span
                  className={clsx(
                    "sdk:leading-[14px]",
                    isRunning && "sdk:text-[var(--sdk-running-text)]"
                  )}>
                  {isRunning ? "Running" : "Run"}
                </span>
              </Button>

              {/* <Button
                onClick={onStopHandler}
                className="sdk:cursor-pointer sdk:hover:text-[var(--sdk-color-text-secondary)] sdk:text-[var(--sdk-color-text-primary)] sdk:text-center sdk:font-normal sdk:leading-normal sdk:text-[12px] sdk:font-geist sdk:font-semibold sdk:border-[1px] sdk:border-[var(--sdk-bg-black-light)]">
                {isStopping ? (
                  <Loading
                    key={"save"}
                    className={clsx("aevatarai-loading-icon")}
                    style={{ width: 14, height: 14 }}
                  />
                ) : (
                  <Stop />
                )}
                {isStopping ? "stopping" : "stop"}
              </Button> */}
            </div>

            {nodes.length === 0 && <Background />}
            <Controls />
            <MiniMap
              pannable
              zoomable
              style={{
                width: 100,
                height: 64,
              }}
              nodeColor={"var(--sdk-bg-muted-foreground)"}
              bgColor={"var(--sdk-bg-background)"}
              maskColor={"var(--sdk-color-bg-primary)"}
            />
            <BackgroundFlow
              bgColor={"var(--sdk-bg-background)"}
              size={2}
              color={"var(--sdk-bg-dot"}
            />
            <div className="sdk:absolute sdk:right-[0px] sdk:bottom-[0px] sdk:text-[var(--sdk-muted-foreground)] sdk:text-center sdk:font-normal sdk:leading-normal sdk:text-[11px] sdk:font-pro aevatar-ai-watermark">
              Powered by aevatar.ai
            </div>
          </ReactFlow>
        </div>
      </div>
    );
  }
);
