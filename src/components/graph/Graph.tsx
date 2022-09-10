import ReactFlow, {
  MiniMap,
  Controls,
  Node,
  Edge, useReactFlow, ReactFlowProvider
} from 'react-flow-renderer';
import {MouseEvent as ReactMouseEvent, useReducer, useRef, useState} from "react";
import {MarkdownData, MarkdownNode} from "../markdown-node/MarkdownNode";
import {MarkdownEditorModal} from "../markdown-editor/MarkdownEditorModal";
import {graphStateReduce} from "./graphState";

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
  },

  {
    id: '3',
    type: 'markdown',
    data: { content: "NODE 3" },
    position: { x: 300, y: 75 },
  }
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', sourceHandle: 'source1', targetHandle: 'target1'},
];

interface MdNodeEditorState {
  node?: Node<MarkdownData>;
}

function InternalGraph() {
  const reactFlowRef = useRef<HTMLDivElement>(null);
  const { project } = useReactFlow();

  const [graph, dispatchGraphAction] = useReducer(graphStateReduce, {
    nodes: initialNodes,
    edges: initialEdges,
    draggingEdgeNow: false,
  })

  const [mdEditor, setMdEditor] = useState<MdNodeEditorState>({});

  function onNodeDoubleClick(event: ReactMouseEvent, node: Node<MarkdownData>) {
    setMdEditor({
      node: node,
    });
  }
  function onCancelMarkdownEditor() {
    setMdEditor({});
  }
  
  function onSaveMarkdownEditor(newContent: string) {
    if (mdEditor.node) {
      dispatchGraphAction({
        type: 'update',
        newData: {content: newContent},
        nodeId: mdEditor.node?.id
      })
      setMdEditor({});
    } else {
      console.warn("WARN impossible state: onSaveMarkdownEditor called without node set")
    }
  }

  return (
    <>
      <ReactFlow
        ref={reactFlowRef}
        nodes={graph.nodes} edges={graph.edges}
        onSelectCapture={console.log}
        onNodesChange={changes => dispatchGraphAction({type: 'rfNodeChange', changes})}
        onEdgesChange={changes => dispatchGraphAction({type: 'rfEdgeChange', changes})}
        onConnect={connection => dispatchGraphAction({type: 'rfConnect', connection})}
        onEdgeUpdateStart={() => dispatchGraphAction({type: 'rfEdgeUpdateStart'})}
        onEdgeUpdate={(oldEdge, newConnection) => dispatchGraphAction({type: 'rfEdgeUpdate', oldEdge, newConnection})}
        onEdgeUpdateEnd={(_, edge) => dispatchGraphAction({type: 'rfEdgeUpdateEnd', edge})}
        nodeTypes={nodeTypes}
        fitView={true}
        onNodeDoubleClick={onNodeDoubleClick}
        onDoubleClickCapture={event => {
          if (reactFlowRef.current && event.target instanceof Element) {
            const targetIsPane = event.target.classList.contains('react-flow__pane');
            if (targetIsPane) {
              const { top, left } = reactFlowRef.current.getBoundingClientRect();
              dispatchGraphAction({
                type: 'createNode',
                position: project({ x: event.clientX - left, y: event.clientY - top }),
              })
            }
          }
        }}
        deleteKeyCode={'Delete'}
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

export function Graph() {
  return <ReactFlowProvider>
    <InternalGraph />
  </ReactFlowProvider>
}