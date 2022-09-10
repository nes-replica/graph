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

export interface GraphState {
  nodes: Node<MarkdownData>[];
  edges: Edge[];
  draggingEdgeNow: boolean;
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

export type GraphStateAction = UpdateNodeData | RFNodeChange | RFEdgeChange | RFConnect | RFEdgeUpdate | RFEdgeUpdateStart | RFEdgeUpdateEnd | RFPaneDoubleClick | CreateNode;

export function graphStateReduce(state: GraphState, action: GraphStateAction): GraphState {
  switch (action.type) {
    case 'update':
      const nodes = state.nodes.map(node => (node.id === action.nodeId) ? {...node, data: action.newData} : node);
      return {...state, nodes };
    case 'rfNodeChange':
      return {...state, nodes: applyNodeChanges(action.changes, state.nodes)};
    case 'rfEdgeChange':
      return {...state, edges: applyEdgeChanges(action.changes, state.edges)};
    case 'rfConnect':
      return {...state, edges: addEdge(action.connection, state.edges)};
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
