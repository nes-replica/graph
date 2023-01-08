import React, {useState} from 'react';

import {ComponentStory, ComponentMeta} from '@storybook/react';

import {ReactFlowProvider} from 'reactflow';
import {PictureNode} from "./PictureNode";

// import testImage from "../../../public/test.jpg";

export default {
  /* 👇 The title prop is optional.
  * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
  * to learn how to generate automatic titles
  */
  title: 'Picture Node',
  component: PictureNode,
  decorators: [
    (Story) => (
      <div style={{position: 'absolute'}}>
        <ReactFlowProvider>
          <Story/>
        </ReactFlowProvider>
      </div>
    ),
  ],
} as ComponentMeta<typeof PictureNode>;


export const Static: ComponentStory<typeof PictureNode> = () => {
  return <PictureNode id={"staticNode"} data={{picture_url: './test.jpg', preview: {height: 203, width: 317}}}></PictureNode>;
}

export const Resizable: ComponentStory<typeof PictureNode> = () => {
  const [width, setWidth] = useState(317);
  const [height, setHeight] = useState(203);

  return <PictureNode
    id={"resizableNode"}
    onResize={(id: string, width: number, height: number) => {
      setHeight(height);
      setWidth(width);
    }}
    data={{
      picture_url: './test.jpg',
      preview: {height: height, width: width}
    }}></PictureNode>;
}

