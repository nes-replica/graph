
import Editor from "@monaco-editor/react";

interface ScriptEditorProps {
  value: string;
  onChange: (newValue: string) => void;
}

export function ScriptEditor(props: ScriptEditorProps) {
  return <Editor
            height="100%"
            defaultLanguage="javascript"
            defaultValue={props.value}
            onChange={(newValue) => {
              if (newValue) {
                props.onChange(newValue)
              }
            }}
          />
}
