import ReactFlow, {
  MiniMap,
  Controls,
  EdgeChange,
  applyNodeChanges,
  Node,
  Edge,
  applyEdgeChanges
} from 'react-flow-renderer';
import {useState} from "react";
import {NodeChange} from "react-flow-renderer/dist/esm/types/changes";
import {MarkdownData, MarkdownNode} from "../markdown-node/MarkdownNode";

const nodeTypes = {
  markdown: MarkdownNode,
}

const initialNodes: Node<MarkdownData>[] = [
  {
    id: '1',
    type: 'markdown',
    data: { content: 'Input _Node_' },
    position: { x: 250, y: 25 },
  },

  {
    id: '2',
    type: 'markdown',
    data: { content: "Other node" },
    position: { x: 100, y: 125 },
  }
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
];

export function Graph() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  function onNodesChange(changes: NodeChange[]) {
    setNodes(currNodes => {
      return applyNodeChanges(changes, currNodes);
    })
  }
  function onEdgesChange(changes: EdgeChange[]) {
    setEdges(currEdges => {
      return applyEdgeChanges(changes, currEdges);
    })
  }

  return (
    <ReactFlow
      nodes={nodes} edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      fitView={true}
    >
      <MiniMap />
      <Controls />
    </ReactFlow>
  );
}
