const TAILWIND_COLORS: Record<string, string> = {
  slate: "#64748b", gray: "#6b7280", zinc: "#71717a", neutral: "#737373", stone: "#78716c",
  red: "#ef4444", orange: "#f97316", amber: "#f59e0b", yellow: "#eab308", lime: "#84cc16",
  green: "#22c55e", emerald: "#10b981", teal: "#14b8a6", cyan: "#06b6d4", sky: "#0ea5e9",
  blue: "#3b82f6", indigo: "#6366f1", violet: "#8b5cf6", purple: "#a855f7", fuchsia: "#d946ef",
  pink: "#ec4899", rose: "#f43f5e",
  "brand-navy": "#0B1E3A", "brand-royal": "#0056D2", "brand-electric": "#1E90FF",
  "brand-sky": "#4DB8FF", "brand-coral": "#FF6B6B",
};

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function extractNodeColors(colorClass: string): { bg: string; border: string; text: string } {
  // Parse "from-<color>-<shade> to-<color>-<shade>"
  const fromMatch = colorClass.match(/from-([a-z-]+)(?:-\d+)?/);
  const colorName = fromMatch ? fromMatch[1] : null;
  const hex = TAILWIND_COLORS[colorName || ""] || "#64748b";

  return {
    bg: hexToRgba(hex, 0.1),
    border: hexToRgba(hex, 0.5),
    text: hex,
  };
}
