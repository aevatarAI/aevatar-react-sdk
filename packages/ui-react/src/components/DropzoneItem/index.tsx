import Dropzone, { type Accept } from "react-dropzone";
import UploadIcon from "../../assets/svg/upload-icon.svg?react";
import { cn } from "../../lib/utils";
import MinusIcon from "../../assets/svg/minus-icon.svg?react";
import { FormLabel, FormMessage } from "../ui";
import { useFieldArray, type useForm } from "react-hook-form";
import { useMemo } from "react";

export interface IDropzoneItemProps {
  form: ReturnType<typeof useForm>;
  name: string;
  accept?: Accept;
  maxSize?: number;
}

export default function DropzoneItem({
  form,
  name,
  accept,
  maxSize = 5000000,
}: IDropzoneItemProps) {
  const { fields, append, remove } = useFieldArray({
    name,
    control: form.control,
  });

  const fieldsUpload = useMemo(
    () => fields as { name: string; id: string; content: File }[],
    [fields]
  );

  return (
    <>
      <FormLabel className="sdk:flex sdk:justify-between sdk:items-center">
        {name}
      </FormLabel>
      <Dropzone
        accept={accept}
        onDropAccepted={async (acceptedFiles) => {
          form.clearErrors(name);
          for (const file of acceptedFiles) {
            const name = file.name;
            append({
              name,
              content: file,
            });
          }
        }}
        onDropRejected={(error) => {
          form.setError(name, {
            message: error[0]?.errors?.[0]?.message ?? "Upload file error",
          });
        }}
        multiple={true}
        maxSize={maxSize}>
        {({ getRootProps, getInputProps }) => (
          <div
            {...getRootProps({
              className: cn(
                "sdk:border sdk:border-dashed sdk:border-[var(--sdk-bg-black-light)] sdk:py-[29px] sdk:flex sdk:items-center sdk:justify-center sdk:cursor-pointer"
              ),
              "data-testid": "dropzone-id",
            })}>
            <input {...getInputProps()} />
            <p className="sdk:font-outfit sdk:text-[12px] sdk:text-[var(--sdk-color-text-tertiary)] sdk:flex sdk:flex-col sdk:gap-[4px] sdk:items-center">
              <UploadIcon />
              <div>Click to upload (PDF)</div>
            </p>
          </div>
        )}
      </Dropzone>
      <FormMessage />
      <div>
        {fieldsUpload.map((field, index) => (
          <div
            key={field.id}
            className="sdk:flex sdk:mb-[10px] sdk:justify-between">
            <div>
              <div
                data-testid="field-name-dropzoneItem"
                className="sdk:font-outfit sdk:text-[12px] sdk:text-[var(--sdk-muted-foreground)]">
                {field.name}
              </div>
              <div className="sdk:font-outfit sdk:text-[12px] sdk:text-[var(--sdk-color-text-tertiary)]">
                {field.content?.size && `${field.content?.size} bytes`}
              </div>
            </div>

            <MinusIcon
              role="img"
              className="sdk:cursor-pointer"
              onClick={() => remove(index)}
            />
          </div>
        ))}
      </div>
    </>
  );
}
