import ReactFlow, {
  Connection,
  ConnectionMode,
  Controls,
  MiniMap,
  Node,
  ReactFlowProvider,
  useReactFlow
} from 'react-flow-renderer';
import {MouseEvent as ReactMouseEvent, useEffect, useReducer, useRef, useState} from "react";
import {MarkdownData, MarkdownNode} from "../markdown-node/MarkdownNode";
import {MarkdownEditorModal} from "../markdown-editor/MarkdownEditorModal";
import {graphStateReduce} from "./graphState";
import {GraphStorage} from "./graphStorage";
import {sampleGraph} from "./sampleData";

const nodeTypes = {
  markdown: MarkdownNode,
}

interface MdNodeEditorState {
  node?: Node<MarkdownData>;
}

function InternalGraph({graphStorage}: GraphProps) {
  const reactFlowRef = useRef<HTMLDivElement>(null);
  const { project } = useReactFlow();

  const [graph, dispatchGraphAction] = useReducer(graphStateReduce, {
    ...sampleGraph,
    draggingEdgeNow: false,
    isLoaded: false,
  })

  useEffect(() => {
    graphStorage.get()
      .then(graph => {
        console.log("got from storage", graph);
        dispatchGraphAction({ type: 'loadingSucceed', graph: graph });
      })
  }, [graphStorage]);


  useEffect(() => {
    if (graph.isLoaded) {
      graphStorage.save(graph).then(() => {
        console.log("saved to storage", graph);
      }, console.error);
    }
  }, [graph,  graphStorage]);


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
        newData: { content: newContent, nodeHandles: mdEditor.node.data.nodeHandles },
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
        onConnect={(connection: Connection) => {
          dispatchGraphAction({ type: 'rfConnect', connection });
        }}
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
        connectionMode={ConnectionMode.Loose}
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

export interface GraphProps {
  graphStorage: GraphStorage
}

export function Graph({graphStorage}: GraphProps) {
  return <ReactFlowProvider>
    <InternalGraph graphStorage={graphStorage} />
  </ReactFlowProvider>
}