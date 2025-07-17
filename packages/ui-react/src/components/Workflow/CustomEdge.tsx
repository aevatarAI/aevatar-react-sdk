import { memo } from "react";
import { getBezierPath, BaseEdge } from "@xyflow/react";
import DeleteIcon from "../../assets/svg/delete_agent.svg?react";

interface CustomEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  style?: React.CSSProperties;
  markerEnd?: string;
  setEdges: (fn: (edges: any[]) => any[]) => void;
}

const CustomEdge = memo((props: CustomEdgeProps) => {
  const { id, sourceX, sourceY, targetX, targetY, style, markerEnd, setEdges } = props;
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, targetX, targetY });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  return (
    <>
      <BaseEdge path={edgePath} style={style} markerEnd={markerEnd} />
      <foreignObject
        x={labelX - 12}
        y={labelY - 12}
        width={24}
        height={24}
        style={{ overflow: "visible" }}
      >
        {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
        <button
          onClick={handleDelete}
          className="sdk:bg-[#141415] sdk:text-[#6F6F6F] sdk:border sdk:border-[#303030] sdk:rounded-[4px] sdk:p-1 sdk:w-6 sdk:h-6 sdk:flex sdk:items-center sdk:justify-center sdk:cursor-pointer"
        >
          <DeleteIcon width={16} height={16} />
        </button>
      </foreignObject>
    </>
  );
});

export default CustomEdge; 