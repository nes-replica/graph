import {CustomNodeProps} from "../../customNodeProps";
import {RefObject, useCallback} from "react";
import "./node.css";
import {GraphApi, ReflectionApi} from "../../../reflectionApi/ReflectionApi";

export interface ScriptData {
  language: 'javascript';
  name: string;
  script: string;
  lastRunMillis?: number; // unix timestamp
}

export interface ScriptNodeReflectionProps {
  reflectionApi?: RefObject<ReflectionApi>;
  graphApi?: RefObject<GraphApi>;
}

export type ScriptNodeProps = CustomNodeProps<ScriptData> & ScriptNodeReflectionProps

export const ScriptContextLibSource = `
  declare interface MarkdownData {
    content: string;
  }
  
  declare interface PictureData {
    picture_url: string;
    description?: string;
    preview: {
      width: number,
      height: number
    };
  }
  
  declare interface CommandNodeData {
    command: string;
  }
  
  declare interface ScriptData {
    language: 'javascript';
    name: string;
    script: string;
    lastRunMillis?: number; // unix timestamp
  }

  declare interface GraphNode {
    id: string;
    update(data: any): void;
    connected(id: string): GraphNodeConnection;
    data(): any;
    send(connection: string, data: any): void
  }
  
  declare interface XYPosition {
    x: number;
    y: number;
  }
  
  declare interface GraphNodeConnection {
    incomers: GraphNode[];
    outgoers: GraphNode[];
  }

  declare interface GraphApi {
    get(id: string): GraphNode | undefined
    create(type: NodeDataTypeKeys, data: NodeDataTypeValues, position: XYPosition): void
  }
  
  declare type NodeDataTypeKeys = 'markdown' | 'picture' | 'commandPrompt' | 'script'

  declare type NodeDataTypeValues = MarkdownData | PictureData | CommandNodeData | ScriptData
  
  declare const graph: GraphApi;
  declare const current: GraphNode;
  
  declare interface Node {
    id: string;
    data: any;
    type: string;
    position: { x: number; y: number; };
  };
  declare interface Edge {
    id: string;
    source: string;
    target: string;
    data: any;
  };
  declare interface NodeTraversal {
    node: Node;
    edges(): EdgeTraversal[];
  };
  declare interface EdgeTraversal {
    edge: Edge;
    direction: "in" | "out";
    node: NodeTraversal;
  };
  /** current node (script node) */
  declare const node: Node;
  /** edges from current node */
  declare const edges: EdgeTraversal[];
`

//@ts-ignore
function ignore(...any: any[]) {
  return;
}

export function ScriptNode({
                             id,
                             data: {name, language, script, lastRunMillis},
                             reflectionApi,
                             graphApi
                           }: ScriptNodeProps) {

  const lastRun = lastRunMillis ? new Date(lastRunMillis).toLocaleString() : 'never';

  const executeScript = useCallback(() => {
    switch (language) {
      case 'javascript':
        const nodeTraversal = reflectionApi?.current?.getNode(id);
        const node = nodeTraversal?.node;
        const edges = nodeTraversal?.edges();
        const graph = graphApi?.current;
        const current = graph?.get(id);
        ignore(node, edges, graph, current);
        eval(script);
    }
  }, [id, reflectionApi, language, script, graphApi]);

  return <div className={'script-node'}>
    <div className={"header-row"}>
      <div className={"name"}>{name}</div>
      <div className={"actions"}>
        <button onClick={executeScript}
                onDoubleClick={(e) => e.stopPropagation()}
                >{lastRunMillis ? 'reRUN' : 'RUN'}</button>
      </div>
    </div>
    {lastRunMillis && <div className={"last-run"}>Last run: {lastRun}</div>}
  </div>
}