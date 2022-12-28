import ReactFlow, {
  ConnectionMode,
  Controls,
  MiniMap,
  Node,
  ReactFlowProvider, useKeyPress,
  useReactFlow
} from 'react-flow-renderer';
import {
  MouseEvent as ReactMouseEvent, useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState
} from "react";
import {MarkdownData, MarkdownNode} from "./markdown/markdown-node/MarkdownNode";
import {MarkdownEditorModal} from "./markdown/markdown-editor/MarkdownEditorModal";
import {graphStateReduce, INITIAL_HANDLES} from "./graphState";
import {GraphStorage} from "./graphStorage";
import {CommandNodeData, CommandPromptNode, makeCommandNodeInteractionProps} from "./command-prompt/CommandPromptNode";
import {NodeTypes} from "react-flow-renderer/dist/esm/types";
import {OnNodeResize, PictureNode, PictureNodeProps} from "./picture/PictureNode";
import {DropEvent, FileRejection, useDropzone} from 'react-dropzone';
import {handleDropzoneFile} from "./dropzoneHandler";
import {sampleGraph} from "./sampleData";
import {CustomNodeProps} from "./customNodeProps";

interface MdNodeEditorState {
  node?: Node<MarkdownData>;
}

function InternalGraph({graphStorage}: GraphProps) {
  const reactFlowRef = useRef<HTMLDivElement>(null);
  const {project} = useReactFlow();

  const [graph, dispatchGraphAction] = useReducer(graphStateReduce, {
    ...sampleGraph,
    draggingEdgeNow: false,
    isLoaded: false,
    nodeCount: 0
  })

  useEffect(() => {
    graphStorage.get()
      .then(graph => {
        console.log("got from storage", graph);
        dispatchGraphAction({type: 'loadingSucceed', graph: graph});
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
        newData: {content: newContent, nodeHandles: mdEditor.node.data.nodeHandles},
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
      dispatchGraphAction({type: 'update', nodeId: id, newData: {preview: {width, height}}})
    };
    return PictureNode({...props, onResize})
  }

  const callPromptPressed = useKeyPress("/");
  useEffect(() => {
    if (!reactFlowRef.current || !callPromptPressed) return;
    const {height, width} = reactFlowRef.current.getBoundingClientRect();
    dispatchGraphAction({
      type: 'createNode',
      node: {
        type: 'commandPrompt',
        data: {command: ''},
        position: project({x: width / 2, y: height / 2}),
      },
      afterNewNode: (newId) => setActivePrompt(newId)
    })
  }, [project, reactFlowRef, callPromptPressed]);

  const [activePrompt, setActivePrompt] = useState<string | undefined>();

  const CommandPromptNodeInteractive = useCallback((props: CustomNodeProps<CommandNodeData>) => {
    const interactionProps = makeCommandNodeInteractionProps(
      props,
      activePrompt,
      setActivePrompt,
      (nodeId: string, updateFunc: (data: any) => any) => dispatchGraphAction({type: "updateCb", nodeId, updateFunc})
    )
    return CommandPromptNode({...props, ...interactionProps})
  }, [activePrompt, dispatchGraphAction])

  const nodeTypes: NodeTypes = useMemo(() => {
    return {
      markdown: MarkdownNode,
      commandPrompt: CommandPromptNodeInteractive,
      picture: PictureNodeResizable,
    }
  }, [CommandPromptNodeInteractive])

  return (
    <>
      <ReactFlow
        {...getDropzoneRootProps()}
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
              const {top, left} = reactFlowRef.current.getBoundingClientRect();
              dispatchGraphAction({
                type: 'createNode',
                node: {
                  type: 'markdown',
                  data: {content: '_double click me_', nodeHandles: INITIAL_HANDLES},
                  position: project({x: event.clientX - left, y: event.clientY - top})
                }
              })
            }
          }
        }}
        deleteKeyCode={'Delete'}
        connectionMode={ConnectionMode.Loose}
      >
        <MiniMap/>
        <Controls/>
        <input {...getDropzoneFileInputProps()}/>
      </ReactFlow>
      {
        mdEditor.node && <MarkdownEditorModal originalText={mdEditor.node?.data.content || ''}
                                              onSave={onSaveMarkdownEditor} onCancel={onCancelMarkdownEditor}
                                              isOpen={true}/>
      }
    </>
  );
}

export interface GraphProps {
  graphStorage: GraphStorage
}

export function Graph({graphStorage}: GraphProps) {
  return <ReactFlowProvider>
    <InternalGraph graphStorage={graphStorage}/>
  </ReactFlowProvider>
}