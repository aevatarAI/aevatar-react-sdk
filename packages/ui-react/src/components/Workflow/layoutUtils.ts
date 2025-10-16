import dagre from "@dagrejs/dagre";
import type { Node, Edge } from "@xyflow/react";
const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

// Define node dimensions for layout calculation
const NODE_WIDTH = 234;
const NODE_HEIGHT = 120;
/**
 * Apply horizontal layout to workflow nodes using dagre
 * @param nodes - Array of ReactFlow nodes
 * @param edges - Array of ReactFlow edges
 * @returns Updated nodes and edges with new positions
 */
export const applyHorizontalLayout = (
  nodes: Node[],
  edges: Edge[],
  direction: "LR" | "TB" = "LR"
): { nodes: Node[]; edges: Edge[] } => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes: Node[] = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode: any = {
      ...node,
      targetPosition: isHorizontal ? "left" : "top",
      sourcePosition: isHorizontal ? "right" : "bottom",
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };

    return newNode;
  });

  return { nodes: newNodes, edges };
};
