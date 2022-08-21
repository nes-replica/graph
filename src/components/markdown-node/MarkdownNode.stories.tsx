import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';

import {MarkdownNode} from "./MarkdownNode";

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
        <Story />
      </div>
    ),
  ],
} as ComponentMeta<typeof MarkdownNode>;


export const ShortText: ComponentStory<typeof MarkdownNode> = () => {
  let content = `
[PPU](https://google.com/?q=ppu)
`;
  return <MarkdownNode data={{content: content}}></MarkdownNode>;
}


export const BigText: ComponentStory<typeof MarkdownNode> = () => {
  let content = `
PPU
===

PPU (Picture-processing unit) responds for rendering video signal
`;
  return <MarkdownNode data={{content: content}}></MarkdownNode>;
}
