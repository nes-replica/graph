import {Markdown} from "../Markdown";
import './editor.css';

interface MarkdownEditorProps {
  value: string;
  onChange: (newValue: string) => void;
}

export function MarkdownEditor({value, onChange}: MarkdownEditorProps) {
  return <div className={'markdown-editor-container'}>
    <div className={'source-editor'}>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
      ></textarea>
    </div>
    <div className={'preview'}>
      <Markdown content={value} />
    </div>
  </div>
}