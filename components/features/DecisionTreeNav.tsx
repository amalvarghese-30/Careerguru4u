"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  Search, ZoomIn, ZoomOut, Maximize2, Minimize2, ChevronRight, Home, X,
  ArrowUpDown, ArrowLeftRight, Navigation, Loader2,
} from "lucide-react";
import type { DecisionTreeNode } from "@/lib/decision-tree.types";
import { searchNodes } from "@/lib/decision-tree";

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
  direction: "TB" | "LR";
  onDirectionChange: (dir: "TB" | "LR") => void;
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
  onJumpToNode: (nodeId: string) => void;
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
  direction,
  onDirectionChange,
  isFullscreen,
  onFullscreenToggle,
  onJumpToNode,
}: DecisionTreeNavProps) {
  // Local debounce state for search
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search: update parent after 200ms pause
  const handleQueryChange = useCallback(
    (value: string) => {
      setLocalQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSearchChange(value);
      }, 200);
      setIsDropdownOpen(value.length > 0);
      setSelectedIndex(0);
    },
    [onSearchChange],
  );

  // Sync external searchQuery changes back to local
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  // Clear search
  const handleClear = useCallback(() => {
    setLocalQuery("");
    onSearchChange("");
    setIsDropdownOpen(false);
    inputRef.current?.focus();
  }, [onSearchChange]);

  // Search results (using the fast local query for instant feedback)
  const searchResults = useMemo(() => {
    if (!localQuery || localQuery.length < 1) return [];
    return searchNodes(localQuery).slice(0, 8);
  }, [localQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation in dropdown
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isDropdownOpen || searchResults.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, searchResults.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const node = searchResults[selectedIndex];
        if (node) {
          handleJumpTo(node.id);
        }
      } else if (e.key === "Escape") {
        setIsDropdownOpen(false);
        inputRef.current?.blur();
      }
    },
    [isDropdownOpen, searchResults, selectedIndex],
  );

  const handleJumpTo = useCallback(
    (nodeId: string) => {
      setLocalQuery("");
      onSearchChange("");
      setIsDropdownOpen(false);
      onJumpToNode(nodeId);
    },
    [onJumpToNode, onSearchChange],
  );

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

        {/* Search + Filters + Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search with dropdown */}
          <div className="relative flex-1 max-w-md" ref={dropdownRef}>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-darkGray" />
            <input
              ref={inputRef}
              type="text"
              value={localQuery}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => { if (localQuery.length > 0) setIsDropdownOpen(true); }}
              onKeyDown={handleKeyDown}
              placeholder="Search & jump to any career..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-neutral-lightGray focus:border-brand-royal focus:outline-none focus:ring-2 focus:ring-brand-royal/10 text-sm"
            />
            {localQuery && (
              <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-neutral-darkGray hover:text-neutral-nearBlack" />
              </button>
            )}

            {/* Search dropdown */}
            {isDropdownOpen && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-xl border border-neutral-lightGray shadow-lg z-50 overflow-hidden max-h-80 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-neutral-darkGray text-center">
                    No careers found for &ldquo;{localQuery}&rdquo;
                  </div>
                ) : (
                  searchResults.map((node, i) => (
                    <button
                      key={node.id}
                      onMouseDown={() => handleJumpTo(node.id)}
                      onMouseEnter={() => setSelectedIndex(i)}
                      className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${
                        i === selectedIndex
                          ? "bg-brand-royal/5 border-l-2 border-brand-royal"
                          : "hover:bg-neutral-lightGray/30 border-l-2 border-transparent"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-nearBlack truncate">{node.name}</p>
                        <p className="text-[10px] text-neutral-darkGray truncate">
                          {node.category || node.shortDescription}
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold text-brand-royal flex items-center gap-0.5 shrink-0">
                        <Navigation className="h-3 w-3" /> Jump
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Stream filter pills */}
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

          {/* Controls: direction toggle + fullscreen + zoom */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Direction toggle */}
            <button
              onClick={() => onDirectionChange(direction === "TB" ? "LR" : "TB")}
              className="p-2 rounded-lg bg-brand-bg hover:bg-neutral-lightGray transition-colors"
              title={direction === "TB" ? "Switch to horizontal layout" : "Switch to vertical layout"}
            >
              {direction === "TB" ? (
                <ArrowLeftRight className="h-4 w-4 text-neutral-darkGray" />
              ) : (
                <ArrowUpDown className="h-4 w-4 text-neutral-darkGray" />
              )}
            </button>

            {/* Fullscreen toggle */}
            <button
              onClick={onFullscreenToggle}
              className="p-2 rounded-lg bg-brand-bg hover:bg-neutral-lightGray transition-colors"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4 text-neutral-darkGray" />
              ) : (
                <Maximize2 className="h-4 w-4 text-neutral-darkGray" />
              )}
            </button>

            <div className="w-px h-5 bg-neutral-lightGray mx-1" />

            {/* Zoom controls */}
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
