import {useEffect, useRef, useState} from "react";
import './prompt.css';
import {CustomNodeProps} from "../customNodeProps";

export interface CommandNodeData {
  command: string;
}

export interface CommandNodeInteractionProps {
  editMode?: boolean;
  onUpdate?: (newCommand: string) => void;
  onCancel?: () => void;
  onReload?: () => void;
  onRequestToEdit?: () => void;
}

export type CommandPromptInteractiveNodeProps = CustomNodeProps<CommandNodeData> & CommandNodeInteractionProps;

export function makeCommandNodeInteractionProps(
  props: CustomNodeProps<CommandNodeData>,
  activePrompt: string | undefined,
  setActivePrompt: (id: string | undefined) => void,
  onUpdate: (nodeId: string, updateFunc: (data: any) => any) => void
): CommandNodeInteractionProps {
  return {
    editMode: props.id === activePrompt,
    onUpdate: newCommand => {
      onUpdate(props.id, (data: CommandNodeData): CommandNodeData => ({...data, command: newCommand}))
      setActivePrompt(undefined);
    },
    onCancel: () => {
      setActivePrompt(undefined);
    },
    onReload: () => {
      console.log("RUN COMMAND", props.data.command)
    },
    onRequestToEdit: () => {
      setActivePrompt(props.id);
    },
  }
}


export function CommandPromptNode(
  {
    data: {command},
    editMode,
    onUpdate, onCancel, onReload, onRequestToEdit
  }: CommandPromptInteractiveNodeProps
) {

  const [value, setValue] = useState(command);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editMode && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length);
    }
  }, [inputRef, editMode])

  return <div className={'command-prompt'}>{
    editMode ? (
      <>
        <div className={'prompt-icon'}>/</div>
        <textarea ref={inputRef} className={'command'}
                  value={value} onChange={(ev) => setValue(ev.target.value)}/>
        <div className={'actions'}>
          <div className={'cancel'} onClick={onCancel}></div>
          <div className={'apply'} onClick={onUpdate && (() => onUpdate(value))}></div>
        </div>
      </>
    ) : (
      <>
        <div className={'prompt-icon'}>/</div>
        <div className={'command'}>{command}</div>
        <div className={'actions'}>
          <div className={'edit'} onClick={onRequestToEdit}></div>
          <div className={'reload'} onClick={onReload}></div>
        </div>
      </>
    )
  }</div>;
}