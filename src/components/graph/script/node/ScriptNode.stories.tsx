import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';

import { ReactFlowProvider } from 'react-flow-renderer';
import {ScriptData, ScriptNode} from "./ScriptNode";

export default {
  /* 👇 The title prop is optional.
  * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
  * to learn how to generate automatic titles
  */
  title: 'Script / Node',
  component: ScriptNode,
  decorators: [
    (Story) => (
      <div style={{ position: 'absolute' }}>

        <ReactFlowProvider>
          <Story />
        </ReactFlowProvider>
      </div>
    ),
  ],
} as ComponentMeta<typeof ScriptNode>;


export const Simple: ComponentStory<typeof ScriptNode> = () => {
  const scriptData: ScriptData = {
    language: 'javascript',
    name: 'alert test',
    script: 'alert("test")',
  }
  return <ScriptNode id='1' data={ scriptData }></ScriptNode>;
}
export const RecentlyRun: ComponentStory<typeof ScriptNode> = () => {
  const scriptData: ScriptData = {
    language: 'javascript',
    name: 'alert test',
    script: 'alert("test")',
    lastRunMillis: Date.now(),
  }
  return <ScriptNode id='1' data={ scriptData }></ScriptNode>;
}

