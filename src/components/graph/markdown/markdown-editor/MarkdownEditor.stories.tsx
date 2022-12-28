import React, {useState} from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';
import {MarkdownEditor} from "./MarkdownEditor";
import {MarkdownEditorModal} from "./MarkdownEditorModal";
import {Markdown} from "../Markdown";

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

export const ModalEditor: ComponentStory<typeof MarkdownEditor> = () => {
  return <MarkdownEditorModal originalText={'original _text_'} onSave={text => alert(text)} isOpen={true} />
}

export const EditableMarkdown: ComponentStory<typeof MarkdownEditor> = () => {
  const [text, setText] = useState('click _edit_ to edit this text');
  const [open, setOpen] = useState(false);
  return <>
    <Markdown content={text} />
    {
      open ?
        <MarkdownEditorModal
          originalText={text}
          onSave={newText => { setText(newText); setOpen(false) }}
          onCancel={() => setOpen(false)}
          isOpen={open} />
        : <button onClick={() => setOpen(true)}>EDIT</button>
    }
  </>;
}
