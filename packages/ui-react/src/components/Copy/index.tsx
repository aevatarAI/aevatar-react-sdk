import TickIcon from "../../assets/svg/tick.svg?react";
import { useToast } from "../../hooks/use-toast";
import clsx from "clsx";
import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { useCopyToClipboard } from "react-use";

export default function Copy({
  description,
  toCopy,
  children,
  className,
  icon,
  iconClassName,
}: {
  description?: string;
  toCopy: string;
  children?: React.ReactNode;
  className?: string;
  icon?: ReactNode;
  iconClassName?: string;
}) {
  const { toast } = useToast();
  const [, setCopied] = useCopyToClipboard();
  const [clicked, setClicked] = useState(false);

  const onClick = useCallback(
    (e) => {
      e.stopPropagation();
      setClicked(true);

      toast({ description });

      const timeoutId = setTimeout(() => {
        setClicked(false);
      }, 2000);

      setCopied(toCopy);

      return () => clearTimeout(timeoutId);
    },
    [setCopied, toCopy, description, toast]
  );

  return (
    <span
      data-testid="copy-span"
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          onClick(event);
        }
      }}
      className={clsx("flex-row-center cursor-pointer", className)}>
      {clicked ? (
        <>
          <TickIcon />
        </>
      ) : (
        <span className={iconClassName}>{icon}</span>
      )}
      {children}
    </span>
  );
}
