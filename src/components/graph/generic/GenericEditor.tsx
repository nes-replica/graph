import Editor from "@monaco-editor/react";

interface GenericEditorProps {
  value: string;
  onChange: (newValue: string) => void;
}

export function GenericEditor({value, onChange}: GenericEditorProps) {
  return <Editor
    height="100%"
    defaultLanguage="text"
    defaultValue={value}
    onChange={(newValue) => {
      if (newValue) onChange(newValue)
    }}
  />
}