import {Node, Edge, getIncomers, getOutgoers} from "reactflow";
import {CreateNode, NodeDataTypeKeys, NodeDataTypeValues, UpdateNodeData} from "~/components/graph/graphState";
import {XYPosition} from "reactflow";
import {z, ZodType} from "zod";

function validateData(type: NodeDataTypeKeys, data: any): NodeDataTypeValues | undefined {
  const schema = NODE_DATA_SCHEMAS[type];
  const parsedResult = schema.safeParse(data);
  if (!parsedResult.success) {
    window.alert(`Node data is not valid: '${parsedResult.error}'`);
    console.error(parsedResult.error);
    return undefined;
  }

  return parsedResult.data
}

const NODE_DATA_SCHEMAS: Record<NodeDataTypeKeys, ZodType<NodeDataTypeValues>> = {
  'markdown': z.object({content: z.string()}),
  'picture': z.object({
    picture_url: z.string(),
    description: z.string().optional(),
    preview: z.object({
      width: z.number(),
      height: z.number()
    })
  }),
  'commandPrompt': z.object({command: z.string()}),
  'script': z.object({language: z.literal('javascript'), name: z.string(), script: z.string()}),
  'generic': z.object({content: z.any()})
}

const NODE_TYPE_SCHEMA: ZodType<NodeDataTypeKeys> =
  z.literal('markdown')
    .or(z.literal('picture'))
    .or(z.literal('commandPrompt'))
    .or(z.literal('script'))
    .or(z.literal('generic'));

const NODE_ID_SCHEMA = z.string();

const POSITION_SCHEMA = z.object({
  x: z.number(),
  y: z.number()
})

export interface GraphNode {
  id: string;
  update(data: any): void;
  connected(): GraphNodeConnection;
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
        const validatedData = validateData(node.type as NodeDataTypeKeys, data);
        if (validatedData) {
          dispatchAction({type: 'update', nodeId: node.id, newData: validatedData});
        }
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
    const validatedType = NODE_TYPE_SCHEMA.safeParse(type);
    if (!validatedType.success) {
      window.alert(`Node type: '${type}' is not valid.\nExpected: 'markdown', 'picture', 'commandPrompt', 'generic' or 'script'`);
      return;
    }
    const validatedData = validateData(validatedType.data, data);
    if (validatedData === undefined) {
      return;
    }
    const validatedPosition = POSITION_SCHEMA.safeParse(position);
    if (!validatedPosition.success) {
      window.alert(`Node position is not valid: '${validatedPosition.error}`);
      return;
    }

    dispatchAction({type: 'createNode', node: {type, data, position}});
  }

  const getNode = (id: string): GraphNode | undefined => {
    const validatedId = NODE_ID_SCHEMA.safeParse(id);
    if (!validatedId.success) {
      window.alert(`Node id: '${id}' is not valid. Should be a string`);
      return;
    }
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

