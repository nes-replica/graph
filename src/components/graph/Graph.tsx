import ReactFlow, {
  MiniMap,
  Controls,
  EdgeChange,
  applyNodeChanges,
  Node,
  Edge,
  applyEdgeChanges
} from 'react-flow-renderer';
import {MouseEvent as ReactMouseEvent, useState} from "react";
import {NodeChange} from "react-flow-renderer/dist/esm/types/changes";
import {MarkdownData, MarkdownNode} from "../markdown-node/MarkdownNode";
import {MarkdownEditorModal} from "../markdown-editor/MarkdownEditorModal";

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
    data: { content: "Other no2de" },
    position: { x: 100, y: 125 },
  }
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
];

interface MdNodeEditorState {
  node?: Node<MarkdownData>;
}

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

  const [mdEditor, setMdEditor] = useState<MdNodeEditorState>({});

  function onNodeDoubleClick(event: ReactMouseEvent, node: Node<MarkdownData>) {
    setMdEditor({
      node: node,
    });
  }
  function onCancelMarkdownEditor() {
    setMdEditor({});
  }
  function onSaveMarkdownEditor() {
    setMdEditor({});
  }

  return (
    <>
      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView={true}
        onNodeDoubleClick={onNodeDoubleClick}
      >
        <MiniMap />
        <Controls />
      </ReactFlow>
      {
        mdEditor.node && <MarkdownEditorModal originalText={mdEditor.node?.data.content || ''}
                                              onSave={onSaveMarkdownEditor} onCancel={onCancelMarkdownEditor}
                                              isOpen={true} />
      }
    </>
  );
}
