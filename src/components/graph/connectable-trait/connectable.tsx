import {ConnectionPosition, NodeHandle, WithHandles} from "../graphState";
import {Handle, Position, useUpdateNodeInternals} from "react-flow-renderer";
import {useEffect} from "react";
import "./style.css";
import {CustomNodeProps} from "~/components/graph/customNodeProps";

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

function makeHandles(handles: NodeHandle[]) {
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

type UnderlyingConstructor<Props> = (props: CustomNodeProps<Props>) => JSX.Element;

export function MakeConnectable<Props, PropsConn extends Props & WithHandles>(underlying: UnderlyingConstructor<Props>) {

  function ConnectableNode(props: CustomNodeProps<PropsConn>) {
    const {id, data: {nodeHandles}} = props;
    const updateNodeInternals = useUpdateNodeInternals();

    useEffect(() => {
      updateNodeInternals(id);
    }, [id, nodeHandles, updateNodeInternals])

    return <>
      {underlying(props)}
      {makeHandles(nodeHandles)}
    </>
  }

  return ConnectableNode;
}