import ReactFlow, {
  ConnectionMode,
  Controls,
  MiniMap,
  Node,
  ReactFlowProvider,
  useReactFlow
} from 'react-flow-renderer';
import {
  MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect, useMemo,
  useReducer,
  useRef,
  useState
} from "react";
import {MarkdownData, MarkdownNode} from "../markdown-node/MarkdownNode";
import {MarkdownEditorModal} from "../markdown-editor/MarkdownEditorModal";
import {graphStateReduce} from "./graphState";
import {GraphStorage} from "./graphStorage";
import {OnNodeResize, PictureNode, PictureNodeProps} from "../picture/PictureNode";
import {DropEvent, FileRejection, useDropzone} from 'react-dropzone';
import {handleDropzoneFile} from "./dropzoneHandler";
import {sampleGraph} from "./sampleData";

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
  }, [graph, graphStorage]);


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

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[], event: DropEvent) => {
    if (!reactFlowRef.current) {
      console.error("reached drop callback before react-flow initialization", event)
      return;
    }
    const {top, left} = reactFlowRef.current.getBoundingClientRect();
    if (!("clientX" in event) || !("clientY" in event)) {
      console.error("dropzone event does not have position data (clientX/clientY)", event)
      return;
    }
    acceptedFiles.forEach((file) => {
      const position = project({x: event.clientX - left, y: event.clientY - top});
      handleDropzoneFile(file, position, dispatchGraphAction);
    });
  }, [project, reactFlowRef]);

  const {getRootProps: getDropzoneRootProps, getInputProps: getDropzoneFileInputProps} = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
  })

  function PictureNodeResizable(props: PictureNodeProps) {
    const onResize: OnNodeResize = (id, width, height) => {
      dispatchGraphAction({
        type: 'update',
        nodeId: id,
        newData: {
          preview: {width, height}
        }
      })
    };
    return PictureNode({...props, onResize})
  }

  const nodeTypes = useMemo(() => {
    return {
      markdown: MarkdownNode,
      picture: PictureNodeResizable,
    }
  }, [])

  return (
    <>
      <ReactFlow
        {...getDropzoneRootProps()}
        ref={reactFlowRef}
        nodes={graph.nodes} edges={graph.edges}
        onSelectCapture={console.log}
        onNodesChange={changes => dispatchGraphAction({type: 'rfNodeChange', changes})}
        onEdgesChange={changes => dispatchGraphAction({type: 'rfEdgeChange', changes})}
        onConnect={ connection => dispatchGraphAction({ type: 'rfConnect', connection }) }
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
              const {top, left} = reactFlowRef.current.getBoundingClientRect();
              dispatchGraphAction({
                type: 'createNode',
                position: project({ x: event.clientX - left, y: event.clientY - top }),
              })
            }
          }
        }}
        deleteKeyCode={'Delete'}
        connectionMode={ConnectionMode.Loose}
        noDragClassName={'rf-no-drag'}
      >
        <MiniMap/>
        <Controls/>
        <input {...getDropzoneFileInputProps()}/>
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