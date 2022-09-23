import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Connection,
  Edge,
  EdgeChange,
  Node, updateEdge, XYPosition
} from "react-flow-renderer";
import {ConnectionPosition, MarkdownData, parsePipka} from "../markdown-node/MarkdownNode";
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
  newSourceHandle: string
  newTargetHandle: string
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

interface NewConnectionProps {
  isBefore: boolean
  position: ConnectionPosition
}

function getNewConnection(handle: string | null): NewConnectionProps | null {
  if (handle == null) {
    console.warn("handle for new connection is null")
    return {
      isBefore: true,
      position: "top",
    }
  } else {
    const newPipkaInfo = parsePipka(handle);
    if (newPipkaInfo) {
      return {
        isBefore: newPipkaInfo.isBefore,
        position: newPipkaInfo.position,
      }
    } else {
      return null;
    }
  }
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
      return {...state, nodes };
    case 'rfNodeChange':
      return {...state, nodes: applyNodeChanges(action.changes, state.nodes)};
    case 'rfEdgeChange':
      return {...state, edges: applyEdgeChanges(action.changes, state.edges)};
    case 'rfConnect':
      const newSourceHandle = getNewConnection(action.connection.sourceHandle);
      const newTargetHandle = getNewConnection(action.connection.targetHandle);
      const newConnection = {
        ...action.connection,
        sourceHandle: newSourceHandle ? action.newSourceHandle : action.connection.sourceHandle,
        targetHandle: newTargetHandle ? action.newTargetHandle : action.connection.targetHandle,
      }
      const nodes2 = state.nodes.map(node => {
        if (node.id === action.connection.source || node.id === action.connection.target) {
          let newConnections = node.data.connections || [];
          if (node.id === action.connection.source && newSourceHandle) {
            newConnections =
              newSourceHandle.isBefore
                ? [{id: action.newSourceHandle, position: newSourceHandle.position}, ...newConnections]
                : [...newConnections, {id: action.newSourceHandle, position: newSourceHandle.position}];
          }
          if (node.id === action.connection.target && newTargetHandle) {
            newConnections =
              newTargetHandle.isBefore
                ? [{id: action.newTargetHandle, position: newTargetHandle.position}, ...newConnections]
                : [...newConnections, {id: action.newTargetHandle, position: newTargetHandle.position}];
          }
          return {
            ...node,
            data: {
              ...node.data,
              connections: newConnections
            }
          }
        }
        return node;
      });
      console.log('rfConnect', action, state.nodes, nodes2);
      return {...state, nodes: nodes2, edges: addEdge(newConnection, state.edges)};
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
      return {...state, nodes: [...state.nodes, {
        id: newId,
        type: 'markdown',
        position: action.position,
        data: {content: '_double click me_'}
      }]}
    default:
      console.warn("Unexpected action for graph state", action, state);
      return state;
  }
}
