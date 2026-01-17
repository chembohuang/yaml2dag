// DAG node type definitions
export interface DagNode {
  node_id: string;
  deps?: string[];
  // Conditional node (has true_node/false_node)
  true_node?: string;
  false_node?: string;
  // Sub DAG reference
  sub_dag?: string;
}

export interface DagConfig {
  dag_id: string;
  desc?: string;
  thread_pool?: string;
  nodes: DagNode[];
}

export interface ParsedDags {
  mainDag?: DagConfig;
  subDags: Map<string, DagConfig>;
}
