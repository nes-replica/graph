import React, {useState} from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';
import {MarkdownEditor} from "./MarkdownEditor";

export default {
  title: 'Markdown Editor',
  component: MarkdownEditor,
  decorators: [
    (Story) => (
      <div style={{ height: '95vh' }}>
        <Story />
      </div>
    ),
  ],
} as ComponentMeta<typeof MarkdownEditor>;


export const Empty: ComponentStory<typeof MarkdownEditor> = () => {
  const [value, onChange] = useState('');
  return <MarkdownEditor value={value} onChange={onChange}></MarkdownEditor>;
}

export const ALotOfText: ComponentStory<typeof MarkdownEditor> = () => {
  const [value, onChange] = useState("test overflow\n===\n\n".repeat(150));
  return <MarkdownEditor value={value} onChange={onChange}></MarkdownEditor>;
}
