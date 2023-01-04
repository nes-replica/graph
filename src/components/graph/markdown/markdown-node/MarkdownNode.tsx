import {Markdown} from "../Markdown";
import './MarkdownNode.css';
import {useEffect, useState} from "react";
import {Handle, Position, useUpdateNodeInternals} from "react-flow-renderer";
import {ConnectionPosition, NodeHandle} from "../../graphState";
import {CustomNodeProps} from "../../customNodeProps";

export interface MarkdownData {
  content: string;
  nodeHandles: NodeHandle[];
}

function toRFPosition(connPosition: ConnectionPosition) {
  switch (connPosition) {
    case "bottom": return Position.Bottom;
    case "top": return Position.Top;
    case "left": return Position.Left;
    case "right": return Position.Right;
  }

  //never reach
  return Position.Top
}

function handleStyle(i: number, total: number, position: ConnectionPosition) {
  const offset = `${100 * (i+1) / (total+1)}%`
  switch (position) {
    case "top":
    case "bottom": return {left: offset}
    case "right":
    case "left": return {top: offset}
  }
}

function makeHandle(id: string, position: ConnectionPosition, indexInRow: number, handlesInRowCount: number) {
  return <Handle
    key={id}
    type="source"
    id={id}
    position={toRFPosition(position)}
    className={'new-handle'}
    style={handleStyle(indexInRow, handlesInRowCount, toRFPosition(position))}
  />
}

function makeHandles(handles?: NodeHandle[]) {
  handles = handles || [];
  const topHandleRow = handles.filter(h => h.position === 'top');
  const topHandleRowRendered = topHandleRow.map((handle, index) => {
    return makeHandle(handle.id, handle.position, index, topHandleRow.length);
  })

  const bottomHandleRow = handles.filter(h => h.position === 'bottom');
  const bottomHandleRowRendered = bottomHandleRow.map((handle, index) => {
    return makeHandle(handle.id, handle.position, index, bottomHandleRow.length);
  })

  const leftHandleRow = handles.filter(h => h.position === 'left');
  const leftHandleRowRendered = leftHandleRow.map((handle, index) => {
    return makeHandle(handle.id, handle.position, index, leftHandleRow.length);
  })

  const rightHandleRow = handles.filter(h => h.position === 'right');
  const rightHandleRowRendered = rightHandleRow.map((handle, index) => {
    return makeHandle(handle.id, handle.position, index, rightHandleRow.length);
  })

  return [...topHandleRowRendered, ...bottomHandleRowRendered, ...leftHandleRowRendered, ...rightHandleRowRendered]
}

export function MarkdownNode({id, data: {content, nodeHandles}}: CustomNodeProps<MarkdownData>) {
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    updateNodeInternals(id);
  }, [id, nodeHandles, updateNodeInternals])

  const trimmedContent = content.trim();
  const shortContent = trimmedContent.split("\n", 2)[0];

  const alwaysExpanded = shortContent === trimmedContent;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <div className={'markdown-node-container'}>
        <Markdown content={isExpanded ? trimmedContent : shortContent}></Markdown>
        {
          alwaysExpanded ? null : (
            (isExpanded)
              ? <img className={'collapse-button'} src={'up.svg'} alt={'collapse'} onClick={() => setIsExpanded(false)} />
              : <img className={'expand-button'} src={'down.svg'} alt={'expand'} onClick={() => setIsExpanded(true)} />
          )
        }
      </div>

      {makeHandles(nodeHandles)}
    </>
  );
}