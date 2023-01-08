import {Edge, Node} from "reactflow";
import {MarkdownData} from "./markdown/markdown-node/MarkdownNode";
import {INITIAL_HANDLES, WithHandles} from "./graphState";

const initialNodes: Node<MarkdownData & WithHandles>[] = [
  {
    id: '1',
    type: 'markdown',
    data: {
      content: 'Input _Node_',
      nodeHandles: INITIAL_HANDLES
    },
    position: {x: 250, y: 25},
  },

  {
    id: '2',
    type: 'markdown',
    data: {
      content: "Other no2de",
      nodeHandles: INITIAL_HANDLES
    },
    position: {x: 100, y: 125},
  }
];

const initialEdges: Edge[] = [];


export const sampleGraph = {
  nodes: initialNodes,
  edges: initialEdges,
}