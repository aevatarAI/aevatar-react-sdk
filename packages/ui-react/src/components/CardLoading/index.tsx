import clsx from "clsx";
import Loading from "../../assets/svg/loading.svg?react";
import "./index.css";

export default function CardLoading({ className }: { className?: string }) {
  return (
    <div
      data-testid="card-loading"
      className={clsx("sdk:flex sdk:justify-center sdk:items-center sdk:h-full", className)}>
      <Loading className="aevatarai-loading-icon" />
    </div>
  );
}
