import Filter from "../../assets/svg/filter.svg?react";
import FilterBtn from "../../assets/svg/filterBtn.svg?react";
import {
  Button,
  Input,
  Dialog,
  DialogContent,
  DialogTrigger,
  DatePickerWithoutRange,
} from "../ui";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  editExecutionsFilterForm,
  type TEditExecutionsFilterForm,
} from "../types";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";

interface Workflow {
  id: string;
  name: string;
}

interface CustomDialogProps {
  data?: Workflow[];
  filter: any;
  onChange: (filter: any) => void;
}

const STATUSES = ["all", "pending", "running", "failed", "success"];

export const EditExecutionsFilterDialog = ({
  data,
  filter,
  onChange,
}: CustomDialogProps) => {
  const [filterCount, setFilterCount] = useState(0);
  const form = useForm<TEditExecutionsFilterForm>({
    resolver: zodResolver(editExecutionsFilterForm),
    defaultValues: {
      name: "",
      status: "",
      date: "",
      id: "",
    },
  });
  const watchedValues = form.watch();

  useEffect(() => {
    const filterCount = Object.values(watchedValues).filter(
      (value) => value !== undefined && value !== ""
    )?.length;

    setFilterCount(filterCount);
  }, [watchedValues]);

  useEffect(() => {
    // for any changes to filter, send it to callback
  }, []);

  const onSubmit = () => {};

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          className="max-w-[35px] max-h-[35px]"
          disabled={false}
        >
          {filterCount > 0 ? <FilterBtn /> : <Filter />}
        </Button>
      </DialogTrigger>
      <DialogContent
        aria-describedby="create new api key"
        className="w-[356px] p-5 flex flex-col gap-[28px] rounded-[6px] border border-black-light [&>button]:hidden"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-y-[16px] items-start content-start self-stretch">
              <FormField
                key="name"
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem aria-labelledby="name" className="w-full">
                    <FormLabel id="name">workflow</FormLabel>
                    <FormControl>
                      <Select
                        value={field?.value}
                        disabled={field?.disabled}
                        onValueChange={(value: string) => {
                          field.onChange(value);
                          onChange({
                            ...filter,
                            name: value,
                          });
                        }}
                      >
                        <FormControl>
                          <SelectTrigger
                            aria-disabled={field?.disabled}
                            className="normal-case"
                          >
                            <SelectValue placeholder="all workflows" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="w-[286px] left-0 -top-[4px] p-[8px_8px_20px_10px] cutCorner cutCorner__white">
                          {data?.map((item) => (
                            <SelectItem
                              className="text-[16px] normal-case"
                              key={item.id}
                              value={item.name}
                            >
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                key="status"
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem aria-labelledby="statusLabel" className="w-full">
                    <FormLabel id="statusLabel">status</FormLabel>
                    <FormControl>
                      <Select
                        value={field?.value}
                        disabled={field?.disabled}
                        onValueChange={(value: string) => {
                          field?.onChange(value);
                          onChange({
                            ...filter,
                            status: value,
                          });
                        }}
                      >
                        <FormControl>
                          <SelectTrigger
                            aria-disabled={field?.disabled}
                            className="normal-case"
                          >
                            <SelectValue
                              placeholder="any status"
                              defaultValue="pending"
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="w-[286px] left-0 -top-[4px] p-[8px_8px_20px_10px] cutCorner cutCorner__white">
                          {STATUSES.map((item: string) => (
                            <SelectItem
                              className="text-[16px] normal-case"
                              key={item}
                              value={item}
                            >
                              {item}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                key="date"
                control={form.control}
                name="date"
                render={({ field }) => {
                  return (
                    <FormItem aria-labelledby="dateLabel" className="w-full">
                      <FormLabel id="dateLabel">execution start</FormLabel>
                      <FormControl>
                        <div className="flex items-center justify-between border border-[#303030]">
                          <DatePickerWithoutRange
                            onDateChange={(date: any) => {
                              field.onChange(date);
                            }}
                          />
                          <span>-</span>
                          <DatePickerWithoutRange
                            onDateChange={(date: any) => {
                              field.onChange(date);
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                key="id"
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem aria-labelledby="idLabel" className="w-full">
                    <FormLabel id="idLabel">execution id</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="id"
                        value={field.value}
                        onChange={(e) => {
                          // Do a debounce here
                          const value = e.target.value;
                          field.onChange(value);
                          onChange({
                            ...filter,
                            id: value,
                          });
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              className="text-white text-[13px] py-[7px] leading-[14px] mt-[16px]"
              type="reset"
              onClick={() => {
                form.reset();
              }}
            >
              reset all
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
