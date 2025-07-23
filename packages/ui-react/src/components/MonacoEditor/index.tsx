import { useEffect, useRef } from "react";
import type * as monaco from "monaco-editor";
import "./index.css";

function MonacoEditor({ data }: { data: any }) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const editorInstanceRef = useRef<monaco.editor.IStandaloneCodeEditor>();

  useEffect(() => {
    let dispose: () => void;

    const loadMonaco = async () => {
      if (!editorRef.current) return;

      const monaco = await import("monaco-editor");

      const editor = monaco.editor.create(editorRef.current, {
        value: JSON.stringify(data, null, 2),
        language: "javascript",
        theme: "vs-dark",
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: "on",
        formatOnPaste: true,
        formatOnType: true,
        tabSize: 4,
        insertSpaces: true,
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
      dispose = () => editor.dispose();
    };

    if (typeof window !== "undefined") {
      loadMonaco();
    }

    return () => {
      dispose?.();
    };
  }, [data]);

  return <div ref={editorRef} style={{ minHeight: "280px", width: "100%" }} />;
}

export default MonacoEditor;
