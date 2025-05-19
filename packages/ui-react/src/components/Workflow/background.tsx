import EmptyIcon from "../../assets/svg/empty-gaevatar.svg?react";
export default function Background() {
  return (
    <div className="sdk:w-full sdk:flex sdk:justify-center sdk:items-center sdk:absolute sdk:top-0 sdk:bottom-0 sdk:left-0 sdk:right-0 sdk:flex-col ">
      <div className="sdk:w-[288px] sdk:flex sdk:gap-6 sdk:flex-col sdk:justify-center sdk:items-center sdk:workflow-reactflow-background">
        <EmptyIcon width={86} hanging={67} />
        <span className="sdk:text-center sdk:workflow-common-gray-text">
          begin by dragging and dropping or adding a card from the sidebar on
          the left!
        </span>
      </div>
    </div>
  );
}
