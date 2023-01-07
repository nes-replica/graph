import {CustomNodeProps} from "../../customNodeProps";
import {Ref, RefObject, useCallback} from "react";
import "./node.css";
import {NodeHandle} from "../../graphState";
import {ReflectionApi} from "../../../reflectionApi/ReflectionApi";

export interface ScriptData {
  language: 'javascript';
  name: string;
  script: string;
  lastRunMillis?: number; // unix timestamp
  nodeHandles?: NodeHandle[];
}

export interface ScriptNodeReflectionProps {
  reflectionApi?: RefObject<ReflectionApi>;
}
export type ScriptNodeProps = CustomNodeProps<ScriptData> & ScriptNodeReflectionProps

export const ScriptContextLibSource = `
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

export function ScriptNode({
                              id,
                              data: {name, language, script, lastRunMillis},
                              reflectionApi,
                           }: ScriptNodeProps) {

  const lastRun = lastRunMillis ? new Date(lastRunMillis).toLocaleString() : 'never';

  const executeScript = useCallback(() => {
    switch (language) {
    case 'javascript':
      const nodeTraversal = reflectionApi?.current?.getNode(id);
      const node = nodeTraversal?.node;
      const edges = nodeTraversal?.edges();
      eval(script);
    }
  }, [id, reflectionApi, language, script]);

  return <div className={'script-node'}>
    <div className={"header-row"}>
      <div className={"name"}>{name}</div>
      <div className={"actions"}>
        <button onClick={executeScript}>{lastRunMillis ? 'reRUN' : 'RUN'}</button>
      </div>
    </div>
    {lastRunMillis && <div className={"last-run"}>Last run: {lastRun}</div>}
  </div>
}