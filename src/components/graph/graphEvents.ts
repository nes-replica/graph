import {GraphStateAction, NodeDataTypeKeys, NodeDataTypeValues} from "./graphState";
import {XYPosition} from "reactflow";

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
    return this.createNode('markdown', {content: '_double click me_'}, position)
  },

  createGenericNode(position: XYPosition): GraphStateAction {
    return this.createNode('generic', {}, position)
  },
};