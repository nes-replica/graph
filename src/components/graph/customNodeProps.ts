import {NodeProps} from "react-flow-renderer/dist/esm/types/nodes";

export type CustomNodeProps<T> = Pick<NodeProps<T>, 'data' | 'id'>