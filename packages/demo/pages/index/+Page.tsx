import { clientOnly } from "vike-react/clientOnly";
import { MyButton } from "@aevatar-react-sdk/ui-react";
import "@aevatar-react-sdk/ui-react/ui-react.css";

const LoginButton = clientOnly(
  () => import("../../components/auth/LoginButton")
);

export default function Page() {
  return (
    <div className="flex flex-col lg:flex-row lg:gap-20">
      <div className="basis-1/2 lg:self-center">
        <div className="max-w-[285px] lg:mx-auto">
          <h1 className="text-4xl lg:text-[54px] font-bold font-syne mb-[25px] leading-tight text-gradient">
            log in to
            <br />
            aevatar.ai
          </h1>

          <div className="hidden lg:block">
            <LoginButton />
          </div>
        </div>
      </div>
      <div className="basis-1/2"></div>
      <div className="lg:hidden mt-8">
        <LoginButton />
      </div>

      <MyButton />
    </div>
  );
}
