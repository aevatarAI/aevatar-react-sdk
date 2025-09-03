import type React from "react";
import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import SearchIcon from "../../assets/svg/search.svg?react";
import CloseIcon from "../../assets/svg/close1.svg?react";

interface SearchBarProps {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  className?: string;
  onDebounceChange?: (v: string) => void;
  debounceMs?: number;
  onKeyDown?: any;
  onKeyUp?: any;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "search",
  className,
  onDebounceChange,
  debounceMs = 300,
  onKeyDown,
  onKeyUp,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const lastValue = useRef(value);

  const showActive = isFocused || value.length > 0;

  useEffect(() => {
    if (!onDebounceChange) return;
    if (lastValue.current === value) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      onDebounceChange(value);
      lastValue.current = value;
    }, debounceMs);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [value, onDebounceChange, debounceMs]);

  return (
    <div
      className={clsx(
        "sdk:relative sdk:w-full sdk:border-b-[1px] sdk:border-b-[var(--sdk-color-sidebar-border)] sdk:bg-transparent",
        className
      )}>
      <div className="sdk:flex sdk:flex-row sdk:items-center sdk:bg-[var(--sdk-sidebar-background)] sdk:gap-1 sdk:text-[var(--sdk-muted-foreground)] sdk:p-[8px] sdk:w-full">
        <SearchIcon
          className={clsx(
            "sdk:w-4 sdk:h-4 sdk:shrink-0",
            showActive ? "sdk:filter-none" : "sdk:grayscale sdk:opacity-60"
          )}
        />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={clsx(
            "sdk:bg-transparent sdk:border-none sdk:outline-none sdk:w-full sdk:text-[12px] sdk:font-outfit sdk:lowercase",
            showActive
              ? "sdk:text-[var(--sdk-color-text-primary)]"
              : "sdk:text-[var(--sdk-muted-foreground)]",
            "sdk:placeholder:text-[var(--sdk-muted-foreground)] sdk:placeholder:text-[12px]"
          )}
        />
        {value && (
          <button
            type="button"
            aria-label="clear"
            className="sdk:w-[14px] sdk:h-[14px] sdk:ml-1 sdk:shrink-0 sdk:focus:outline-none sdk:cursor-pointer"
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
            }}
            tabIndex={-1}>
            <CloseIcon className="sdk:w-full sdk:h-full" />
          </button>
        )}
      </div>
      <div className="sdk:pointer-events-none sdk:absolute sdk:inset-0 " />
    </div>
  );
};

export default SearchBar;
