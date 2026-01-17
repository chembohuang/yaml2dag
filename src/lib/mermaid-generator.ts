import type { DagConfig, DagNode, ParsedDags } from './types';

interface MermaidGeneratorOptions {
  direction?: 'TB' | 'BT' | 'LR' | 'RL';
  theme?: 'default' | 'forest' | 'dark' | 'neutral';
}

/**
 * Generate Mermaid graph syntax
 */
export function generateMermaidSyntax(
  parsedDags: ParsedDags,
  options: MermaidGeneratorOptions = {}
): string {
  const { direction = 'TB' } = options;
  const lines: string[] = [];

  lines.push(`flowchart ${direction}`);
  lines.push('');

  // Define styles
  lines.push('  %% Styles');
  lines.push('  classDef operatorNode fill:#d4d4f7,stroke:#7c7cba,stroke-width:2px,color:#333');
  lines.push('  classDef conditionalNode fill:#d4d4f7,stroke:#7c7cba,stroke-width:2px,color:#333');
  lines.push('  classDef subgraphStyle fill:#ffffcc,stroke:#999,stroke-width:1px');
  lines.push('');

  // Generate main DAG
  if (parsedDags.mainDag) {
    const mainLines = generateDagNodes(parsedDags.mainDag, parsedDags.subDags, '  ');
    lines.push(...mainLines);
  }

  // If no main DAG, render the first sub DAG
  if (!parsedDags.mainDag && parsedDags.subDags.size > 0) {
    const firstSubDag = parsedDags.subDags.values().next().value;
    if (firstSubDag) {
      const subLines = generateDagNodes(firstSubDag, parsedDags.subDags, '  ');
      lines.push(...subLines);
    }
  }

  return lines.join('\n');
}

/**
 * Generate nodes for a single DAG
 */
function generateDagNodes(
  dag: DagConfig,
  subDags: Map<string, DagConfig>,
  indent: string = ''
): string[] {
  const lines: string[] = [];
  const processedEdges = new Set<string>();

  // First pass: define all nodes
  dag.nodes.forEach((node) => {
    const nodeDef = generateNodeDefinition(node, indent);
    lines.push(nodeDef);
  });

  lines.push('');

  // Second pass: generate edges (connections)
  dag.nodes.forEach((node) => {
    const edges = generateNodeEdges(node, dag.nodes, subDags, indent, processedEdges);
    lines.push(...edges);
  });

  // Add class definitions
  lines.push('');
  dag.nodes.forEach((node) => {
    if (isConditionalNode(node)) {
      lines.push(`${indent}class ${node.node_id} conditionalNode`);
    } else if (!node.sub_dag) {
      lines.push(`${indent}class ${node.node_id} operatorNode`);
    }
  });

  return lines;
}

/**
 * Check if node is conditional (has true_node or false_node)
 */
function isConditionalNode(node: DagNode): boolean {
  return !!(node.true_node || node.false_node);
}

/**
 * Generate node definition
 */
function generateNodeDefinition(node: DagNode, indent: string): string {
  const nodeId = node.node_id;

  if (isConditionalNode(node)) {
    // Conditional node uses diamond shape
    return `${indent}${nodeId}{{"${nodeId}"}}`;
  } else {
    // Regular node uses rounded rectangle
    return `${indent}${nodeId}["${nodeId}"]`;
  }
}

/**
 * Generate edges for a node
 */
