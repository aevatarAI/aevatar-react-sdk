import { useCallback, useEffect, useRef, useState } from "react";
import { Textarea } from "../ui/textarea";
import AIStar from "../../assets/svg/aiStar.svg?react";
import clsx from "clsx";

interface GenerationTextInputProps {
  inputPrompt: string;
  isLoading: boolean;
  isGenerated: boolean;
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  searchData?: {
    completions?: string[];
  };
  isLoadingAutoComplete?: boolean;
  onSuggestionSelect?: (value: string) => void;
}

export default function GenerationTextInput({
  inputPrompt,
  isLoading,
  isGenerated,
  handleChange,
  searchData,
  isLoadingAutoComplete = false,
  onSuggestionSelect,
}: GenerationTextInputProps) {
  const [suggestionSelectedOpen, setSuggestionSelectedOpen] =
    useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [hasShownSuggestions, setHasShownSuggestions] =
    useState<boolean>(false);
  const [userManuallyClosed, setUserManuallyClosed] = useState<boolean>(false);
  const [lastCloseTime, setLastCloseTime] = useState<number>(0);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const suggestionSelectedOpenRef = useRef<boolean>(false);

  useEffect(() => {
    if (isGenerated) {
      setSuggestionSelectedOpen(false);
      setHasShownSuggestions(false);
      setSelectedIndex(-1);
      setUserManuallyClosed(false);
      setLastCloseTime(0);
    }
  }, [isGenerated]);

  // Show suggestions when data is available
  useEffect(() => {
    // Show suggestions when data is available and not loading, and user hasn't manually closed recently
    const timeSinceLastClose = Date.now() - lastCloseTime;
    const shouldShow =
      !isLoadingAutoComplete &&
      searchData?.completions?.length > 0 &&
      (!userManuallyClosed || timeSinceLastClose > 2000);

    if (shouldShow) {
      setSuggestionSelectedOpen(true);
      setHasShownSuggestions(true);
      setSelectedIndex(-1); // Reset selection when new data arrives
    }
    // Keep suggestions open during loading if we've already shown them and user hasn't manually closed
    else if (
      isLoadingAutoComplete &&
      hasShownSuggestions &&
      !userManuallyClosed
    ) {
      setSuggestionSelectedOpen(true);
    }
    // Only hide if we have no data and we're not loading
    else if (
      !isLoadingAutoComplete &&
      (!searchData?.completions || searchData.completions.length === 0)
    ) {
      setSuggestionSelectedOpen(false);
      setHasShownSuggestions(false);
      setUserManuallyClosed(false); // Reset manual close flag when no data
    }
  }, [
    searchData,
    isLoadingAutoComplete,
    hasShownSuggestions,
    userManuallyClosed,
    lastCloseTime,
  ]);

  // Update ref when state changes
  useEffect(() => {
    suggestionSelectedOpenRef.current = suggestionSelectedOpen;
  }, [suggestionSelectedOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!suggestionSelectedOpen || !searchData?.completions?.length) return;

    const suggestions = searchData.completions;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setSuggestionSelectedOpen(false);
        setHasShownSuggestions(false);
        setSelectedIndex(-1);
        setUserManuallyClosed(true);
        setLastCloseTime(Date.now());
        break;
    }
  };

  // Auto focus on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      textRef.current?.focus();
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      console.log("Click event detected:", {
        target: event.target,
        suggestionSelectedOpen: suggestionSelectedOpenRef.current,
        suggestionsRef: suggestionsRef.current,
        textRef: textRef.current,
      });

      if (suggestionSelectedOpenRef.current) {
        const target = event.target as Node;
        const isClickInsideSuggestions =
          suggestionsRef.current?.contains(target);
        const isClickInsideTextarea = textRef.current?.contains(target);

        console.log("Click analysis:", {
          isClickInsideSuggestions,
          isClickInsideTextarea,
          shouldClose: !isClickInsideSuggestions && !isClickInsideTextarea,
        });

        if (!isClickInsideSuggestions && !isClickInsideTextarea) {
          console.log("Click outside detected, closing suggestions");
          setSuggestionSelectedOpen(false);
          setHasShownSuggestions(false);
          setSelectedIndex(-1);
          setUserManuallyClosed(true);
          setLastCloseTime(Date.now());
        }
      }
    };

    if (suggestionSelectedOpen) {
      console.log("Adding click outside listener");
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("click", handleClickOutside);
      return () => {
        console.log("Removing click outside listener");
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [suggestionSelectedOpen]);

  const handleSuggestionSelect = (value: string) => {
    onSuggestionSelect?.(value);
    setSuggestionSelectedOpen(false);
    setHasShownSuggestions(false);
    setSelectedIndex(-1);
    setUserManuallyClosed(false);
    setLastCloseTime(0);

    // Also set cursor position here as backup
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (textRef.current) {
          textRef.current.focus();
          const textLength = textRef.current.value.length;

          textRef.current.setSelectionRange(textLength, textLength);
        }
      }, 100);
    });
  };

  return (
    <div className="sdk:relative">
      <Textarea
        autoFocus
        ref={textRef}
        id="input-prompt"
        className="sdk:text-[13px] sdk:bg-[var(--sdk-color-dialog-dark)] sdk:min-w-[595px] sdk:min-h-[120px]"
        placeholder="Please describe what kind of agent workflow you want to create"
        value={inputPrompt}
        disabled={isLoading}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          // Only close if the blur is not caused by clicking on suggestions
          setTimeout(() => {
            if (
              !suggestionsRef.current?.contains(document.activeElement as Node)
            ) {
              console.log("Textarea blurred, closing suggestions");
              setSuggestionSelectedOpen(false);
              setHasShownSuggestions(false);
              setSelectedIndex(-1);
              setUserManuallyClosed(true);
              setLastCloseTime(Date.now());
            }
          }, 100);
        }}
      />

      {/* Suggestions dropdown */}
      {suggestionSelectedOpen && searchData?.completions?.length > 0 && (
        <div
          ref={suggestionsRef}
          className={clsx(
            "sdk:absolute sdk:top-[75px] sdk:left-0 sdk:right-0 sdk:z-[60] sdk:px-[12px]"
          )}>
          <div className="sdk:bg-[var(--sdk-color-dialog-dark)] sdk:border sdk:border-[var(--sdk-color-border-primary)] sdk:rounded-md sdk:shadow-lg">
            {/* Header */}
            <div className="sdk:flex sdk:flex-row sdk:gap-2 sdk:items-center sdk:border-b sdk:border-[var(--sdk-color-border-primary)] sdk:px-[12px] sdk:py-[8px]">
              <AIStar />
              <span className="sdk:text-[var(--sdk-muted-foreground)] sdk:text-[12px]">
                {isLoadingAutoComplete ? "Loading suggestions..." : "Suggested"}
              </span>
            </div>

            {/* Suggestions list */}
            <div className="sdk:max-h-[200px] sdk:overflow-y-auto sdk:mx-[8px] sdk:my-[4px] sdk:gap-[4px] sdk:flex sdk:flex-col">
              {searchData.completions.map((suggestion, index) => (
                // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
                <div
                  key={suggestion}
                  className={clsx(
                    "sdk:w-full sdk:text-left sdk:pr-[8px] sdk:py-[8px] sdk:cursor-pointer sdk:text-[13px] sdk:text-[var(--sdk-color-text-primary)]",
                    "select-item-wrapper"
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSuggestionSelect(suggestion);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}>
                  {suggestion}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
