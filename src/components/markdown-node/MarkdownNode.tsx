import {NodeProps} from "react-flow-renderer/dist/esm/types/nodes";
import {Markdown} from "../markdown/Markdown";
import './MarkdownNode.css';
import {useEffect, useState} from "react";
import {Handle, Position, useUpdateNodeInternals} from "react-flow-renderer";

export type ConnectionPosition = 'top' | 'bottom' | 'left' | 'right';
const AllPositions: ConnectionPosition[] = ['top', 'left', 'right', 'bottom'];

function toRFPosition(connPosition: ConnectionPosition) {
  switch (connPosition) {
    case "bottom": return Position.Bottom;
    case "top": return Position.Top;
    case "left": return Position.Left;
    case "right": return Position.Right;
  }
}

interface Connection {
  id: string;
  position: ConnectionPosition;
}

export interface MarkdownData {
  content: string;
  connections?: Connection[];
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

export interface PipkaData {
  position: ConnectionPosition
  isBefore: boolean
}

function newPipkaId(position: ConnectionPosition, isBefore: boolean = true) {
  return JSON.stringify({position, isBefore});
}

export function parsePipka(id: string): PipkaData | null {
  try {
    const res = JSON.parse(id);
    if (Object.hasOwn(res, "position") && Object.hasOwn(res, "isBefore")) {
      return res;
    } else {
      return null;
    }
  }
  catch (e) {
    return null;
  }
}

function renderConnectionsRow(conns: Connection[], position: ConnectionPosition): JSX.Element | JSX.Element[] {
  const desiredConns = conns.filter(c => c.position === position);
  const pos = toRFPosition(position)

  if (desiredConns.length === 0) {
    return <Handle
      key={newPipkaId(position)}
      type="source" id={newPipkaId(position)} position={pos}
      className={'new-handle'}
      style={handleStyle(0, 1, position)}/>
  } else {
    const handlesCnt = desiredConns.length + 2;
    return <>
      <Handle key={newPipkaId(position, true)} type="source" id={newPipkaId(position, true)} position={pos}
              className={'new-handle'}
              style={handleStyle(0, handlesCnt, position)}/>
      {desiredConns.map((h, i) => {
        return <Handle key={h.id} type="source" id={h.id} position={pos}
                style={handleStyle(i+1, handlesCnt, position)}/>
      })}
      <Handle key={newPipkaId(position, false)} type="source" id={newPipkaId(position, false)} position={pos}
              className={'new-handle'}
              style={handleStyle(handlesCnt-1, handlesCnt, position)}/>
    </>
  }
}

export function MarkdownNode({id, data: {content, connections}}: Pick<NodeProps<MarkdownData>, 'data' | 'id'>) {
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    updateNodeInternals(id);
  }, [id, connections, updateNodeInternals])

  const trimmedContent = content.trim();
  const shortContent = trimmedContent.split("\n", 2)[0];

  const alwaysExpanded = shortContent === trimmedContent;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <div className={'markdown-node-container'}>
        <>
          {connections?.length}
        </>
        <Markdown content={isExpanded ? trimmedContent : shortContent}></Markdown>
        {
          alwaysExpanded ? null : (
            (isExpanded)
              ? <img className={'collapse-button'} src={'up.svg'} alt={'collapse'} onClick={() => setIsExpanded(false)} />
              : <img className={'expand-button'} src={'down.svg'} alt={'expand'} onClick={() => setIsExpanded(true)} />
          )
        }
      </div>
      {
        AllPositions.map(p => renderConnectionsRow(connections || [], p))
      }
    </>
  );
}