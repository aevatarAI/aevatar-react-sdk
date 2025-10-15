import { useConnectWallet } from "@aelf-web-login/wallet-adapter-react";
import { useCallback, useEffect } from "react";
import { aevatarAI, Button, ConfigProvider } from "@aevatar-react-sdk/ui-react";
import { useAuthToken } from "../../hooks/useAuthToken";

export default function AuthButton({ onFinish }: { onFinish: () => void }) {
  const { walletInfo } = useConnectWallet();
  console.log(walletInfo, "walletInfo==");
  const getAuthToken = useAuthToken();

  // useEffect(() => {
  //   ConfigProvider.setConfig({
  //     getAevatarAuthToken: getAuthToken,
  //   });
  // }, [getAuthToken]);

  const onGetAuthToken = useCallback(async () => {
    await getAuthToken();
    onFinish?.();
  }, [getAuthToken, onFinish]);

  const getList = useCallback(async () => {
    const result = await aevatarAI.services.agent.getAllAgentsConfiguration();

    console.log(result, "result===");
  }, []);

  return (
    <div className="flex gap-10">
      <Button type="button" onClick={onGetAuthToken}>
        AuthButton
      </Button>

      <button type="button" onClick={getList}>
        getAllAgentsConfiguration
      </button>
    </div>
  );
}
