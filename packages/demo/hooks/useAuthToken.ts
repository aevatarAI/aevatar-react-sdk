import { useCallback } from "react";
import { WalletTypeEnum } from "@aelf-web-login/wallet-adapter-base";
import { useConnectWallet } from "@aelf-web-login/wallet-adapter-react";
import AElf from "aelf-sdk";
import { recoverPubKeyBySignature } from "../utils/aelf";
import { aevatarAI } from "@aevatar-react-sdk/ui-react";

const plainTextOrigin = `Hello and welcome! Click "Sign" to begin exploring the aevatar dashboard. Rest assured, this action won't trigger any blockchain transactions or incur gas fees.
Nonce: ${Date.now()}`;

export const useAuthToken = () => {
  const { walletInfo, walletType, getSignature } = useConnectWallet();
  return useCallback(async () => {
    // const apiData = {
    //   pubkey:
    //     "044414249946fe917b9bc6e0d8853ddabfb0808cf92bb278366438ca1461f2df87a4cd2e6136d7aa17323fafd574a64de2b6ad7b69d890762accf62d895dba6b6e",
    //   signature:
    //     "b6ee198cbcdac60f688f4d0a0994fd56b2405a393a283e70c209b985831d264d30474a305ace7a04e4ed487354c73f02743380767930a7d7e76f70d735e89a4600",
    //   plain_text:
    //     "48656c6c6f20616e642077656c636f6d652120436c69636b20225369676e2220746f20626567696e206578706c6f72696e672074686520616576617461722064617368626f6172642e205265737420617373757265642c207468697320616374696f6e20776f6e2774207472696767657220616e7920626c6f636b636861696e207472616e73616374696f6e73206f7220696e6375722067617320666565732e0a4e6f6e63653a2031373531353938303530383530",
    //   ca_hash:
    //     "c74d0979ccc7228a74b80bffcb588b46212fa2f7f629c4418b47a64ba76675e8",
    //   chain_id: "tDVW",
    //   source: "portkey",
    //   client_id: "AevatarAuthServer",
    //   grant_type: "signature",
    // };
    // return aevatarAI.getAuthToken(apiData);

    if (
      walletType === WalletTypeEnum.discover ||
      walletType === WalletTypeEnum.web
    ) {
      const plainText: any = Buffer.from(plainTextOrigin)
        .toString("hex")
        .replace("0x", "");
      let signResult: {
        error: number;
        errorMessage: string;
        signature: string;
        from: string;
      } | null;

      const discoverInfo = walletInfo?.extraInfo as any;
      if (
        (discoverInfo?.provider as any).methodCheck(
          "wallet_getManagerSignature"
        )
      ) {
        const sign = await discoverInfo?.provider?.request({
          method: "wallet_getManagerSignature",
          payload: { hexData: plainText },
        });
        const signR = sign.r.toString("hex", 32).padStart(64, "0");
        const signS = sign.s.toString("hex", 32).padStart(64, "0");
        const signRecoveryParam = sign.recoveryParam
          .toString()
          .padStart(2, "0");
        const signInfo = [signR, signS, signRecoveryParam].join("");

        signResult = {
          error: 0,
          errorMessage: "",
          signature: signInfo,
          from: WalletTypeEnum.discover,
        };
      } else {
        const signInfo = AElf.utils.sha256(plainText);
        signResult = await getSignature({
          appName: "APP_NAME",
          address: walletInfo?.address || "",
          signInfo,
        });
      }

      if (!signResult?.signature) throw "getSignature error";

      const pubkey = `${recoverPubKeyBySignature(
        plainText,
        signResult.signature
      )}`;
      console.log(pubkey, "pubkey==");

      const caHash = await (discoverInfo?.provider as any).request({
        method: "caHash",
      });
      console.log(caHash, "caHash==");
      const apiData = {
        pubkey,
        signature: signResult.signature,
        plain_text: plainText,
        ca_hash: caHash,
        // TODO
        chain_id: "tDVW",
        source: "portkey",
        client_id: "AevatarAuthServer",
        grant_type: "signature",
      };
      console.log(apiData, 'apiData==')
      return aevatarAI.getAuthToken(apiData);
    }
    return "";
  }, [walletType, walletInfo, getSignature]);
};
