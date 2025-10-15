import { useEffect, useRef, useState } from "react";
import "./index.css";

function MonacoEditor({ data }: { data: any }) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const editorInstanceRef = useRef<any>();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let dispose: () => void;

    const loadMonaco = async () => {
      if (!editorRef.current || typeof window === "undefined") return;

      try {
        // Dynamic import of Monaco Editor to prevent SSR issues
        const monaco = await import("monaco-editor");

        // Disable web workers to prevent issues
        (window as any).MonacoEnvironment = {
          getWorker: () => {
            return {
              postMessage: () => {},
              terminate: () => {},
              addEventListener: () => {},
              removeEventListener: () => {},
            };
          },
        };

        const editor = monaco.editor.create(editorRef.current, {
          value: JSON.stringify(data, null, 2),
          language: "json",
          theme: "vs-dark",
          automaticLayout: true,
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: "on",
          formatOnPaste: false, // Disabled to avoid web worker issues
          formatOnType: false, // Disabled to avoid web worker issues
          tabSize: 4,
          insertSpaces: true,
          // Disable features that require web workers
          quickSuggestions: false,
          suggestOnTriggerCharacters: false,
          parameterHints: {
            enabled: false,
          },
          hover: {
            enabled: false,
          },
          scrollbar: {
            vertical: "hidden",
            horizontal: "hidden",
            verticalScrollbarSize: 0,
            horizontalScrollbarSize: 0,
            verticalSliderSize: 0,
            horizontalSliderSize: 0,
            useShadows: false,
          },
        });

        editorInstanceRef.current = editor;
        setIsLoaded(true);
        dispose = () => editor.dispose();
      } catch (error) {
        console.error("Failed to load Monaco Editor:", error);
        // Still set loaded to true to show the div, even if there's an error
        setIsLoaded(true);
      }
    };

    if (typeof window !== "undefined") {
      loadMonaco();
    }

    return () => {
      dispose?.();
    };
  }, [data]);

  // Show loading state until Monaco is loaded on client side
  if (typeof window === "undefined" || !isLoaded) {
    return (
      <div
        style={{
          minHeight: "280px",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--sdk-color-bg-primary)",
          color: "var(--sdk-color-text-secondary)",
          fontSize: "14px",
        }}
      >
        Loading editor...
      </div>
    );
  }

  return <div ref={editorRef} style={{ minHeight: "280px", width: "100%" }} />;
}

export default MonacoEditor;
