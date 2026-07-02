"use client";

import { Search, ZoomIn, ZoomOut, Maximize2, ChevronRight, Home, X } from "lucide-react";
import type { DecisionTreeNode } from "@/lib/decision-tree.types";

const STREAM_FILTERS = [
  { key: "all", label: "All", color: "bg-slate-100 text-slate-700" },
  { key: "Science", label: "Science", color: "bg-blue-100 text-blue-700" },
  { key: "Commerce", label: "Commerce", color: "bg-indigo-100 text-indigo-700" },
  { key: "Arts", label: "Arts", color: "bg-purple-100 text-purple-700" },
  { key: "Diploma", label: "Diploma", color: "bg-amber-100 text-amber-700" },
  { key: "ITI", label: "ITI", color: "bg-orange-100 text-orange-700" },
  { key: "Vocational", label: "Vocational", color: "bg-green-100 text-green-700" },
];

interface DecisionTreeNavProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  currentZoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  breadcrumb: DecisionTreeNode[];
  onBreadcrumbClick: (node: DecisionTreeNode) => void;
  onClearSelection: () => void;
}

export function DecisionTreeNav({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  currentZoom,
  onZoomIn,
  onZoomOut,
  onFitView,
  breadcrumb,
  onBreadcrumbClick,
  onClearSelection,
}: DecisionTreeNavProps) {
  return (
    <div className="bg-white border-b border-neutral-lightGray/50 sticky top-16 z-30">
      <div className="container-custom py-3">
        {/* Breadcrumb */}
        {breadcrumb.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3 text-sm overflow-x-auto no-scrollbar pb-1">
            <button onClick={onClearSelection} className="flex items-center gap-1 text-neutral-darkGray hover:text-brand-royal shrink-0">
              <Home className="h-3.5 w-3.5" />
            </button>
            {breadcrumb.map((node, i) => (
              <div key={node.id} className="flex items-center gap-1.5 shrink-0">
                <ChevronRight className="h-3 w-3 text-neutral-lightGray" />
                <button
                  onClick={() => onBreadcrumbClick(node)}
                  className={`hover:text-brand-royal transition-colors truncate max-w-[200px] ${
                    i === breadcrumb.length - 1 ? "text-brand-royal font-semibold" : "text-neutral-darkGray"
                  }`}
                >
                  {node.name}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Search + Filters + Zoom */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-darkGray" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search careers, degrees, exams..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-lightGray focus:border-brand-royal focus:outline-none focus:ring-2 focus:ring-brand-royal/10 text-sm"
            />
            {searchQuery && (
              <button onClick={() => onSearchChange("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-neutral-darkGray hover:text-neutral-nearBlack" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {STREAM_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => onFilterChange(f.key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeFilter === f.key
                    ? "bg-brand-navy text-white shadow-sm"
                    : `${f.color} hover:opacity-80`
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button onClick={onZoomOut} className="p-2 rounded-lg bg-brand-bg hover:bg-neutral-lightGray transition-colors" title="Zoom out">
              <ZoomOut className="h-4 w-4 text-neutral-darkGray" />
            </button>
            <span className="text-xs font-medium text-neutral-darkGray min-w-[48px] text-center">{Math.round(currentZoom * 100)}%</span>
            <button onClick={onZoomIn} className="p-2 rounded-lg bg-brand-bg hover:bg-neutral-lightGray transition-colors" title="Zoom in">
              <ZoomIn className="h-4 w-4 text-neutral-darkGray" />
            </button>
            <button onClick={onFitView} className="p-2 rounded-lg bg-brand-bg hover:bg-neutral-lightGray transition-colors" title="Reset zoom">
              <Maximize2 className="h-4 w-4 text-neutral-darkGray" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
