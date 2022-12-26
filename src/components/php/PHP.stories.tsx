import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';

import { ReactFlowProvider } from 'react-flow-renderer';
import {PhpComponent} from "./php";

export default {
  /* 👇 The title prop is optional.
  * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
  * to learn how to generate automatic titles
  */
  title: 'PHP executor',
  component: PhpComponent,
  decorators: [
    (Story) => (
      <div style={{ position: 'absolute' }}>

        <ReactFlowProvider>
          <Story />
        </ReactFlowProvider>
      </div>
    ),
  ],
} as ComponentMeta<typeof PhpComponent>;


export const Test: ComponentStory<typeof PhpComponent> = () => {
  return <PhpComponent></PhpComponent>;
}
