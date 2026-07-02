"use client";

import { useMemo, useCallback, useEffect, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type NodeTypes,
  type ReactFlowInstance,
  type NodeMouseHandler,
} from "reactflow";
import type { DecisionTreeNode } from "@/lib/decision-tree.types";
import type { FlowNode } from "@/lib/decision-tree-layout";
import {
  treeToFlowData,
  applyDagreLayout,
  filterNodesForStream,
  highlightSearchResults,
  markSelectedNode,
  filterVisibleNodes,
} from "@/lib/decision-tree-layout";
import { DecisionTreeFlowNode } from "./DecisionTreeFlowNode";

const nodeTypes: NodeTypes = {
  careerNode: DecisionTreeFlowNode,
};

const defaultEdgeOptions = {
  type: "smoothstep" as const,
  style: { stroke: "#94a3b8", strokeWidth: 1.5 },
};

interface DecisionTreeFlowProps {
  root: DecisionTreeNode;
  selectedNodeId: string | null;
  onSelect: (node: DecisionTreeNode) => void;
  searchQuery: string;
  activeFilter: string;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onReactFlowInit: (instance: ReactFlowInstance) => void;
  onZoomChange: (zoom: number) => void;
}

export function DecisionTreeFlow({
  root,
  selectedNodeId,
  onSelect,
  searchQuery,
  activeFilter,
  expandedIds,
  onToggle,
  onReactFlowInit,
  onZoomChange,
}: DecisionTreeFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const didFitView = useRef(false);

  // Data pipeline: convert → filter → filterVisible → layout → highlight → markSelected
  const layouted = useMemo(() => {
    const { nodes: rawNodes, edges: rawEdges } = treeToFlowData(root);
    let { nodes: filtered, edges: filteredEdges } = filterNodesForStream(rawNodes, rawEdges, activeFilter);
    const visible = filterVisibleNodes(filtered, filteredEdges, expandedIds);
    let { nodes: visibleNodes, edges: visibleEdges } = visible;
    visibleNodes = highlightSearchResults(visibleNodes, searchQuery);
    visibleNodes = markSelectedNode(visibleNodes, selectedNodeId);
    return { nodes: visibleNodes, edges: visibleEdges };
  }, [root, activeFilter, searchQuery, selectedNodeId, expandedIds]);

  // ReactFlow requires state to be set via setNodes/setEdges for internal tracking
  useEffect(() => {
    setNodes(layouted.nodes);
    setEdges(layouted.edges);
  }, [layouted, setNodes, setEdges]);

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      const flowNode = node as FlowNode;
      onSelect(flowNode.data);
      if (flowNode.data.children.length > 0) {
        onToggle(flowNode.id);
      }
    },
    [onSelect, onToggle],
  );

  const handleInit = useCallback(
    (instance: ReactFlowInstance) => {
      onReactFlowInit(instance);
      // Fit view on initial load
      if (!didFitView.current) {
        didFitView.current = true;
        setTimeout(() => instance.fitView({ padding: 0.3, duration: 400 }), 100);
      }
    },
    [onReactFlowInit],
  );

  // Fit view when filter changes
  useEffect(() => {
    // Skip first render (handleInit handles that)
  }, [activeFilter]);

  const handleMoveEnd = useCallback(
    (_event: any, viewport: any) => {
      onZoomChange(viewport.zoom);
    },
    [onZoomChange],
  );

  return (
    <div className="overflow-hidden rounded-2xl bg-white border border-neutral-lightGray/50" style={{ height: "calc(100vh - 16rem)" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        onInit={handleInit}
        onMoveEnd={handleMoveEnd}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Background color="#e2e8f0" gap={24} />
        <Controls showInteractive={false} className="!shadow !rounded-xl !border !border-neutral-lightGray/50" />
      </ReactFlow>
    </div>
  );
}
