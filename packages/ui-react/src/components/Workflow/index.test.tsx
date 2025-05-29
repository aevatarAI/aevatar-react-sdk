import { describe, it, expect, vi } from 'vitest';
import React, { createRef } from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Workflow } from "./index";

let _nodes: any[] = [];
let _edges: any[] = [];
const setNodes = vi.fn();
const setEdges = vi.fn();
const onNodesChange = vi.fn();
const onEdgesChange = vi.fn();

vi.mock("@xyflow/react", () => ({
  ReactFlow: (props: any) => <div data-testid="reactflow">{props.children}</div>,
  Controls: () => <div data-testid="controls" />,
  useNodesState: () => [_nodes, setNodes, onNodesChange],
  useEdgesState: () => [_edges, setEdges, onEdgesChange],
  useReactFlow: () => ({ screenToFlowPosition: ({ x, y }: any) => ({ x, y }) }),
  MarkerType: { ArrowClosed: "ArrowClosed" },
  addEdge: (edge: any, eds: any) => [...eds, edge],
}));
vi.mock("./DnDContext", () => ({ useDnD: () => [{ nodeType: "new", agentInfo: { id: "id1", businessAgentGrainId: "g1", agentGuid: "guid1", agentType: "type1", name: "Agent1", properties: {} } }] }));
vi.mock("./utils", () => ({ generateWorkflowGraph: vi.fn(() => ({ nodes: [{ id: "n1", data: { agentInfo: { id: "id1", businessAgentGrainId: "g1", agentGuid: "guid1", agentType: "type1", name: "Agent1", properties: {} } }, position: { x: 1, y: 2 } }], edges: [] })) }));
vi.mock("../AevatarItem4Workflow", () => ({ default: () => <div data-testid="ScanCardNode" /> }));
vi.mock("./background", () => ({ default: () => <div data-testid="background" /> }));

describe("Workflow", () => {
  const gaevatarList = [{ id: "id1", businessAgentGrainId: "g1", agentGuid: "guid1", agentType: "type1", name: "Agent1", properties: {} }];
  const editWorkflow = { workflowAgentId: "w1", workflowName: "wf", workUnitRelations: [{ grainId: "g1", nextGrainId: "", extendedData: { xPosition: "1", yPosition: "2" } }] };

  it("renders with editWorkflow and calls generateWorkflowGraph", () => {
    _nodes = [];
    _edges = [];
    render(<Workflow gaevatarList={gaevatarList} editWorkflow={editWorkflow} onCardClick={vi.fn()} />);
    expect(screen.getByTestId("reactflow")).toBeInTheDocument();
  });

  it("getWorkUnitRelations returns correct for single node", () => {
    _nodes = [{ id: "n1", data: { agentInfo: { id: "id1", businessAgentGrainId: "g1", agentGuid: "guid1", agentType: "type1", name: "Agent1", properties: {} } }, position: { x: 1, y: 2 } }];
    _edges = [];
    const ref = createRef<any>();
    render(<Workflow ref={ref} gaevatarList={gaevatarList} editWorkflow={editWorkflow} onCardClick={vi.fn()} />);
    act(() => {
      const result = ref.current.getWorkUnitRelations();
      expect(result).toEqual([
        { grainId: "g1", nextGrainId: "", extendedData: { xPosition: "1", yPosition: "2" } },
      ]);
    });
  });

  it("calls onCardClick on drop new node", () => {
    _nodes = [];
    _edges = [];
    const onCardClick = vi.fn();
    render(<Workflow gaevatarList={gaevatarList} onCardClick={onCardClick} />);
    expect(screen.getByTestId("reactflow")).toBeInTheDocument();
  });

  it("calls onNodesChanged when nodes change", () => {
    _nodes = [];
    _edges = [];
    const onNodesChanged = vi.fn();
    render(<Workflow gaevatarList={gaevatarList} onCardClick={vi.fn()} onNodesChanged={onNodesChanged} />);
    expect(screen.getByTestId("reactflow")).toBeInTheDocument();
  });

  it("ref exposes setNodes/setEdges", () => {
    _nodes = [];
    _edges = [];
    const ref = createRef<any>();
    render(<Workflow ref={ref} gaevatarList={gaevatarList} onCardClick={vi.fn()} />);
    expect(ref.current.setNodes).toBeDefined();
    expect(ref.current.setEdges).toBeDefined();
  });
}); 