import Modal from 'react-modal';
import {MarkdownEditor} from "./MarkdownEditor";
import {useState} from "react";
import './modal.css';

export interface MdEditorModalProps {
  originalText: string;
  onSave: (newText: string) => void;
  onCancel?: () => void;
  isOpen: boolean;
}

export function MarkdownEditorModal({
  isOpen, onSave, originalText, onCancel
}: MdEditorModalProps) {

  const [text, setText] = useState(originalText);

  return <Modal
    isOpen={isOpen}
    contentLabel="Example Modal"
    style={{overlay: {zIndex: 100}}}
  >
    <div className={'markdown-editor-modal-container'}>
      <div className={'editor'}>
        <MarkdownEditor value={text} onChange={setText}></MarkdownEditor>
      </div>
      <div className={'actions'}>
        {onCancel && <button onClick={() => onCancel()}>CANCEL</button>}
        <button onClick={() => onSave(text)}>SAVE</button>
      </div>
    </div>
  </Modal>;
}