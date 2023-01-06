import {CustomNodeProps} from "../../customNodeProps";
import {useCallback} from "react";
import "./node.css";
import {NodeHandle} from "../../graphState";

export interface ScriptData {
  language: 'javascript';
  name: string;
  script: string;
  lastRunMillis?: number; // unix timestamp
  nodeHandles?: NodeHandle[];
}

export type ScriptNodeProps = CustomNodeProps<ScriptData>

export function ScriptNode({
                              data: {name, language, script, lastRunMillis},
                           }: ScriptNodeProps) {

  const lastRun = lastRunMillis ? new Date(lastRunMillis).toLocaleString() : 'never';

  const executeScript = useCallback(() => {
    switch (language) {
    case 'javascript':
      const result = eval(script);
    }
  }, [language, script]);

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