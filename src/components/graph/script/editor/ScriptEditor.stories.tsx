import React, {useState} from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';
import {ScriptEditor} from "./ScriptEditor";
import {ScriptEditorModal} from "./ScriptEditorModal";
import {ScriptData} from "../node/ScriptNode";

export default {
  title: 'Script / Editor',
  component: ScriptEditor,
  decorators: [
    (Story) => (
      <div style={{ height: '95vh' }}>
        <Story />
      </div>
    ),
  ],
} as ComponentMeta<typeof ScriptEditor>;


export const Empty: ComponentStory<typeof ScriptEditor> = () => {
  const [value, onChange] = useState('');
  return <ScriptEditor value={value} onChange={onChange}></ScriptEditor>;
}

function generateNBottlesJavascript(n: number) {
  let code = '';
  for (let i = n; i > 0; i--) {
    code += `console.log("${i} bottles of beer on the wall, ${i} bottles of beer.");\n`;
  }
  return code;
}

export const ALotOfText: ComponentStory<typeof ScriptEditor> = () => {
  const [value, onChange] = useState(generateNBottlesJavascript(200));
  return <ScriptEditor value={value} onChange={onChange}></ScriptEditor>;
}

export const ModalEditor: ComponentStory<typeof ScriptEditor> = () => {
  return <ScriptEditorModal scriptData={{
    language: 'javascript',
    name: 'log test', script: 'console.log("test")',
  }} onSave={newData => alert(newData)} isOpen={true} />
}

export const EditableScript: ComponentStory<typeof ScriptEditor> = () => {
  const [scriptData, setScriptData] = useState<ScriptData>({
    language: 'javascript',
    name: 'example', script: 'console.log("example")',
  });
  const [open, setOpen] = useState(false);
  return <>
    <p>
      Script name: <code>{scriptData.name}</code>
    </p>
    <code>{scriptData.script}</code>
    <br />
    {
      open ?
        <ScriptEditorModal
          scriptData={scriptData}
          onSave={newData => { setScriptData(newData); setOpen(false) }}
          onCancel={() => setOpen(false)}
          isOpen={true} />
        : <button onClick={() => setOpen(true)}>EDIT</button>
    }
  </>;
}
