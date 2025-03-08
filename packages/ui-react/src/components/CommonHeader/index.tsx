import clsx from "clsx";
import type { ReactNode } from "react";

export interface ICommonHeaderProps {
  leftEle?: string | ReactNode;
  rightEle?: ReactNode;
  className?: string;
}

export default function CommonHeader({
  leftEle,
  rightEle,
  className,
}: ICommonHeaderProps) {
  return (
    <div
      className={clsx(
        "sdk:flex sdk:justify-between sdk:items-center sdk:border sdk:border-[#303030]",
        "sdk:pt-[36px] sdk:pb-[17px] sdk:pl-[20px] sdk:pr-[20px]",
        "sdk:md:pl-[40px] sdk:md:pr-[40px] sdk:md:pb-[24px] sdk:md:border-none",
        className
      )}>
      <div className="sdk:text-white sdk:font-syne sdk:text-[18px] sdk:font-semibold sdk:lowercase aevatarai-text-gradient">
        {leftEle}
      </div>
      {rightEle}
    </div>
  );
}
