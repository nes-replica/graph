import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';

import {MarkdownNode} from "./MarkdownNode";
import { ReactFlowProvider } from 'react-flow-renderer';
import {INITIAL_HANDLES} from '../../graphState';

export default {
  /* 👇 The title prop is optional.
  * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
  * to learn how to generate automatic titles
  */
  title: 'Markdown Node',
  component: MarkdownNode,
  decorators: [
    (Story) => (
      <div style={{ position: 'absolute' }}>

        <ReactFlowProvider>
          <Story />
        </ReactFlowProvider>
      </div>
    ),
  ],
} as ComponentMeta<typeof MarkdownNode>;


export const ShortText: ComponentStory<typeof MarkdownNode> = () => {
  let content = `
[PPU](https://google.com/?q=ppu)
`;
  return <MarkdownNode id='1' data={ { content: content, nodeHandles: INITIAL_HANDLES } }></MarkdownNode>;
}


export const BigText: ComponentStory<typeof MarkdownNode> = () => {
  let content = `
PPU
===

PPU (Picture-processing unit) responds for rendering video signal
`;
  return <MarkdownNode id='1' data={ { content: content, nodeHandles: INITIAL_HANDLES } }></MarkdownNode>;
}
