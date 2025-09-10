"use client";

import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { DialogClose, DialogTitle } from "../ui";
import type { IWorkflowSidebarWithNewAgentProps } from "./sidebarWithNewAgent";
import SidebarWithNewAgent from "./sidebarWithNewAgent";
import { useEffect, useState } from "react";
import { Button } from "../ui";
import clsx from "clsx";
import AddIcon from "../../assets/svg/add.svg?react";
import { sleep } from "@aevatar-react-sdk/utils";

export function SidebarSheet({
  container,
  ...props
}: Omit<IWorkflowSidebarWithNewAgentProps, "onArrowClick"> & {
  container: HTMLElement;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    sleep(0).then(() => {
      setOpen(true);
    });
  }, []);

  return (
    <Sheet
      key={"left"}
      defaultOpen={true}
      modal={false}
      open={open}
      onOpenChange={() => {}}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className={clsx(
            "sdk:absolute sdk:top-[12px] sdk:left-[16px] sdk:z-[10] sdk:text-[12px] sdk:font-semibold",
            "sdk:gap-[5px] sdk:leading-[15px] sdk:py-[7px]",
            open && "sdk:hidden"
          )}
          onClick={() => setOpen(true)}>
          <AddIcon style={{ width: 14, height: 14 }} />
          Add agent
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        closable={false}
        className="sdk:relative sdk:p-0 sdk:w-auto"
        container={container}>
        <DialogTitle className="hidden" />
        <DialogClose className="hidden" />
        <SidebarWithNewAgent {...props} onArrowClick={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
