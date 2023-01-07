import {Node, Edge, getIncomers, getOutgoers} from "react-flow-renderer";
import {CreateNode, NodeDataTypeKeys, NodeDataTypeValues, UpdateNodeData} from "~/components/graph/graphState";
import {XYPosition} from "react-flow-renderer";

export interface GraphNode {
  id: string;
  update(data: any): void;
  connected(id: string): GraphNodeConnection;
  data(): any;
  send(connection: string, data: any): void
}

export interface GraphNodeConnection {
  incomers: GraphNode[];
  outgoers: GraphNode[];
}

export interface GraphApi {
  get(id: string): GraphNode | undefined;
  create(type: NodeDataTypeKeys, data: NodeDataTypeValues, position: XYPosition): void;
}

export function buildGraphApi(
  dispatchAction: (action: UpdateNodeData | CreateNode) => void,
  nodes: Node[],
  edges: Edge[]
): GraphApi {
  const createGraphNode = (node: Node): GraphNode => {
    return {
      id: node.id,
      update: (data: any) => {
        dispatchAction({type: 'update', nodeId: node.id, newData: data});
      },
      connected(): GraphNodeConnection {
        const incomers = getIncomers(node, nodes, edges).map(n => createGraphNode(n));
        const outgoers = getOutgoers(node, nodes, edges).map(n => createGraphNode(n));
        return {
          incomers: incomers,
          outgoers: outgoers,
        }
      },
      data(): any {
        return node.data;
      },
      send(connection: string, data: any): void {
        for (const edge of edges) {
          if (edge.label === connection && edge.source === node.id) {
            getNode(edge.target)?.update(data)
          }
        }
      }
    }
  }

  const createNode = (type: NodeDataTypeKeys,
                      data: NodeDataTypeValues,
                      position: XYPosition) => {
    dispatchAction({type: 'createNode', node: {type, data, position}});
  }

  const getNode = (id: string): GraphNode | undefined => {
    for (const node of nodes) {
      if (node.id === id) {
        return createGraphNode(node);
      }
    }
  }

  return {create: createNode, get: getNode};
}

export interface ReflectionApi {
  getNode(id: string): NodeTraversal;
}

export interface NodeTraversal {
  node: Node;

  edges(): EdgeTraversal[];
}

type EdgeDirection = "in" | "out";

export interface EdgeTraversal {
  edge: Edge;
  direction: EdgeDirection;
  node: NodeTraversal;
}

export function buildReflectionApi(nodes: Node[], edges: Edge[]): ReflectionApi {
  const nodeMap = new Map<string, NodeTraversal>();
  for (const node of nodes) {
    nodeMap.set(node.id, {
      node,
      edges: () => {
        return edges
          .filter((e) => e.source === node.id || e.target === node.id)
          .map((e) => {
            const [targetId, direction] = e.source === node.id ? [e.target, "out"] : [e.source, "in"];
            return {
              edge: e,
              direction: direction as EdgeDirection,
              node: nodeMap.get(targetId)!,
            };
          });
      },
    });
  }

  return {
    getNode(id: string) {
      return nodeMap.get(id)!;
    },
  };
}

