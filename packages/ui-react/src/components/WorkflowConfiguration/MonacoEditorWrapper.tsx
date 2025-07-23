// components/MonacoEditorWrapper.tsx
import Editor from "@monaco-editor/react";

interface MonacoEditorWrapperProps {
  value?: string;
  width?: string;
  height?: string;
  language?: string;
  theme?: string;
}

export function MonacoEditorWrapper({
  value,
  width = "800px",
  height = "280px",
  language = "json",
  theme = "vs-dark",
}: MonacoEditorWrapperProps) {
  return (
    <Editor
      theme={theme}
      width={width}
      height={height}
      defaultLanguage={language}
      defaultValue={value}
    />
  );
}
