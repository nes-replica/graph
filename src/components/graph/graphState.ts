import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Connection,
  Edge,
  EdgeChange,
  Node, updateEdge, XYPosition
} from "react-flow-renderer";
import {MarkdownData} from "./markdown/markdown-node/MarkdownNode";
import {NodeChange} from "react-flow-renderer/dist/esm/types/changes";
import {Graph} from "./graphStorage";
import {CommandNodeData} from "./command-prompt/CommandPromptNode";
import {PictureData} from "./picture/PictureNode";
import {ScriptData} from "./script/node/ScriptNode";

export interface GraphState {
  nodes: Node<NodeDataTypeValues>[];
  edges: Edge[];
  uploadingParams?: {
    position: XYPosition
  }
  draggingEdgeNow: boolean;
  isLoaded: boolean;
  loadingError?: string;
  nodeCount: number
}

interface UpdateNodeData {
  type: "update";
  nodeId: string;
  newData: any;
}

interface UpdateNodeWithCallback {
  type: "updateCb";
  nodeId: string;
  updateFunc: (data: any) => any;
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

type NodeDataTypes = {
  'markdown': MarkdownData,
  'picture': PictureData,
  'commandPrompt': CommandNodeData,
  'script': ScriptData,
}

export type NodeDataTypeKeys = keyof NodeDataTypes
export type NodeDataTypeValues = NodeDataTypes[NodeDataTypeKeys]

function isNodeOfType<T extends keyof NodeDataTypes>(node: Node, type: T): node is Node<NodeDataTypes[T]> {
  return node.type === type
}

interface CreateNode {
  type: 'createNode'
  node: {
    type: NodeDataTypeKeys,
    data: NodeDataTypeValues
    position: XYPosition
  }
  afterNewNode?: (id: string) => GraphStateAction | void;
}

interface LoadingSucceed {
  type: 'loadingSucceed'
  graph: Graph
}

interface LoadingFailed {
  type: 'loadingFailed'
  error: string
}

interface PictureUploadStart {
  type: 'pictureUploadStart'
  position: XYPosition,
}

interface PictureUploadProgress {
  type: 'pictureUploadProgress'
}

interface PictureUploadFinished {
  type: 'pictureUploadFinished'
  error?: Error
  url?: string
}

export type PictureUploadAction = PictureUploadStart | PictureUploadProgress | PictureUploadFinished

export type GraphStateAction =
  UpdateNodeData | UpdateNodeWithCallback | RFNodeChange | RFEdgeChange | RFConnect | RFEdgeUpdate | RFEdgeUpdateStart |
  RFEdgeUpdateEnd | RFPaneDoubleClick | CreateNode | LoadingSucceed | LoadingFailed | PictureUploadAction;

function isConnectionPosition(value: string): value is ConnectionPosition {
  return ['top', 'bottom', 'left', 'right'].includes(value);
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

function updateNode(nodes: Node[], id: string, updateFunc: (data: any) => any) {
  return nodes.map(node => (node.id === id) ? {...node, data: updateFunc(node.data)} : node);
}

export function graphStateReduce(state: GraphState, action: GraphStateAction): GraphState {
  switch (action.type) {
    case 'loadingSucceed':
      return {...state, nodes: action.graph.nodes, edges: action.graph.edges, isLoaded: true};
    case 'loadingFailed':
      return {...state, isLoaded: true, loadingError: action.error};
    case 'updateCb':
      return {...state, nodes: updateNode(state.nodes, action.nodeId, action.updateFunc)};
    case 'update':
      return {...state, nodes: updateNode(state.nodes, action.nodeId, (old) => ({...old, ...action.newData}))};
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

      const updatedNodes = state.nodes.map(node => {
        if (!isNodeOfType(node, 'markdown')) return node;

        if (node.id === action.connection.source && node.data.nodeHandles !== undefined) {
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
      const id = state.nodeCount.toString()
      const {type, data, position} = action.node
      const newNode = {id, type, position, data}

      const newState = {...state, nodeCount: state.nodeCount + 1, nodes: [...state.nodes, newNode]};
      if (action.afterNewNode) {
        const additionalAction = action.afterNewNode(id);

        if (additionalAction) return graphStateReduce(newState, additionalAction)
      }
      return newState;
    case "pictureUploadStart":
      return {...state, uploadingParams: {position: action.position}};
    case "pictureUploadFinished":
      if (action.error) {
        alert(`Uploading failed: ${action.error}`);
        console.error("uploading failed", action.error);
      } else if (action.url) {
        if (state.uploadingParams) {
          return graphStateReduce(state, {
            type: 'createNode',
            node: {
              type: 'picture',
              data: {picture_url: action.url, preview: {width: 300, height: 200}},
              position: state.uploadingParams.position,
            }
          })
        }
      } else {
        console.error("invalid action: no error or url", action);
      }
      return state;
    default:
      console.warn("Unexpected action for graph state", action, state);
      return state;
  }
}
