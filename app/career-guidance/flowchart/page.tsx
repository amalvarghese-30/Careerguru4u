"use client";

import { useState, useCallback, useMemo, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactFlowInstance } from "reactflow";
import "reactflow/dist/style.css";
import { decisionTree, findNodeById, getAncestors } from "@/lib/decision-tree";
import type { DecisionTreeNode } from "@/lib/decision-tree.types";
import { DecisionTreeNav } from "@/components/features/DecisionTreeNav";
import { DecisionTreeFlow } from "@/components/features/DecisionTreeFlow";
import { DecisionTreeNodeDetail } from "@/components/features/DecisionTreeNodeDetail";

function FlowchartContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nodeParam = searchParams.get("node");

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentZoom, setCurrentZoom] = useState(1);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const [direction, setDirection] = useState<"TB" | "LR">("TB");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [urlSynced, setUrlSynced] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  // ── URL permalink: restore from ?node= on first load ──
  useEffect(() => {
    if (urlSynced || !nodeParam) return;
    const node = findNodeById(nodeParam);
    if (node) {
      setSelectedNodeId(node.id);
      // Expand all ancestors so the node is visible
      const ancestors = getAncestors(node.id, decisionTree);
      const toExpand = new Set<string>();
      for (const a of ancestors) {
        if (a.id !== node.id) toExpand.add(a.id);
      }
      if (toExpand.size > 0) {
        setExpandedIds(toExpand);
      }
    }
    setUrlSynced(true);
  }, [nodeParam, urlSynced]);

  // ── URL permalink: update URL when selection changes ──
  useEffect(() => {
    if (!urlSynced) return;
    const params = new URLSearchParams(searchParams.toString());
    if (selectedNodeId) {
      params.set("node", selectedNodeId);
    } else {
      params.delete("node");
    }
    // Preserve any other params
    const newUrl = `/career-guidance/flowchart${params.toString() ? `?${params.toString()}` : ""}`;
    router.replace(newUrl, { scroll: false });
  }, [selectedNodeId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Get the currently selected node and its breadcrumb ──
  const selectedNode = useMemo(
    () => (selectedNodeId ? findNodeById(selectedNodeId, decisionTree) : null),
    [selectedNodeId],
  );
  const breadcrumb = useMemo(
    () => (selectedNodeId ? getAncestors(selectedNodeId, decisionTree) : []),
    [selectedNodeId],
  );

  // ── Handlers ──

  const handleSelect = useCallback((node: DecisionTreeNode) => {
    setSelectedNodeId((prev) => (prev === node.id ? null : node.id));
  }, []);

  const handleBreadcrumbClick = useCallback(
    (node: DecisionTreeNode) => {
      setSelectedNodeId(node.id);
      const ancestors = getAncestors(node.id, decisionTree);
      setExpandedIds((prev) => {
        const next = new Set(prev);
        for (const a of ancestors) {
          if (a.id !== node.id) next.add(a.id);
        }
        return next;
      });
    },
    [],
  );

  const handleClearSelection = useCallback(() => {
    setSelectedNodeId(null);
    setExpandedIds(new Set());
    rfInstance?.fitView({ padding: 0.3, duration: 400 });
  }, [rfInstance]);

  const handleToggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleZoomIn = useCallback(() => {
    rfInstance?.zoomIn({ duration: 200 });
  }, [rfInstance]);

  const handleZoomOut = useCallback(() => {
    rfInstance?.zoomOut({ duration: 200 });
  }, [rfInstance]);

  const handleFitView = useCallback(() => {
    rfInstance?.fitView({ padding: 0.3, duration: 400 });
  }, [rfInstance]);

  // ── Jump to node (from search dropdown) ──
  const handleJumpToNode = useCallback(
    (nodeId: string) => {
      setSelectedNodeId(nodeId);
      const ancestors = getAncestors(nodeId, decisionTree);
      setExpandedIds((prev) => {
        const next = new Set(prev);
        for (const a of ancestors) {
          if (a.id !== nodeId) next.add(a.id);
        }
        return next;
      });
    },
    [],
  );

  // ── Fullscreen toggle ──
  const handleFullscreenToggle = useCallback(() => {
    if (!document.fullscreenElement) {
      canvasRef.current?.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  }, []);

  // Listen for fullscreen exit via Esc key
  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg pt-16">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-brand-navy via-brand-navy to-brand-royal py-8">
        <div className="container-custom">
          <Link
            href="/career-guidance"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-3 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Career Guidance
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Interactive Career Path Explorer</h1>
          <p className="text-white/80 text-sm mt-1 max-w-xl">
            Explore every career path after Class 10 — click any node to see details, expand branches to drill deeper.
          </p>
        </div>
      </div>

      {/* Navigation Bar */}
      <DecisionTreeNav
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        currentZoom={currentZoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
        breadcrumb={breadcrumb}
        onBreadcrumbClick={handleBreadcrumbClick}
        onClearSelection={handleClearSelection}
        direction={direction}
        onDirectionChange={setDirection}
        isFullscreen={isFullscreen}
        onFullscreenToggle={handleFullscreenToggle}
        onJumpToNode={handleJumpToNode}
      />

      {/* Main Content */}
      <div className="container-custom py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Tree View */}
          <div
            ref={canvasRef}
            className="flex-1 min-w-0"
          >
            <DecisionTreeFlow
              root={decisionTree}
              selectedNodeId={selectedNodeId}
              onSelect={handleSelect}
              searchQuery={searchQuery}
              activeFilter={activeFilter}
              expandedIds={expandedIds}
              onToggle={handleToggle}
              onReactFlowInit={setRfInstance}
              onZoomChange={setCurrentZoom}
              direction={direction}
            />
          </div>

          {/* Detail Panel */}
          <div className="lg:w-96 flex-shrink-0">
            <AnimatePresence mode="wait">
              {selectedNode ? (
                <DecisionTreeNodeDetail
                  key={selectedNode.id}
                  node={selectedNode}
                  onClose={() => setSelectedNodeId(null)}
                />
              ) : (
                <div className="glass-card p-8 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-sky/20 to-brand-electric/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🧭</span>
                  </div>
                  <h3 className="font-semibold text-neutral-nearBlack mb-2">Explore Career Paths</h3>
                  <p className="text-sm text-neutral-darkGray">
                    Click on any node in the tree to see detailed information about that career path, including education, salary, exams, skills, and more.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FlowchartPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-bg pt-16">
          <div className="container-custom py-12">
            <div className="h-96 animate-pulse rounded-2xl bg-neutral-lightGray/20" />
          </div>
        </div>
      }
    >
      <FlowchartContent />
    </Suspense>
  );
}
