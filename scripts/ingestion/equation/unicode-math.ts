/**
 * Unicode math character maps — superscript, subscript, Greek, and symbol tables.
 */

export const SUPERSCRIPTS: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
  "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
};

export const SUPERSCRIPT_LETTERS: Record<string, string> = {
  a: "ᵃ", b: "ᵇ", c: "ᶜ", d: "ᵈ", e: "ᵉ", f: "ᶠ", g: "ᵍ",
  h: "ʰ", i: "ⁱ", j: "ʲ", k: "ᵏ", l: "ˡ", m: "ᵐ", n: "ⁿ",
  o: "ᵒ", p: "ᵖ", r: "ʳ", s: "ˢ", t: "ᵗ", u: "ᵘ", v: "ᵛ",
  w: "ʷ", x: "ˣ", y: "ʸ", z: "ᶻ", "-": "⁻", "+": "⁺",
  "(": "⁽", ")": "⁾",
};

export const SUBSCRIPTS: Record<string, string> = {
  "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
  "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
  a: "ₐ", e: "ₑ", i: "ᵢ", o: "ₒ", u: "ᵤ", x: "ₓ",
  "+": "₊", "-": "₋",
};

export const GREEK_TO_UNICODE: Record<string, string> = {
  "\\pi": "π", "\\Pi": "Π",
  "\\theta": "θ", "\\Theta": "Θ",
  "\\alpha": "α", "\\Alpha": "Α",
  "\\beta": "β", "\\Beta": "Β",
  "\\gamma": "γ", "\\Gamma": "Γ",
  "\\delta": "δ", "\\Delta": "Δ",
  "\\lambda": "λ", "\\Lambda": "Λ",
  "\\mu": "μ", "\\Mu": "Μ",
  "\\sigma": "σ", "\\Sigma": "Σ",
  "\\rho": "ρ", "\\Rho": "Ρ",
  "\\omega": "ω", "\\Omega": "Ω",
  "\\phi": "φ", "\\Phi": "Φ",
  "\\epsilon": "ε", "\\varepsilon": "ε",
  "\\eta": "η", "\\Eta": "Η",
  "\\kappa": "κ", "\\Kappa": "Κ",
  "\\nu": "ν", "\\Nu": "Ν",
  "\\tau": "τ", "\\Tau": "Τ",
  "\\xi": "ξ", "\\Xi": "Ξ",
  "\\zeta": "ζ", "\\Zeta": "Ζ",
  "\\psi": "ψ", "\\Psi": "Ψ",
  "\\chi": "χ", "\\Chi": "Χ",
};

export const LATEX_SYMBOLS: Record<string, string> = {
  "\\infty": "∞", "\\sum": "∑", "\\int": "∫", "\\prod": "∏",
  "\\therefore": "∴", "\\because": "∵",
  "\\pm": "±", "\\mp": "∓", "\\div": "÷",
  "\\times": "×", "\\cdot": "·",
  "\\leq": "≤", "\\geq": "≥", "\\neq": "≠",
  "\\approx": "≈", "\\equiv": "≡",
  "\\angle": "∠", "\\triangle": "△",
  "\\degree": "°", "\\deg": "°",
  "\\sqrt": "√",
  "\\to": "→", "\\rightarrow": "→", "\\leftarrow": "←",
  "\\Rightarrow": "⇒", "\\Leftrightarrow": "⇔",
  "\\perp": "⟂", "\\parallel": "∥",
  "\\sim": "∼", "\\cong": "≅",
  "\\subset": "⊂", "\\subseteq": "⊆",
  "\\supset": "⊃", "\\supseteq": "⊇",
  "\\in": "∈", "\\notin": "∉", "\\ni": "∋",
  "\\forall": "∀", "\\exists": "∃",
  "\\cup": "∪", "\\cap": "∩",
  "\\emptyset": "∅", "\\varnothing": "∅",
  "\\partial": "∂", "\\nabla": "∇",
  "\\propto": "∝", "\\oplus": "⊕", "\\otimes": "⊗",
  "\\left( ":"(", "\\right)": ")",
  "\\left[": "[", "\\right]": "]",
  "\\langle": "⟨", "\\rangle": "⟩",
  "\\lfloor": "⌊", "\\rfloor": "⌋",
  "\\lceil": "⌈", "\\rceil": "⌉",
};

export function numToSuperscript(num: number | string): string {
  return String(num).split("").map((d) => SUPERSCRIPTS[d] || d).join("");
}

export function numToSubscript(num: number | string): string {
  return String(num).split("").map((d) => SUBSCRIPTS[d] || d).join("");
}

export function superscriptLetter(s: string): string {
  return s.split("").map((c) => SUPERSCRIPT_LETTERS[c] || c).join("");
}

export function subscriptChar(c: string): string {
  return SUBSCRIPTS[c] || c;
}

export function subscriptString(s: string): string {
  return s.split("").map((c) => subscriptChar(c)).join("");
}
