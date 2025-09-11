import ReactLoading from "react-loading";
import { useAtom } from "jotai";
import { loadingAtom } from "../../state/atoms";

export default function PageLoading() {
  const [show] = useAtom(loadingAtom);
  if (!show) return null;

  return (
    <div
      data-testid="page-loading"
      className="sdk:flex sdk:items-center sdk:justify-center sdk:w-full sdk:h-full sdk:bg-[var(--sdk-bg-background)] sdk:absolute sdk:top-0 sdk:left-0 sdk:z-50">
      <div className="sdk:flex sdk:text-2xl sdk:font-bold sdk:text-[var(--sdk-color-text-primary)] sdk:flex sdk:items-center">
        <div className="sdk:text-[var(--sdk-color-text-primary)] sdk:font-outfit sdk:text-lg sdk:font-semibold sdk:leading-normal sdk:text-[18px]">
          Scanning......
        </div>
        <ReactLoading type="bars" color="var(--sdk-color-text-primary)" />
      </div>
    </div>
  );
}
