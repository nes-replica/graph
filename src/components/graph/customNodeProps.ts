import {NodeProps} from "reactflow";

export type CustomNodeProps<T> = Pick<NodeProps<T>, 'data' | 'id'>