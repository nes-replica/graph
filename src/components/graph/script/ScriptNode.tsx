import {CustomNodeProps} from "../customNodeProps";
import {useCallback} from "react";

export interface ScriptData {
  language: 'javascript';
  name: string;
  script: string;
  lastRunMillis?: number; // unix timestamp
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

  return <div>
    {name}
    {(lastRunMillis ? (
      <button onClick={executeScript}>RUN</button>
    ) : (
      <>
        <button onClick={executeScript}>RERUN</button>
        <br />
        Last run: {lastRun}
      </>
    ))}
  </div>
}