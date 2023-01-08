import {Node, Edge} from "reactflow";
import {NodeDataTypeValues} from "./graphState";

export interface Graph {
  nodes: Node<NodeDataTypeValues>[]
  edges: Edge[]
}

export interface GraphStorage {
  get(): Promise<Graph>

  save(graph: Graph): Promise<void>
}

export class BrowserGraphStorage {
  constructor(private defaultGraph: Graph = {nodes: [], edges: []},
              private localStorageKey: string = "GRAPH_STATE") {
  }

  get(): Promise<Graph> {
    return Promise.resolve(window.localStorage.getItem(this.localStorageKey))
      .then(jsonString => {
        if (jsonString === null) {
          return this.save(this.defaultGraph).then(() => this.defaultGraph);
        } else {
          const graph = JSON.parse(jsonString);
          if (Object.hasOwn(graph, "nodes") && Object.hasOwn(graph, "edges")) {
            return graph;
          } else {
            console.error("invalid localStorage state for GraphStorage", this.localStorageKey, graph)
            throw Error("invalid localStorage state for GraphStorage")
          }
        }
      })
  }

  save(graph: Graph): Promise<void> {
    return new Promise((resolve) => {
      window.localStorage.setItem(this.localStorageKey, JSON.stringify(graph))
      resolve();
    })
  }
}

