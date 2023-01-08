import Modal from 'react-modal';
import {useState} from "react";
import './modal.css';
import {GenericEditor} from "./GenericEditor";
import {GenericData} from "./GenericNode";

export interface GenericEditorModalProps {
  genericData: GenericData;
  onSave: (newData: GenericData) => void;
  onCancel?: () => void;
  isOpen: boolean;
}

export function GenericEditorModal({isOpen, onSave, genericData, onCancel}: GenericEditorModalProps) {
  const [data, setData] = useState(String(genericData.content));

  return <Modal
    isOpen={isOpen}
    contentLabel="Generic editor modal"
    style={{overlay: {zIndex: 100}}}
  >
    <div className={'generic-editor-modal-container'}>
      <div className={'editor'}>
        <GenericEditor value={data} onChange={setData}/>
      </div>
      <div className={'actions'}>
        {onCancel && <button className={"cancel-button"} onClick={() => onCancel()}>cancel</button>}
        <button className={"save-button"} onClick={() => onSave({content: data})}>save</button>
      </div>
    </div>
  </Modal>;
}