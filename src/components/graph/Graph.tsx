import ReactFlow, {
  ConnectionMode,
  Controls, EdgeProps, EdgeTypes,
  MiniMap,
  Node, NodeTypes,
  ReactFlowProvider, useKeyPress,
  useReactFlow
} from 'reactflow';
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
import {graphStateReduce} from "./graphState";
import {GraphStorage} from "./graphStorage";
import {CommandNodeData, CommandPromptNode, makeCommandNodeInteractionProps} from "./command-prompt/CommandPromptNode";
import {OnNodeResize, PictureNode, PictureNodeProps} from "./picture/PictureNode";
import {DropEvent, FileRejection, useDropzone} from 'react-dropzone';
import {handleDropzoneFile} from "./dropzoneHandler";
import {sampleGraph} from "./sampleData";
import {CustomNodeProps} from "./customNodeProps";
import {ScriptData, ScriptNode} from "./script/node/ScriptNode";
import './Graph.css';
import {graphEvents} from "./graphEvents";
import {ScriptEditorModal} from "./script/editor/ScriptEditorModal";
import {MakeConnectable} from "./connectable-trait/connectable";
import {buildGraphApi, buildReflectionApi, GraphApi, ReflectionApi} from "../reflectionApi/ReflectionApi";
import {GenericData, GenericNode} from "./generic/GenericNode";
import {GenericEditorModal} from "./generic/GenericNodeModal";
import 'reactflow/dist/style.css';
import {EditableEdge} from "./editable-edge/EditableEdge";
import {ChartNode} from "./chart/ChartNode";

interface MdNodeEditorState {
  node?: Node<MarkdownData>;
}

interface ScriptNodeEditorState {
  node?: Node<ScriptData>;
}

interface GenericNodeEditorState {
  node?: Node<GenericData>;
}

interface ContextMenuState {
  x: number;
  y: number;
}

