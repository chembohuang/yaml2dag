// Example YAML configurations
export const EXAMPLE_YAML = `# Main DAG configuration
dag_id: "main_dag"
nodes:
  - node_id: "C"

  - node_id: "E"
    true_node: "F"
    false_node: "G"
    deps: ["C"]

  - node_id: "F"
    true_node: "J"
    false_node: "K"
    deps: ["E"]

  - node_id: "G"
    deps: ["E"]

  - node_id: "J"
    deps: ["F"]

  - node_id: "K"
    sub_dag: "sub_dag"
    deps: ["F"]

  - node_id: "H"
    deps: ["J", "K", "G"]

---
# Sub DAG configuration
dag_id: "sub_dag"
nodes:
  - node_id: "X"
    true_node: "Y"
    false_node: "Z"

  - node_id: "Y"
    deps: ["X"]

  - node_id: "Z"
    deps: ["X"]
`;

export const SIMPLE_EXAMPLE = `dag_id: "simple_dag"
nodes:
  - node_id: "A"

  - node_id: "B"
    deps: ["A"]

  - node_id: "C"
    deps: ["B"]
`;

export const CONDITIONAL_EXAMPLE = `dag_id: "conditional_dag"
nodes:
  - node_id: "Start"

  - node_id: "Check"
    true_node: "Process"
    false_node: "HandleError"
    deps: ["Start"]

  - node_id: "Process"
    deps: ["Check"]

  - node_id: "HandleError"
    deps: ["Check"]

  - node_id: "End"
    deps: ["Process", "HandleError"]
`;
