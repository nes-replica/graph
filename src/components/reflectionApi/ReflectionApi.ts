import {Node, Edge} from "react-flow-renderer";

export interface ReflectionApi {
  getNode(id: string): NodeTraversal;
}

export interface NodeTraversal {
  node: Node;
  edges(): EdgeTraversal[];
}

export interface EdgeTraversal {
  edge: Edge;
  direction: "in" | "out";
  node: NodeTraversal;
}

export function buildReflectionApi(nodes: Node[], edges: Edge[]): ReflectionApi {
  const nodeMap = new Map<string, NodeTraversal>();
  for (const node of nodes) {
    nodeMap.set(node.id, {
      node,
      edges: () => {
        const nodeEdges = edges.filter((e) => e.source === node.id || e.target === node.id);
        return nodeEdges.map((e) => {
          const target = e.source === node.id ? e.target : e.source;
          return {
            edge: e,
            direction: e.source === node.id ? "out" : "in",
            node: nodeMap.get(target)!,
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

