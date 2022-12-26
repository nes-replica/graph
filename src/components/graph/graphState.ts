import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Connection,
  Edge,
  EdgeChange,
  Node, updateEdge, XYPosition
} from "react-flow-renderer";
import {MarkdownData} from "../markdown-node/MarkdownNode";
import {NodeChange} from "react-flow-renderer/dist/esm/types/changes";
import {Graph} from "./graphStorage";

export interface GraphState {
  nodes: Node<MarkdownData>[];
  edges: Edge[];
  draggingEdgeNow: boolean;
  isLoaded: boolean;
  loadingError?: string;
}

interface UpdateNodeData {
  type: "update";
  nodeId: string;
  newData: MarkdownData;
}

interface RFNodeChange {
  type: 'rfNodeChange'
  changes: NodeChange[]
}

interface RFEdgeChange {
  type: 'rfEdgeChange'
  changes: EdgeChange[]
}

interface RFConnect {
  type: 'rfConnect'
  connection: Connection
}

interface RFEdgeUpdate {
  type: 'rfEdgeUpdate'
  oldEdge: Edge
  newConnection: Connection
}

interface RFEdgeUpdateStart {
  type: 'rfEdgeUpdateStart'
}

interface RFEdgeUpdateEnd {
  type: 'rfEdgeUpdateEnd'
  edge: Edge
}

interface RFPaneDoubleClick {
  type: 'rfPaneDoubleClick'
  event: MouseEvent
}

interface CreateNode {
  type: 'createNode'
  position: XYPosition
}

interface LoadingSucceed {
  type: 'loadingSucceed'
  graph: Graph
}

interface LoadingFailed {
  type: 'loadingFailed'
  error: string
}

export type GraphStateAction =
  UpdateNodeData | RFNodeChange | RFEdgeChange | RFConnect | RFEdgeUpdate | RFEdgeUpdateStart |
  RFEdgeUpdateEnd | RFPaneDoubleClick | CreateNode | LoadingSucceed | LoadingFailed;

function isConnectionPosition(value: string): value is ConnectionPosition {
  return ['top', 'bottom', 'left', 'right'].includes(value);
}

export function graphStateReduceLog(state: GraphState, action: GraphStateAction): GraphState {
  console.log("old state", state)
  console.log("action", action)
  const newState = graphStateReduce(state, action)
  console.log("new state", newState)
  return newState
}

export const INITIAL_HANDLES: NodeHandle[] = [
  {id: makeHandleId('top', 0), position: 'top'},
  {id: makeHandleId('bottom', 0), position: 'bottom'},
  {id: makeHandleId('left', 0), position: 'left'},
  {id: makeHandleId('right', 0), position: 'right'},
]

function makeHandleId(position: ConnectionPosition, number: number) {
  return `${position}-handle-${number}`
}

function isOnTheSide(nodeHandles: NodeHandle[], position: ConnectionPosition, number: number) {
  const nodeId = makeHandleId(position, number)
  return nodeHandles[0].id === nodeId || nodeHandles[nodeHandles.length - 1].id === nodeId
}

function getUpdatedNodeHandles(nodeHandles: NodeHandle[], position: ConnectionPosition, number: number) {
  const nodeRowHandles = nodeHandles.filter(connection => connection.position === position)

  if (number === 0 && nodeRowHandles.length === 1) {
    const leftHandle = {id: makeHandleId(position, 1), position: position}
    const rightHandle = {id: makeHandleId(position, 2), position: position}
    return [leftHandle, ...nodeHandles, rightHandle]
  }

  if (!isOnTheSide(nodeRowHandles, position, number)) return nodeHandles

  const isOnTheRightSide = number % 2 === 0
  const newHandle = {id: makeHandleId(position, number + 2), position: position}

  const updatedRowHandles = isOnTheRightSide ? [...nodeRowHandles, newHandle] : [newHandle, ...nodeRowHandles]

  const nodeHandlesWithoutRow = nodeHandles.filter(connection => connection.position !== position)
  return [...nodeHandlesWithoutRow, ...updatedRowHandles]
}


export type ConnectionPosition = 'top' | 'bottom' | 'left' | 'right';

export interface NodeHandle {
  id: string;
  position: ConnectionPosition;
}

export function graphStateReduce(state: GraphState, action: GraphStateAction): GraphState {
  switch (action.type) {
    case 'loadingSucceed':
      return {...state, nodes: action.graph.nodes, edges: action.graph.edges, isLoaded: true};
    case 'loadingFailed':
      return {...state, isLoaded: true, loadingError: action.error};
    case 'update':
      const nodes = state.nodes.map(node =>
        (node.id === action.nodeId)
          ? {...node, data: {...node.data, ...action.newData}}
          : node);
      return {...state, nodes};
    case 'rfNodeChange':
      return {...state, nodes: applyNodeChanges(action.changes, state.nodes)};
    case 'rfEdgeChange':
      return {...state, edges: applyEdgeChanges(action.changes, state.edges)};
    case 'rfConnect':
      if (action.connection.sourceHandle === null || action.connection.targetHandle === null) return state

      const [sourcePosition, , rawSourceNumber] = action.connection.sourceHandle.split('-')
      const [targetPosition, , rawTargetNumber] = action.connection.targetHandle.split('-')

      const sourceNumber = parseInt(rawSourceNumber)
      const targetNumber = parseInt(rawTargetNumber)

      if (!isConnectionPosition(sourcePosition) || !isConnectionPosition(targetPosition)) return state;
      if (isNaN(sourceNumber) || isNaN(targetNumber)) return state;

      const updatedNodes: Node<MarkdownData>[] = state.nodes.map(node => {
        if (node.id === action.connection.source) {
          const updatedHandles = getUpdatedNodeHandles(node.data.nodeHandles, sourcePosition, sourceNumber)
          return {...node, data: {...node.data, nodeHandles: updatedHandles}}
        } else if (node.id === action.connection.target) {
          const updatedHandles = getUpdatedNodeHandles(node.data.nodeHandles, targetPosition, targetNumber)
          return {...node, data: {...node.data, nodeHandles: updatedHandles}}
        } else {
          return node
        }
      })

      return {...state, nodes: updatedNodes, edges: addEdge(action.connection, state.edges)};
    case 'rfEdgeUpdateStart':
      return {...state, draggingEdgeNow: true};
    case 'rfEdgeUpdate':
      return {...state, draggingEdgeNow: false, edges: updateEdge(action.oldEdge, action.newConnection, state.edges)};
    case 'rfEdgeUpdateEnd':
      if (state.draggingEdgeNow) {
        return {...state, draggingEdgeNow: false, edges: state.edges.filter(edge => edge.id !== action.edge.id)}
      } else {
        return state;
      }
    case 'createNode':
      const newId = Math.random().toString();
      return {
        ...state, nodes: [...state.nodes, {
          id: newId,
          type: 'markdown',
          position: action.position,
          data: {content: '_double click me_', nodeHandles: INITIAL_HANDLES}
        }]
      }
    default:
      console.warn("Unexpected action for graph state", action, state);
      return state;
  }
}
