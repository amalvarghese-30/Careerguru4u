"use client";

import { useState, useCallback, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { decisionTree, findNodeById, getAncestors } from "@/lib/decision-tree";
import type { DecisionTreeNode } from "@/lib/decision-tree.types";
import { DecisionTreeNav } from "@/components/features/DecisionTreeNav";
import { DecisionTreeView } from "@/components/features/DecisionTreeView";
import { DecisionTreeNodeDetail } from "@/components/features/DecisionTreeNodeDetail";

export default function FlowchartPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(["root"]));
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Get the currently selected node and its breadcrumb
  const selectedNode = useMemo(
    () => (selectedNodeId ? findNodeById(selectedNodeId, decisionTree) : null),
    [selectedNodeId]
  );
  const breadcrumb = useMemo(
    () => (selectedNodeId ? getAncestors(selectedNodeId, decisionTree) : []),
    [selectedNodeId]
  );

  // Filter root children by stream
  const filteredRoot = useMemo(() => {
    if (activeFilter === "all") return decisionTree;
    const filtered = {
      ...decisionTree,
      children: decisionTree.children.filter(
        (c) => c.category === activeFilter
      ),
    };
    return filtered;
  }, [activeFilter]);

  // Auto-expand to match search results
  const displayedExpandedIds = useMemo(() => {
    if (!searchQuery) return expandedIds;
    // Find matching nodes and expand their ancestors
    const ids = new Set(expandedIds);
    function searchAndExpand(node: DecisionTreeNode): boolean {
      const matches = node.name.toLowerCase().includes(searchQuery.toLowerCase());
      let childMatches = false;
      for (const child of node.children) {
        if (searchAndExpand(child)) childMatches = true;
      }
      if (matches || childMatches) {
        ids.add(node.id);
        return true;
      }
      return false;
    }
    searchAndExpand(filteredRoot);
    return ids;
  }, [expandedIds, searchQuery, filteredRoot]);

  const handleSelect = useCallback((node: DecisionTreeNode) => {
    setSelectedNodeId((prev) => (prev === node.id ? null : node.id));
  }, []);

  const handleToggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleZoomChange = useCallback((delta: number) => {
    setZoom((z) => Math.max(0.5, Math.min(2, z + delta)));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleBreadcrumbClick = useCallback(
    (node: DecisionTreeNode) => {
      setSelectedNodeId(node.id);
      // Expand all ancestors
      const ancestors = getAncestors(node.id, decisionTree);
      setExpandedIds((prev) => {
        const next = new Set(prev);
        ancestors.forEach((a) => next.add(a.id));
        next.add(node.id);
        return next;
      });
    },
    []
  );

  const handleClearSelection = useCallback(() => {
    setSelectedNodeId(null);
    setExpandedIds(new Set(["root"]));
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
        zoom={zoom}
        onZoomChange={handleZoomChange}
        onZoomReset={handleZoomReset}
        breadcrumb={breadcrumb}
        onBreadcrumbClick={handleBreadcrumbClick}
        onClearSelection={handleClearSelection}
      />

      {/* Main Content */}
      <div className="container-custom py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Tree View */}
          <div className="flex-1 min-w-0">
            <DecisionTreeView
              root={filteredRoot}
              selectedNodeId={selectedNodeId}
              onSelect={handleSelect}
              expandedIds={displayedExpandedIds}
              onToggle={handleToggle}
              searchQuery={searchQuery}
              zoom={zoom}
              pan={pan}
              onPanStart={() => {}}
              onPanning={(dx, dy) => setPan((p) => ({ x: p.x + dx, y: p.y + dy }))}
              onPanEnd={() => {}}
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
