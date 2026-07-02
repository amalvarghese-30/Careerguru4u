import type { Node, Edge } from "reactflow";
import * as dagre from "dagre";
import type { DecisionTreeNode } from "./decision-tree.types";

export type NodeLevel = "root" | "stream" | "branch" | "leaf";

export interface FlowNodeData extends DecisionTreeNode {
  nodeLevel: NodeLevel;
  isSearchMatch: boolean;
  isSearchDimmed: boolean;
  isSelected: boolean;
  depth: number;
}

export type FlowNode = Node<FlowNodeData>;
export type FlowEdge = Edge;

const NODE_SIZES: Record<NodeLevel, { width: number; height: number }> = {
  root: { width: 300, height: 100 },
  stream: { width: 220, height: 80 },
  branch: { width: 200, height: 70 },
  leaf: { width: 190, height: 64 },
};

function getNodeLevel(node: DecisionTreeNode, depth: number): NodeLevel {
  if (depth === 0) return "root";
  if (depth === 1 && node.children.length > 0) return "stream";
  if (node.children.length > 0) return "branch";
  return "leaf";
}

function flattenTree(
  node: DecisionTreeNode,
  depth: number,
): { nodes: FlowNode[]; edges: FlowEdge[] } {
  const nodeLevel = getNodeLevel(node, depth);
  const size = NODE_SIZES[nodeLevel];

  const flowNode: FlowNode = {
    id: node.id,
    type: "careerNode",
    position: { x: 0, y: 0 },
    data: {
      ...node,
      nodeLevel,
      isSearchMatch: false,
      isSearchDimmed: false,
      isSelected: false,
      depth,
    },
    style: { width: size.width },
  };

  const allNodes: FlowNode[] = [flowNode];
  const allEdges: FlowEdge[] = [];

  for (const child of node.children) {
    const childResult = flattenTree(child, depth + 1);
    allNodes.push(...childResult.nodes);
    allEdges.push(...childResult.edges);
    allEdges.push({
      id: `${node.id}->${child.id}`,
      source: node.id,
      target: child.id,
      type: "smoothstep",
    });
  }

  return { nodes: allNodes, edges: allEdges };
}

export function treeToFlowData(root: DecisionTreeNode): { nodes: FlowNode[]; edges: FlowEdge[] } {
  return flattenTree(root, 0);
}

export function applyDagreLayout(
  nodes: FlowNode[],
  edges: FlowEdge[],
  direction: "TB" | "LR" = "TB",
): FlowNode[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, ranksep: 120, nodesep: 80, marginx: 40, marginy: 40 });

  for (const node of nodes) {
    const level = node.data.nodeLevel;
    const size = NODE_SIZES[level];
    g.setNode(node.id, { width: size.width, height: size.height });
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    if (!pos) return node;
    const level = node.data.nodeLevel;
    const size = NODE_SIZES[level];
    return {
      ...node,
      position: {
        x: pos.x - size.width / 2,
        y: pos.y - size.height / 2,
      },
    };
  });
}

export function filterNodesForStream(
  nodes: FlowNode[],
  edges: FlowEdge[],
  streamName: string,
): { nodes: FlowNode[]; edges: FlowEdge[] } {
  if (streamName === "all") return { nodes, edges };

  // Find the stream node
  const streamNode = nodes.find(
    (n) => n.data.category === streamName && n.data.nodeLevel === "stream",
  );
  if (!streamNode) return { nodes: [nodes[0]], edges: [] };

  // Collect all descendant IDs
  const descendantIds = new Set<string>();
  function collectDescendants(id: string) {
    descendantIds.add(id);
    for (const edge of edges) {
      if (edge.source === id) collectDescendants(edge.target);
    }
  }
  collectDescendants(streamNode.id);

  // Always include root
  descendantIds.add("root");

  const filteredNodes = nodes.filter((n) => descendantIds.has(n.id));
  const filteredEdges = edges.filter((e) => descendantIds.has(e.source) && descendantIds.has(e.target));
  const laidOutNodes = applyDagreLayout(filteredNodes, filteredEdges);

  return { nodes: laidOutNodes, edges: filteredEdges };
}

export function highlightSearchResults(
  nodes: FlowNode[],
  query: string,
): FlowNode[] {
  if (!query) {
    return nodes.map((n) => ({
      ...n,
      data: { ...n.data, isSearchMatch: false, isSearchDimmed: false },
    }));
  }

  const lower = query.toLowerCase();
  return nodes.map((n) => {
    const matches =
      n.data.name.toLowerCase().includes(lower) ||
      n.data.shortDescription.toLowerCase().includes(lower);
    return {
      ...n,
      data: { ...n.data, isSearchMatch: matches, isSearchDimmed: !matches },
    };
  });
}

export function markSelectedNode(nodes: FlowNode[], selectedId: string | null): FlowNode[] {
  return nodes.map((n) => ({
    ...n,
    data: { ...n.data, isSelected: n.id === selectedId },
  }));
}

export function filterVisibleNodes(
  nodes: FlowNode[],
  edges: FlowEdge[],
  expandedIds: Set<string>,
): { nodes: FlowNode[]; edges: FlowEdge[] } {
  // Build parent → children map from edges
  const childrenMap = new Map<string, string[]>();
  for (const edge of edges) {
    const list = childrenMap.get(edge.source) || [];
    list.push(edge.target);
    childrenMap.set(edge.source, list);
  }

  // Walk from root through expanded nodes to collect visible IDs
  const visibleIds = new Set<string>();
  function walk(id: string) {
    visibleIds.add(id);
    if (expandedIds.has(id)) {
      const children = childrenMap.get(id) || [];
      for (const childId of children) {
        walk(childId);
      }
    }
  }
  walk("root");

  const filteredNodes = nodes.filter((n) => visibleIds.has(n.id));
  const filteredEdges = edges.filter((e) => visibleIds.has(e.source) && visibleIds.has(e.target));
  const laidOutNodes = applyDagreLayout(filteredNodes, filteredEdges);

  return { nodes: laidOutNodes, edges: filteredEdges };
}