function InternalGraph({graphStorage}: GraphProps) {
  const reactFlowRef = useRef<HTMLDivElement>(null);
  const {project} = useReactFlow();

  const [graph, dispatchGraphAction] = useReducer(graphStateReduce, {
    ...sampleGraph,
    draggingEdgeNow: false,
    isLoaded: false,
    nodeCount: sampleGraph.nodes.length
  });

  const reflectionApi = useRef<ReflectionApi>(buildReflectionApi([], []));
  // update reflectionApi ref when graph changes
  useEffect(() => {
    reflectionApi.current = buildReflectionApi(graph.nodes, graph.edges);
  }, [graph.nodes, graph.edges]);

  const graphApi = useRef<GraphApi>(buildGraphApi(dispatchGraphAction, [], []));
  // update graphApi ref when graph changes
  useEffect(() => {
    graphApi.current = buildGraphApi(dispatchGraphAction, graph.nodes, graph.edges);
  }, [graph.nodes, graph.edges]);

  const [contextMenuState, setContextMenuState] = useState<ContextMenuState | undefined>();

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
      }, console.error);
    }
  }, [graph, graphStorage]);


  const [mdEditor, setMdEditor] = useState<MdNodeEditorState>({});
  const [scriptEditor, setScriptEditor] = useState<ScriptNodeEditorState>({});
  const [genericEditor, setGenericEditor] = useState<GenericNodeEditorState>({});

  function onNodeDoubleClick(event: ReactMouseEvent, node: Node) {
    switch (node.type) {
      case 'markdown': setMdEditor({node: node}); break;
      case 'script': setScriptEditor({node: node}); break;
      case 'generic': setGenericEditor({node: node}); break;
    }
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

  function onSaveScriptEditor(newScriptData: ScriptData) {
    if (scriptEditor.node) {
      dispatchGraphAction({
        type: 'update',
        newData: newScriptData,
        nodeId: scriptEditor.node?.id
      })
      setScriptEditor({});
    } else {
      console.warn("WARN impossible state: onSaveScriptEditor called without node set")
    }
  }

  function onCancelScriptEditor() {
    setScriptEditor({});
  }

  function onSaveGenericEditor(newGenericData: GenericData) {
    if (genericEditor.node) {
      dispatchGraphAction({
        type: 'update',
        newData: newGenericData,
        nodeId: genericEditor.node?.id
      })
      setGenericEditor({});
    } else {
      console.warn("WARN impossible state: onSaveGenericEditor called without node set")
    }
  }

  function onCancelGenericEditor() {
    setGenericEditor({});
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

  const ScriptNodeReflecting = useCallback((props: CustomNodeProps<ScriptData>) => {
    return ScriptNode({...props, reflectionApi, graphApi})
  }, [])

  const nodeTypes: NodeTypes = useMemo(() => {
    return {
      markdown: MakeConnectable(MarkdownNode),
      commandPrompt: MakeConnectable(CommandPromptNodeInteractive),
      picture: MakeConnectable(PictureNodeResizable),
      script: MakeConnectable(ScriptNodeReflecting),
      generic: MakeConnectable(GenericNode),
      chart: MakeConnectable(ChartNode),
    }
  }, [CommandPromptNodeInteractive, ScriptNodeReflecting])

  const [edgeEdited, setEdgeEdited] = useState<string | undefined>();

  const EditableEdgeInteractive = useCallback((props: EdgeProps) => {
    const onLabelUpdate = (id: string, newLabel: string) => {
      dispatchGraphAction(graphEvents.updateEdgeLabel(props.id, newLabel));
      setEdgeEdited(undefined);
    }
    const onLabelStartEditing = () => {
      setEdgeEdited(props.id);
    }
    const inEditMode = props.id === edgeEdited;
    return EditableEdge({...props, onLabelStartEditing, onLabelUpdate, inEditMode})
  }, [edgeEdited, dispatchGraphAction]);

  const edgeTypes: EdgeTypes = useMemo(() => {
    return {
      default: EditableEdgeInteractive,
      'smoothstep': EditableEdgeInteractive,
    }
  }, [EditableEdgeInteractive]);

  const contextMenuItems = useMemo(() => ({
    'Markdown node': () => {
      if (!contextMenuState) return;
      dispatchGraphAction(graphEvents.createMarkdownNode(project({x: contextMenuState.x, y: contextMenuState.y})));
    },
    'Script node': () => {
      if (!contextMenuState) return;
      dispatchGraphAction(graphEvents.createNode('script', {
        language: 'javascript',
        name: 'untitled script',
        script: '',
      }, project({x: contextMenuState.x, y: contextMenuState.y})));
    },
    'Generic node': () => {
      if (!contextMenuState) return;
      dispatchGraphAction(graphEvents.createGenericNode(project({x: contextMenuState.x, y: contextMenuState.y})));
    },
    'Chart node': () => {
      if (!contextMenuState) return;
      dispatchGraphAction(graphEvents.createChartNode(project({x: contextMenuState.x, y: contextMenuState.y})));
    }
  }), [project, contextMenuState])

  const cancelInteractions = useCallback(() => {
    setEdgeEdited(undefined);
    setContextMenuState(undefined);
  }, []);

  return (
    <>
      <ReactFlow
        {...getDropzoneRootProps()}
        ref={reactFlowRef}
        nodes={graph.nodes} edges={graph.edges}
        onNodesChange={changes => dispatchGraphAction({type: 'rfNodeChange', changes})}
        onEdgesChange={changes => dispatchGraphAction({type: 'rfEdgeChange', changes})}
        onConnect={connection => dispatchGraphAction({type: 'rfConnect', connection})}
        onEdgeUpdateStart={() => dispatchGraphAction({type: 'rfEdgeUpdateStart'})}
        onEdgeUpdate={(oldEdge, newConnection) => dispatchGraphAction({type: 'rfEdgeUpdate', oldEdge, newConnection})}
        onEdgeUpdateEnd={(_, edge) => dispatchGraphAction({type: 'rfEdgeUpdateEnd', edge})}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView={true}
        onNodeDoubleClick={onNodeDoubleClick}
        onClick={() => cancelInteractions()}
        onDoubleClickCapture={() => cancelInteractions()}
        onContextMenu={event => {
          if (reactFlowRef.current && event.target instanceof Element) {
            const targetIsPane = event.target.classList.contains('react-flow__pane');
            if (targetIsPane) {
              setContextMenuState({x: event.clientX, y: event.clientY})
            }
          }
          event.preventDefault();
        }}
        deleteKeyCode={'Delete'}
        connectionMode={ConnectionMode.Loose}
      >
        {contextMenuState && (
          <div className={'context-menu'} style={{
            position: 'absolute',
            top: contextMenuState.y,
            left: contextMenuState.x,
          }}>
            {Object.entries(contextMenuItems).map(([label, onClick]) => (
              <div className={'item'} key={label} onClick={onClick}>
                {label}
              </div>
            ))}
          </div>
        )}
        <MiniMap/>
        <Controls/>
        <input {...getDropzoneFileInputProps()}/>
      </ReactFlow>
      {
        mdEditor.node && <MarkdownEditorModal originalText={mdEditor.node?.data.content || ''}
                                              onSave={onSaveMarkdownEditor} onCancel={onCancelMarkdownEditor}
                                              isOpen={true}/>
      }
      {
        scriptEditor.node && <ScriptEditorModal scriptData={scriptEditor.node.data}
                                                onSave={onSaveScriptEditor} onCancel={onCancelScriptEditor}
                                                isOpen={true}/>
      }
      {
        genericEditor.node && <GenericEditorModal genericData={genericEditor.node.data}
                                                onSave={onSaveGenericEditor} onCancel={onCancelGenericEditor}
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