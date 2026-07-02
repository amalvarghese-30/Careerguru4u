"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { TrendingUp } from "lucide-react";
import type { FlowNodeData } from "@/lib/decision-tree-layout";
import { extractNodeColors } from "@/lib/decision-tree-colors";
import { getIcon } from "@/lib/decision-tree-icons";

const DecisionTreeFlowNode = memo(({ data }: NodeProps<FlowNodeData>) => {
  const { name, shortDescription, nodeLevel, isSearchMatch, isSearchDimmed, isSelected, depth, color, iconName, salaryRanges, children } = data;
  const colors = extractNodeColors(color);
  const icon = getIcon(iconName);
  const hasChildren = children.length > 0;

  // Build class based on state
  let cardClass = "relative rounded-xl border-2 transition-all duration-200 ";
  let nameClass = "";
  let descClass = "text-neutral-darkGray truncate ";

  switch (nodeLevel) {
    case "root":
      cardClass += "shadow-lg overflow-hidden flex items-center gap-3 px-4 py-3";
      nameClass = "text-sm font-bold text-white";
      descClass = "text-[10px] text-white/80 truncate";
      break;
    case "stream":
      cardClass += "bg-white shadow-sm flex items-center gap-2.5 px-3 py-2.5 cursor-pointer hover:shadow-md";
      nameClass = "text-sm font-semibold text-neutral-nearBlack";
      descClass = "text-[10px] text-neutral-darkGray truncate";
      break;
    case "branch":
      cardClass += "bg-white shadow-sm flex items-center gap-2 px-3 py-2 cursor-pointer hover:shadow-md";
      nameClass = "text-xs font-semibold text-neutral-nearBlack";
      break;
    case "leaf":
      cardClass += "bg-white shadow-sm flex items-center gap-2 px-2.5 py-1.5 cursor-pointer hover:shadow-md";
      nameClass = "text-[11px] font-medium text-neutral-nearBlack";
      break;
  }

  if (isSelected) {
    cardClass += " ring-2 ring-brand-sky shadow-brand-hover border-brand-sky";
  } else if (isSearchMatch) {
    cardClass += " bg-yellow-50 border-yellow-400 shadow-yellow-100";
  } else if (nodeLevel !== "root") {
    cardClass += " border-neutral-lightGray/50";
  }

  if (isSearchDimmed) {
    cardClass += " opacity-30";
  }

  return (
    <div className={cardClass} style={nodeLevel === "root" ? { background: `linear-gradient(135deg, ${colors.text}, ${colors.border})` } : undefined}>
      {/* Handles */}
      {depth > 0 && <Handle type="target" position={Position.Top} className="!bg-slate-300 !w-2 !h-2" />}
      {hasChildren && (
        <Handle type="source" position={Position.Bottom} className="!bg-brand-electric !w-3 !h-3 !border-2 !border-white !shadow-sm" />
      )}

      {/* Color accent bar for non-root nodes */}
      {nodeLevel !== "root" && (
        <div className="absolute left-0 top-1 bottom-1 w-1 rounded-full" style={{ backgroundColor: colors.text }} />
      )}

      {/* Icon */}
      {nodeLevel === "root" ? (
        <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 text-xl">
          {icon}
        </div>
      ) : (
        <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-base ml-0.5" style={{ backgroundColor: colors.bg }}>
          {icon}
        </div>
      )}

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <p className={nameClass}>{name}</p>
        {(nodeLevel === "root" || nodeLevel === "stream") && shortDescription && (
          <p className={descClass}>{shortDescription}</p>
        )}
      </div>

      {/* Child count badge (stream/branch) */}
      {hasChildren && nodeLevel !== "root" && (
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white shrink-0" style={{ backgroundColor: colors.text }}>
          {children.length}
        </span>
      )}

      {/* Salary hint (leaf) */}
      {!hasChildren && salaryRanges.entry && (
        <span className="text-[10px] font-medium text-green-600 shrink-0 flex items-center gap-0.5">
          <TrendingUp className="h-2.5 w-2.5" />
          {salaryRanges.entry}
        </span>
      )}
    </div>
  );
});

DecisionTreeFlowNode.displayName = "DecisionTreeFlowNode";
export { DecisionTreeFlowNode };
