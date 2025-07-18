import "./style.css";

import "./tailwind.css";
import "@aevatar-react-sdk/ui-react/ui-react.css";

import { clientOnly } from "vike-react/clientOnly";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const ProviderComponent = clientOnly(
  () => import("../components/providers/webProvider")
);

const queryClient = new QueryClient();

export default function LayoutDefault({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <ProviderComponent>
        <div className="flex flex-col min-h-[100vh]">
          <div>
            <div className="p-8 flex-grow">{children}</div>
          </div>
        </div>
      </ProviderComponent>
    </QueryClientProvider>
  );
}
