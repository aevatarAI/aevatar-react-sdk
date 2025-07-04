import Loading from "../../assets/svg/loading.svg?react";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dislog";
import { Button } from "../ui/button";
import {
  FormControl,
  FormMessage,
  FormField,
  FormItem,
  Form,
} from "../ui/form";
import { FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import Edit from "../../assets/svg/edit.svg?react";
import { z } from "zod";

const REQUIRED_MESSAGE = "*Required to fill";

export const EditWorkflowNameForm = z.object({
  name: z.string().min(1, { message: REQUIRED_MESSAGE }),
});

export type TEditWorkflowNameForm = z.infer<typeof EditWorkflowNameForm>;

export default function EditWorkflowNameDialog({
  defaultName = "untitled_workflow",
  className,
  onSave,
}: {
  defaultName?: string;
  className?: string;
  onSave: (name: string) => void;
}) {
  const form = useForm<TEditWorkflowNameForm>({
    resolver: zodResolver(EditWorkflowNameForm),
    values: {
      name: defaultName,
    },
  });
  const [open, setOpen] = useState(false);
  const [btnLoading, setBtnLoading] = useState<boolean>();

  const onSubmit = useCallback(
    async (data: TEditWorkflowNameForm) => {
      setBtnLoading(true);
      await onSave(data.name);
      setBtnLoading(false);
      setOpen(false);
    },
    [onSave]
  );

  useEffect(() => {
    open && form.reset();
  }, [form, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild >
        <div className={clsx("sdk:inline-flex sdk:justify-center sdk:items-center sdk:gap-2 sdk:cursor-pointer", className)}>
          <div className="sdk:flex sdk:justify-center sdk:text-[#B9B9B9] sdk:text-[12px] sdk:font-normal sdk:font-pro">
            {defaultName}
          </div>
          <Edit />
        </div>
      </DialogTrigger>
      <DialogContent
        aria-describedby="rename workflow"
        className="sdk:w-[328px] sdk:p-5 sdk:flex sdk:flex-col sdk:gap-[28px] sdk:rounded-[6px] sdk:border sdk:border-black-light">
        <DialogHeader>
          <DialogTitle className="sdk:text-left aevatarai-text-gradient-1 sdk:inline  sdk:text-[18px] sdk:font-semibold sdk:leading-normal sdk:lowercase">
            rename workflow
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="sdk:flex sdk:flex-col sdk:gap-y-[16px] sdk:items-start sdk:content-start sdk:self-stretch">
              <FormField
                key="name"
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem aria-labelledby="nameLabel" className="sdk:w-full">
                    <FormLabel id="nameLabel">workflow name</FormLabel>
                    <FormControl>
                      <Input placeholder="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="sdk:flex sdk:justify-between sdk:items-start sdk:self-stretch sdk:pt-[12px]">
                <Button
                  className="sdk:text-[12px] sdk:text-white sdk:py-[7px] sdk:leading-[14px]"
                  type="reset"
                  onClick={() => {
                    setOpen(false);
                  }}>
                  cancel
                </Button>
                <Button
                  className="sdk:text-[12px] sdk:bg-white sdk:text-black-light sdk:py-[7px] sdk:leading-[14px]"
                  type="submit">
                  {btnLoading && (
                    <Loading
                      className={clsx("aevatarai-loading-icon")}
                      style={{ width: 14, height: 14 }}
                    />
                  )}
                  <span>{btnLoading ? "saving" : "save"}</span>
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
