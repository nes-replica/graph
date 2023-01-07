import Modal from 'react-modal';
import {useState} from "react";
import './modal.css';
import {ScriptEditor} from "./ScriptEditor";
import {ScriptData} from "../node/ScriptNode";

export interface ScriptEditorModalProps {
  scriptData: ScriptData;
  onSave: (newData: ScriptData) => void;
  onCancel?: () => void;
  isOpen: boolean;
}

export function ScriptEditorModal({
                                      isOpen, onSave, scriptData, onCancel
                                    }: ScriptEditorModalProps) {

  const [data, setData] = useState(scriptData);

  return <Modal
    isOpen={isOpen}
    contentLabel="Example Modal"
    style={{overlay: {zIndex: 100}}}
  >
    <div className={'script-editor-modal-container'}>
      <div className={'header'}>
        <label>Name: <input value={data.name} onChange={event => setData({...data, name: event.target.value})}/></label>
      </div>
      <div className={'editor'}>
        <ScriptEditor value={data.script} onChange={newScript => setData({...data, script: newScript})} />
      </div>
      <div className={'actions'}>
        {onCancel && <button className={"cancel-button"} onClick={() => onCancel()}>cancel</button>}
        <button className={"save-button"} onClick={() => onSave(data)}>save</button>
      </div>
    </div>
  </Modal>;
}