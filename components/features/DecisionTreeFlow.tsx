"use client";

import { useMemo, useCallback, useEffect, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type NodeTypes,
  type ReactFlowInstance,
  type NodeMouseHandler,
  type Edge,
} from "reactflow";
import type { DecisionTreeNode } from "@/lib/decision-tree.types";
import type { FlowNode } from "@/lib/decision-tree-layout";
import {
  treeToFlowData,
  filterNodesForStream,
  highlightSearchResults,
  markSelectedNode,
  filterVisibleNodes,
  getAncestorEdges,
} from "@/lib/decision-tree-layout";
import { extractNodeColors } from "@/lib/decision-tree-colors";
import { DecisionTreeFlowNode } from "./DecisionTreeFlowNode";

const nodeTypes: NodeTypes = {
  careerNode: DecisionTreeFlowNode,
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
  direction: "TB" | "LR";
}

/** Edge types matching the layout direction */
function getEdgeType(direction: "TB" | "LR"): string {
  return direction === "TB" ? "smoothstep" : "default";
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
  direction,
}: DecisionTreeFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const didFitView = useRef(false);
  const rfLocalRef = useRef<ReactFlowInstance | null>(null);

  // Data pipeline: convert → filter → filterVisible → layout → highlight → markSelected
  const layouted = useMemo(() => {
    const { nodes: rawNodes, edges: rawEdges } = treeToFlowData(root);
    let { nodes: filtered, edges: filteredEdges } = filterNodesForStream(
      rawNodes,
      rawEdges,
      activeFilter,
      direction,
    );
    const visible = filterVisibleNodes(filtered, filteredEdges, expandedIds, direction);
    let visibleNodes = visible.nodes;
    let visibleEdges = visible.edges;
    visibleNodes = highlightSearchResults(visibleNodes, searchQuery);
    visibleNodes = markSelectedNode(visibleNodes, selectedNodeId);

    // Inject callbacks and expanded state into every node's data
    visibleNodes = visibleNodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        isExpanded: expandedIds.has(n.id),
        onToggleExpand: (id: string) => onToggle(id),
        onSelectNode: (data: DecisionTreeNode) => onSelect(data),
      },
    }));

    // Annotate edges with direction-aware type and active-path styling
    const edgeType = getEdgeType(direction);
    if (selectedNodeId) {
      const ancestorIds = getAncestorEdges(selectedNodeId, visibleEdges);
      visibleEdges = visibleEdges.map((e) => {
        const isActive = ancestorIds.has(e.id);
        return {
          ...e,
          type: edgeType,
          animated: isActive,
          style: isActive
            ? {
                stroke: "url(#active-gradient)",
                strokeWidth: 2.5,
              }
            : {
                stroke: "#94a3b8",
                strokeWidth: 1.5,
              },
        } as Edge;
      });
    } else {
      visibleEdges = visibleEdges.map((e) => ({
        ...e,
        type: edgeType,
        style: { stroke: "#94a3b8", strokeWidth: 1.5 },
      }));
    }

    return { nodes: visibleNodes, edges: visibleEdges };
  }, [root, activeFilter, searchQuery, selectedNodeId, expandedIds, direction, onToggle, onSelect]);

  // ReactFlow requires state to be set via setNodes/setEdges for internal tracking
  useEffect(() => {
    setNodes(layouted.nodes);
    setEdges(layouted.edges);
  }, [layouted, setNodes, setEdges]);

  // Auto-center camera when selected node changes
  useEffect(() => {
    if (!selectedNodeId || !rfLocalRef.current) return;
    const node = layouted.nodes.find((n) => n.id === selectedNodeId);
    if (!node) return;
    rfLocalRef.current.setCenter(
      node.position.x + ((node.style?.width as number) || 200) / 2,
      node.position.y + ((node.style?.height as number) || 70) / 2,
      { zoom: 1, duration: 500 },
    );
  }, [selectedNodeId]); // eslint-disable-line react-hooks/exhaustive-deps

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
      rfLocalRef.current = instance;
      onReactFlowInit(instance);
      if (!didFitView.current) {
        didFitView.current = true;
        setTimeout(() => instance.fitView({ padding: 0.3, duration: 400 }), 100);
      }
    },
    [onReactFlowInit],
  );

  const handleMoveEnd = useCallback(
    (_event: any, viewport: any) => {
      onZoomChange(viewport.zoom);
    },
    [onZoomChange],
  );

  // Node color for minimap
  const minimapNodeColor = useCallback(
    (node: any) => {
      const color = node.data?.color;
      if (!color) return "#64748b";
      return extractNodeColors(color).text;
    },
    [],
  );

  return (
    <div
      className="overflow-hidden rounded-2xl bg-white border border-neutral-lightGray/50 relative"
      style={{ height: "calc(100vh - 16rem)" }}
    >
      {/* Hidden SVG for animated gradient used by active-path edges */}
      <svg width="0" height="0" style={{ position: "absolute", pointerEvents: "none" }}>
        <defs>
          <linearGradient id="active-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0056D2">
              <animate
                attributeName="stop-color"
                values="#0056D2;#1E90FF;#4DB8FF;#1E90FF;#0056D2"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#1E90FF">
              <animate
                attributeName="stop-color"
                values="#1E90FF;#4DB8FF;#0056D2;#4DB8FF;#1E90FF"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>
        </defs>
      </svg>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        onInit={handleInit}
        onMoveEnd={handleMoveEnd}
        defaultEdgeOptions={{
          type: getEdgeType(direction),
          style: { stroke: "#94a3b8", strokeWidth: 1.5 },
        }}
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
        <Controls
          showInteractive={false}
          className="!shadow !rounded-xl !border !border-neutral-lightGray/50"
        />
        <MiniMap
          nodeColor={minimapNodeColor}
          maskColor="rgba(255,255,255,0.15)"
          className="!bg-white/60 !backdrop-blur-md !rounded-2xl !border !border-white/20 !shadow-xl !overflow-hidden"
          style={{ maxHeight: 200 }}
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}
