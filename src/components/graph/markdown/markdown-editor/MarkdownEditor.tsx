import {Markdown} from "../Markdown";
import './editor.css';
import Editor from "@monaco-editor/react";
import {ScriptContextLibSource} from "~/components/graph/script/node/ScriptNode";

interface MarkdownEditorProps {
  value: string;
  onChange: (newValue: string) => void;
}

export function MarkdownEditor({value, onChange}: MarkdownEditorProps) {
  return <div className={'markdown-editor-container'}>
    <div className={'source-editor'}>
      <Editor
        height="100%"
        defaultLanguage="markdown"
        defaultValue={value}
        onChange={(newValue) => {
          if (newValue) onChange(newValue)
        }}
      />
    </div>
    <div className={'preview'}>
      <Markdown content={value}/>
    </div>
  </div>
}