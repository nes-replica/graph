import {GraphStateAction, INITIAL_HANDLES, NodeDataTypeKeys, NodeDataTypeValues} from "./graphState";
import {XYPosition} from "react-flow-renderer";

export const graphEvents = {
  createNode(type: NodeDataTypeKeys, data: NodeDataTypeValues, position: XYPosition): GraphStateAction {
    return {
      type: 'createNode',
      node: {
        type: type,
        data: data,
        position: position
      }
    }
  },

  createMarkdownNode(position: XYPosition): GraphStateAction {
    return this.createNode('markdown', {content: '_double click me_', nodeHandles: INITIAL_HANDLES}, position)
  }
};