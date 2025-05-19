import type { IAgentInfoDetail } from "@aevatar-react-sdk/services";
import { createContext, useContext, useState, type ReactNode } from "react";

export type NodeType = "default" | "new";

export interface IDragItem {
  nodeType: NodeType;
  agentInfo?: Partial<IAgentInfoDetail>;
}

const DnDContext = createContext<
  [IDragItem | null, React.Dispatch<React.SetStateAction<IDragItem | null>>]
>([null, () => {}]);

interface DnDProviderProps {
  children: ReactNode;
}

export const DnDProvider: React.FC<DnDProviderProps> = ({ children }) => {
  const [type, setType] = useState<IDragItem | null>(null);

  return (
    <DnDContext.Provider value={[type, setType]}>
      {children}
    </DnDContext.Provider>
  );
};

export default DnDContext;

// useDnD hook
export const useDnD = (): [
  IDragItem | null,
  React.Dispatch<React.SetStateAction<IDragItem | null>>
] => {
  return useContext(DnDContext);
};