function generateNodeEdges(
  node: DagNode,
  allNodes: DagNode[],
  subDags: Map<string, DagConfig>,
  indent: string,
  processedEdges: Set<string>
): string[] {
  const lines: string[] = [];

  // Handle conditional node true/false branches
  if (isConditionalNode(node)) {
    if (node.true_node) {
      const edgeKey = `${node.node_id}->${node.true_node}`;
      if (!processedEdges.has(edgeKey)) {
        // Check if true_node is a sub_dag
        const targetNode = allNodes.find(n => n.node_id === node.true_node);
        if (targetNode?.sub_dag && subDags.has(targetNode.sub_dag)) {
          // Target is a subgraph
          lines.push(...generateSubgraphConnection(node.node_id, targetNode, subDags.get(targetNode.sub_dag)!, 'true', indent));
        } else {
          lines.push(`${indent}${node.node_id} -->|true| ${node.true_node}`);
        }
        processedEdges.add(edgeKey);
      }
    }

    if (node.false_node) {
      const edgeKey = `${node.node_id}->${node.false_node}`;
      if (!processedEdges.has(edgeKey)) {
        const targetNode = allNodes.find(n => n.node_id === node.false_node);
        if (targetNode?.sub_dag && subDags.has(targetNode.sub_dag)) {
          lines.push(...generateSubgraphConnection(node.node_id, targetNode, subDags.get(targetNode.sub_dag)!, 'false', indent));
        } else {
          lines.push(`${indent}${node.node_id} -->|false| ${node.false_node}`);
        }
        processedEdges.add(edgeKey);
      }
    }
  }

  // Handle dependencies (reverse: dependency node points to current node)
  if (node.deps && node.deps.length > 0) {
    node.deps.forEach((dep) => {
      const edgeKey = `${dep}->${node.node_id}`;
      if (!processedEdges.has(edgeKey)) {
        const depNode = allNodes.find(n => n.node_id === dep);
        // Skip if dependency is conditional (already handled via true_node/false_node)
        if (!depNode || !isConditionalNode(depNode)) {
          lines.push(`${indent}${dep} --> ${node.node_id}`);
        }
        processedEdges.add(edgeKey);
      }
    });
  }

  return lines;
}

/**
 * Generate subgraph connection
 */
function generateSubgraphConnection(
  fromNodeId: string,
  toNode: DagNode,
  subDag: DagConfig,
  label: string,
  indent: string
): string[] {
  const lines: string[] = [];

  // Create subgraph
  lines.push('');
  lines.push(`${indent}subgraph ${toNode.node_id}[" "]`);
  lines.push(`${indent}  direction TB`);

  // Define nodes in subgraph
  subDag.nodes.forEach((node) => {
    const nodeDef = generateNodeDefinition(node, indent + '    ');
    lines.push(nodeDef);
  });

  lines.push('');

  // Generate edges in subgraph
  subDag.nodes.forEach((node) => {
    if (isConditionalNode(node)) {
      if (node.true_node) {
        lines.push(`${indent}    ${node.node_id} -->|true| ${node.true_node}`);
      }
      if (node.false_node) {
        lines.push(`${indent}    ${node.node_id} -->|false| ${node.false_node}`);
      }
    }
  });

  // Add class definitions for subgraph nodes
  subDag.nodes.forEach((node) => {
    if (isConditionalNode(node)) {
      lines.push(`${indent}    class ${node.node_id} conditionalNode`);
    } else {
      lines.push(`${indent}    class ${node.node_id} operatorNode`);
    }
  });

  lines.push(`${indent}end`);
  lines.push('');

  // Connect from conditional node to subgraph
  lines.push(`${indent}${fromNodeId} -->|${label}| ${toNode.node_id}`);

  return lines;
}

/**
 * Generate complete Mermaid code (includes main DAG and related sub DAGs)
 */
export function generateFullMermaid(yamlContent: string): {
  mermaidCode: string;
  error?: string;
} {
  try {
    const { parseYamlConfigs } = require('./yaml-parser');
    const parsedDags = parseYamlConfigs(yamlContent);

    if (!parsedDags.mainDag && parsedDags.subDags.size === 0) {
      return {
        mermaidCode: '',
        error: 'No valid DAG configuration found',
      };
    }

    const mermaidCode = generateMermaidSyntax(parsedDags);
    return { mermaidCode };
  } catch (error) {
    return {
      mermaidCode: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
