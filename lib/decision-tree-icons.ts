// Runtime icon lookup — resolves string names to emoji fallbacks
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

export function getIcon(iconName: string): string {
  return iconMap[iconName] || "📌";
}
