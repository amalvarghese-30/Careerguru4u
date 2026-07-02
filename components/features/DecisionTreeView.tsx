"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { DecisionTreeNode } from "@/lib/decision-tree.types";

// Runtime icon lookup — resolves string names to lucide-react icons
const iconMap: Record<string, string> = {
  FlaskConical: "🧪", ChartBar: "📊", Palette: "🎨", Wrench: "🔧", Briefcase: "💼",
  Compass: "🧭", HeartPulse: "💗", GraduationCap: "🎓", BookOpen: "📖", Calculator: "🧮",
  TrendingUp: "📈", Building: "🏢", Scale: "⚖️", Brain: "🧠", Newspaper: "📰",
  PenTool: "✏️", Landmark: "🏛", HeartHandshake: "🤝", Utensils: "🍽", Cog: "⚙️",
  HardHat: "👷", Zap: "⚡", Monitor: "💻", Cpu: "🔌", Car: "🚗", Pill: "💊",
  Shirt: "👕", Flame: "🔥", Smartphone: "📱", Truck: "🚛", DraftingCompass: "📐",
  Thermometer: "🌡", Microscope: "🔬", Stethoscope: "🩺", Radio: "📡", Sparkles: "✨",
  Sprout: "🌱", Plane: "✈️", PartyPopper: "🎉", Clapperboard: "🎬",
  Shield: "🛡", FileCheck: "✅", LineChart: "📉", PieChart: "🥧",
  Sigma: "∑", Globe: "🌍", Users: "👥", Award: "🏆",
};

function getIcon(iconName: string): string {
  return iconMap[iconName] || "📌";
}

interface DecisionTreeViewProps {
  node: DecisionTreeNode;
  selectedNodeId: string | null;
  onSelect: (node: DecisionTreeNode) => void;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  depth: number;
  searchQuery: string;
}

function DecisionTreeNodeCard({
  node,
  selectedNodeId,
  onSelect,
  expandedIds,
  onToggle,
  depth,
  searchQuery,
}: DecisionTreeViewProps) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedNodeId === node.id;
  const matchesSearch = searchQuery && node.name.toLowerCase().includes(searchQuery.toLowerCase());

  // Auto-expand ancestors for search matches
  const shouldShow = depth === 0 || expandedIds.has(node.id) || true; // always render if in tree

  const colorGradient = node.color || "from-slate-500 to-slate-400";
  const [from, to] = colorGradient.replace("from-", "").replace("to-", "").split(" to-");
  const bgFrom = from || "brand-royal";
  const bgTo = to || "brand-electric";

  return (
    <div className="relative">
      {/* Connector line from parent (not for root) */}
      {depth > 0 && (
        <div className="absolute left-0 top-0 bottom-0 w-px bg-neutral-lightGray/60"
             style={{ left: depth === 1 ? "0px" : "-20px", top: "-16px" }} />
      )}

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: depth * 0.05 }}
        className={`relative ${depth > 0 ? "ml-5" : ""}`}
      >
        {/* Horizontal connector */}
        {depth > 0 && (
          <div className="absolute top-1/2 -translate-y-1/2 h-px bg-neutral-lightGray/60"
               style={{ left: "-20px", width: "16px" }} />
        )}

        <div
          onClick={() => {
            onSelect(node);
            if (hasChildren) onToggle(node.id);
          }}
          className={`group flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all border text-left ${
            isSelected
              ? "bg-white border-brand-sky shadow-brand-hover ring-2 ring-brand-sky/20"
              : matchesSearch
              ? "bg-yellow-50 border-yellow-300 shadow-sm"
              : "bg-white/60 border-neutral-lightGray/50 hover:border-brand-royal/30 hover:shadow-sm"
          } ${depth === 0 ? "w-64" : depth === 1 ? "w-56" : depth <= 2 ? "w-48" : "w-44"}`}
        >
          {/* Expand/Collapse arrow */}
          {hasChildren ? (
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.15 }}
              className="text-neutral-lightGray group-hover:text-brand-royal shrink-0"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </motion.div>
          ) : (
            <div className="w-3.5 shrink-0" />
          )}

          {/* Color indicator */}
          <div
            className={`h-2 w-2 rounded-full shrink-0`}
            style={{ backgroundColor: bgFrom.includes("brand") ? undefined : bgFrom }}
          />

          {/* Node name */}
          <div className="flex-1 min-w-0">
            <p className={`font-semibold truncate ${
              depth === 0 ? "text-sm" : "text-xs"
            } text-neutral-nearBlack group-hover:text-brand-royal transition-colors`}>
              {node.name}
            </p>
            {depth === 0 && (
              <p className="text-[10px] text-neutral-darkGray truncate mt-0.5">{node.shortDescription}</p>
            )}
          </div>

          {/* Child count badge */}
          {hasChildren && (
            <span className="text-[10px] font-medium text-neutral-darkGray bg-brand-bg px-1.5 py-0.5 rounded-full shrink-0">
              {node.children.length}
            </span>
          )}

          {/* Salary hint for leaf nodes */}
          {!hasChildren && node.salaryRanges.entry && (
            <span className="text-[10px] font-medium text-green-600 shrink-0 hidden sm:inline">
              {node.salaryRanges.entry}
            </span>
          )}
        </div>

        {/* Children */}
        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="space-y-1.5 pt-1.5" style={{ borderLeft: depth === 0 ? undefined : undefined }}>
                {node.children.map((child) => (
                  <DecisionTreeNodeCard
                    key={child.id}
                    node={child}
                    selectedNodeId={selectedNodeId}
                    onSelect={onSelect}
                    expandedIds={expandedIds}
                    onToggle={onToggle}
                    depth={depth + 1}
                    searchQuery={searchQuery}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// Main view wraps the root node and handles pan
interface TreeViewProps {
  root: DecisionTreeNode;
  selectedNodeId: string | null;
  onSelect: (node: DecisionTreeNode) => void;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  searchQuery: string;
  zoom: number;
  pan: { x: number; y: number };
  onPanStart: () => void;
  onPanning: (dx: number, dy: number) => void;
  onPanEnd: () => void;
}

export function DecisionTreeView({
  root,
  selectedNodeId,
  onSelect,
  expandedIds,
  onToggle,
  searchQuery,
  zoom,
  pan,
  onPanStart,
  onPanning,
  onPanEnd,
}: TreeViewProps) {
  return (
    <div
      className="overflow-hidden rounded-2xl bg-white border border-neutral-lightGray/50"
      style={{ height: "calc(100vh - 16rem)", cursor: "grab" }}
      onMouseDown={(e) => {
        onPanStart();
        const startX = e.clientX;
        const startY = e.clientY;
        const handleMove = (ev: MouseEvent) => {
          onPanning(ev.clientX - startX, ev.clientY - startY);
        };
        const handleUp = () => {
          onPanEnd();
          document.removeEventListener("mousemove", handleMove);
          document.removeEventListener("mouseup", handleUp);
        };
        document.addEventListener("mousemove", handleMove);
        document.addEventListener("mouseup", handleUp);
      }}
    >
      <div
        className="p-6"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "top left",
          transition: "transform 0.1s ease-out",
        }}
      >
        <DecisionTreeNodeCard
          node={root}
          selectedNodeId={selectedNodeId}
          onSelect={onSelect}
          expandedIds={expandedIds}
          onToggle={onToggle}
          depth={0}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
}
