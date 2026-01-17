import YAML from 'yaml';
import type { DagConfig, ParsedDags } from './types';

/**
 * Parse multiple YAML configurations (separated by ---)
 */
export function parseYamlConfigs(yamlContent: string): ParsedDags {
  const result: ParsedDags = {
    subDags: new Map(),
  };

  if (!yamlContent.trim()) {
    return result;
  }

  try {
    // Use YAML parseAllDocuments to parse multiple documents
    const documents = YAML.parseAllDocuments(yamlContent);

    documents.forEach((doc) => {
      if (doc.errors.length > 0) {
        console.warn('YAML parse warning:', doc.errors);
      }

      const config = doc.toJSON() as DagConfig;
      if (!config || !config.dag_id) {
        return;
      }

      // Determine if it's main DAG or sub DAG
      // If dag_id starts with sub_ or there's already a main DAG, treat as sub DAG
      if (config.dag_id.startsWith('sub_') || result.mainDag) {
        result.subDags.set(config.dag_id, config);
      } else {
        result.mainDag = config;
      }
    });
  } catch (error) {
    console.error('YAML parse error:', error);
  }

  return result;
}

/**
 * Validate DAG configuration
 */
export function validateDagConfig(config: DagConfig): string[] {
  const errors: string[] = [];

  if (!config.dag_id) {
    errors.push('Missing dag_id');
  }

  if (!config.nodes || !Array.isArray(config.nodes)) {
    errors.push('Missing or invalid nodes array');
    return errors;
  }

  const nodeIds = new Set<string>();

  config.nodes.forEach((node, index) => {
    if (!node.node_id) {
      errors.push(`Node at index ${index} is missing node_id`);
    } else {
      if (nodeIds.has(node.node_id)) {
        errors.push(`Duplicate node_id: ${node.node_id}`);
      }
      nodeIds.add(node.node_id);
    }

    // Validate dependencies
    if (node.deps) {
      node.deps.forEach((dep) => {
        // Dependencies may reference other nodes, skip validation for now
      });
    }
  });

  return errors;
}
