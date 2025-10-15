import { type ElementRef, useRef } from "react";
import type { DialogClose } from "@radix-ui/react-dialog";

export const useCloseDialog = () => {
  const ref = useRef<ElementRef<typeof DialogClose>>(null);

  const handleClose = () => ref.current?.click()

  return { ref, handleClose };
};