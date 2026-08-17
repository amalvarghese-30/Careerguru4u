"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search } from "lucide-react";

/** A styled label cell for the left column of comparison tables */
export function CompareLabel({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 py-4 text-neutral-darkGray font-medium">
      <Icon className="h-4 w-4 text-brand-royal shrink-0" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

/** A single row in the comparison table */
export function CompareTableRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode[];
}) {
  return (
    <tr className="border-b border-neutral-lightGray/50">
      <td className="py-4 px-4 bg-white sticky left-0 z-10">
        <div className="flex items-center gap-2 text-neutral-darkGray">
          <Icon className="h-4 w-4 text-brand-royal shrink-0" />
          <span className="font-medium text-sm">{label}</span>
        </div>
      </td>
      {children.map((child, i) => (
        <td key={i} className="py-4 px-4">
          {child}
        </td>
      ))}
    </tr>
  );
}

/** Highlight the "best" item in a row by returning a CSS class */
export function bestHighlightClass(
  index: number,
  values: (number | undefined)[],
  higherIsBetter: boolean = true
): string {
  const clean = values.map((v) => v ?? (higherIsBetter ? -Infinity : Infinity));
  const bestVal = higherIsBetter
    ? Math.max(...clean)
    : Math.min(...clean.filter((v) => v !== Infinity));
  if (clean[index] === bestVal && clean.filter((v) => v === bestVal).length === 1) {
    return "bg-emerald-50 border border-emerald-200 rounded-lg";
  }
  return "";
}

/** Display "—" when value is missing */
export function safeStr(val: unknown): string {
  if (val === null || val === undefined || val === "") return "—";
  if (typeof val === "number") return val.toString();
  return String(val);
}

/** Searchable modal for adding items to comparison */
interface SelectableItem {
  slug: string;
  name: string;
  subtitle?: string;
  logoUrl?: string;
}

export function AddItemModal({
  open,
  onClose,
  items,
  onSelect,
  title,
  placeholder = "Search...",
  maxItems = 4,
  currentCount,
}: {
  open: boolean;
  onClose: () => void;
  items: SelectableItem[];
  onSelect: (item: SelectableItem) => void;
  title: string;
  placeholder?: string;
  maxItems?: number;
  currentCount: number;
}) {
  const [search, setSearch] = useState("");
  const [added, setAdded] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setSearch("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const filtered = items.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.subtitle || "").toLowerCase().includes(q)
    );
  });

  const handleSelect = (item: SelectableItem) => {
    if (currentCount + added.size >= maxItems) return;
    setAdded((prev) => new Set(prev).add(item.slug));
    onSelect(item);
  };

  const atLimit = currentCount + added.size >= maxItems;

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full mx-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-neutral-nearBlack">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-neutral-lightGray/30 transition-colors"
              >
                <X className="h-5 w-5 text-neutral-mediumGray" />
              </button>
            </div>

            {atLimit && (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-3">
                Maximum {maxItems} items for comparison.
              </p>
            )}

            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-mediumGray" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-lightGray bg-brand-bg text-sm text-neutral-darkGray placeholder:text-neutral-mediumGray focus:outline-none focus:ring-2 focus:ring-brand-royal/30 focus:border-brand-royal transition-all"
              />
            </div>

            <div className="space-y-1 max-h-72 overflow-y-auto">
              {filtered.map((item) => {
                const isAdded = added.has(item.slug);
                return (
                  <button
                    key={item.slug}
                    onClick={() => !isAdded && handleSelect(item)}
                    disabled={isAdded || atLimit}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${
                      isAdded
                        ? "bg-emerald-50 cursor-default"
                        : "hover:bg-brand-bg active:scale-[0.99]"
                    }`}
                  >
                    {item.logoUrl && (
                      <img
                        src={item.logoUrl}
                        alt={item.name}
                        className="w-8 h-8 rounded-lg object-cover shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="font-medium text-neutral-nearBlack truncate">
                        {item.name}
                        {isAdded && (
                          <span className="ml-2 text-xs text-emerald-600 font-medium">
                            Added
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <div className="text-xs text-neutral-mediumGray truncate">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <p className="text-center text-neutral-mediumGray py-6 text-sm">
                  No results for &ldquo;{search}&rdquo;
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              className="mt-4 w-full py-2.5 rounded-xl border border-neutral-lightGray text-neutral-darkGray hover:bg-neutral-lightGray/20 transition-colors font-medium text-sm"
            >
              Done
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/** Small empty-state illustration */
export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-royal/10 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-brand-royal/50" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-darkGray mb-1">
        {title}
      </h3>
      <p className="text-sm text-neutral-mediumGray max-w-sm">{description}</p>
    </div>
  );
}
