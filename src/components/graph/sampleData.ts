import {Edge, Node} from "react-flow-renderer";
import {MarkdownData} from "../markdown-node/MarkdownNode";

const initialNodes: Node<MarkdownData>[] = [
  {
    id: '1',
    type: 'markdown',
    data: {
      content: 'Input _Node_',
      connections: [
        {id: 'x1', position: 'bottom'}
      ]
    },
    position: {x: 250, y: 25},
  },

  {
    id: '2',
    type: 'markdown',
    data: {
      content: "Other no2de",
      connections: [
        {id: 'x1', position: 'left'}
      ]
    },
    position: {x: 100, y: 125},
  },

  {
    id: '3',
    type: 'markdown',
    data: {content: "NODE 3"},
    position: {x: 300, y: 75},
  }
];

const initialEdges: Edge[] = [
  {id: 'e1-2', source: '1', target: '2', sourceHandle: 'x1', targetHandle: 'x1'},
];


export const sampleGraph = {
  nodes: initialNodes,
  edges: initialEdges,
}