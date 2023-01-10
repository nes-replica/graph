import React, {useState} from 'react';

import {ComponentStory, ComponentMeta} from '@storybook/react';

import {ReactFlowProvider} from 'reactflow';
import {ChartNode} from "./ChartNode";


export default {
  title: 'Chart / Node',
  component: ChartNode,
  decorators: [
    (Story) => (
      <div style={{position: 'absolute'}}>
        <ReactFlowProvider>
          <Story/>
        </ReactFlowProvider>
      </div>
    ),
  ],
} as ComponentMeta<typeof ChartNode>;


export const Static: ComponentStory<typeof ChartNode> = () => {
  const data: { x: number, y: number }[] = [];
  for (let x = 0; x < 30; x+=0.1) {
    data.push({x, y: Math.sin(x)})
  }
  return <ChartNode data={{data: data}}></ChartNode>
}
