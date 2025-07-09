import EmptyIcon from "../../assets/svg/empty-workflow.svg?react";
export default function Background() {
  return (
    <div className="sdk:w-full sdk:flex sdk:justify-center sdk:items-center sdk:absolute sdk:top-0 sdk:bottom-0 sdk:left-0 sdk:right-0 sdk:flex-col ">
      <div className="sdk:w-[390px] sdk:flex sdk:gap-8 sdk:flex-col sdk:justify-center sdk:items-center sdk:workflow-reactflow-background">
        <EmptyIcon width={144} hanging={144} />
        <span className="sdk:text-center sdk:text-[#606060] sdk:text-[13px] sdk:font-outfit sdk:font-normal sdk:leading-normal sdk:lowercase">
          Drag and drop agents from the left panel to begin.
        </span>
      </div>
    </div>
  );
}
