import type { NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";

interface ScanCardProps {
  twitterIds: string[];
  keywords: string[];
  method: string;
}

const ScanCard: React.FC<ScanCardProps> = ({
  twitterIds,
  keywords,
  method,
}) => {

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: "green",
          width: 10,
          height: 10,
        }}
      />
      <div className="bg-gray-900 text-white p-4 rounded-lg shadow-lg w-64 border border-gray-700">
        <h2 className="text-lg font-semibold">twitter scan</h2>
        <p className="text-gray-400 text-sm">id: 3</p>

        <div className="mt-4 border-t border-gray-700 pt-2">
          <p className="text-gray-400 text-xs">twitter id</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {twitterIds.map((id, index) => (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                key={index}
                className="bg-gray-800 px-2 py-1 text-xs rounded">
                {id}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <p className="text-gray-400 text-xs">keyword</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {keywords.map((keyword, index) => (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                key={index}
                className="bg-gray-800 px-2 py-1 text-xs rounded">
                {keyword}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <p className="text-gray-400 text-xs">method</p>
          <span className="bg-gray-800 px-2 py-1 text-xs rounded">
            {method}
          </span>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="b"
        style={{
          background: "green",
          width: 10,
          height: 10,
        }}
      />
    </>
  );
};
const ScanCardNode: React.FC<NodeProps> = (props) => {
  const { data } = props;
  const {
    twitterIds = [],
    keywords = [],
    method = "",
  } = data as {
    twitterIds: string[];
    keywords: string[];
    method: string;
  };

  return (
    <ScanCard twitterIds={twitterIds} keywords={keywords} method={method} />
  );
};

export default ScanCardNode;
