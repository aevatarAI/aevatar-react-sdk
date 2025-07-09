import ReactLoading from "react-loading";
import { useAtom } from "jotai";
import { loadingAtom } from "../../state/atoms";

export default function PageLoading() {
  const [show] = useAtom(loadingAtom);
  if (!show) return null;

  return (
    <div
      data-testid="page-loading"
      className="sdk:flex sdk:items-center sdk:justify-center sdk:w-full sdk:h-full sdk:bg-black sdk:absolute sdk:top-0 sdk:left-0 sdk:z-50">
      <div className="sdk:flex sdk:text-2xl sdk:font-bold sdk:text-gray-800 sdk:flex sdk:items-center">
        <div className="sdk:text-white sdk:font-outfit sdk:text-lg sdk:font-semibold sdk:leading-normal sdk:lowercase sdk:text-[18px]">
          Scanning......
        </div>
        <ReactLoading type="bars" color="rgba(255, 255, 255, 0.20)" />
      </div>
    </div>
  );
}
