import {ComponentMeta, ComponentStory} from "@storybook/react";
import React, {useCallback, useState} from "react";
import {CommandPromptNode} from "./CommandPromptNode";

export default {
  title: 'Command prompt',
  component: CommandPromptNode,
  decorators: [
    (Story) => (
      <div style={{ height: '95vh' }}>
        <Story />
      </div>
    ),
  ],
} as ComponentMeta<typeof CommandPromptNode>;


export const New: ComponentStory<typeof CommandPromptNode> = () => {
  const [command, setCommand] = useState('');
  const [editMode, setEditMode] = useState(true);
  const [executionLog, setExecutionLog] = useState<string[]>([]);

  const runCommand = useCallback((command: string) => {
    const instanceId = Math.random().toString();
    setExecutionLog((prev) => [command, ...prev]);
  }, [setExecutionLog]);

  const saveCommand = useCallback((newValue: string) => {
      setCommand(newValue);
      setEditMode(false);
  }, [setCommand])

  return <>
    <p>Current command:</p>
    <pre>{command}</pre>

    <CommandPromptNode id='1'
                       data={{command: command}}
                       editMode={editMode}
                       onRequestToEdit={() => setEditMode(true)}
                       onCancel={() => setEditMode(false)}
                       onUpdate={(newValue) => saveCommand(newValue)}
                       onReload={() => runCommand(command)}
    ></CommandPromptNode>

    <h3>Execution log</h3>
    <ol>
      {executionLog.map((item, i) => {
        return <li key={i}>{item}</li>
      })}
    </ol>
  </>;
}