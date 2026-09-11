import { sanitize } from "isomorphic-dompurify";

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Uses DOMPurify with a strict configuration that:
 * - Allows safe HTML5 elements and attributes
 * - Strips all script tags, event handlers, and dangerous protocols
 * - For SVGs, only allows safe SVG elements and presentation attributes
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";
  return sanitize(html, {
    ALLOWED_TAGS: [
      // Basic text formatting
      "a", "abbr", "acronym", "address", "b", "bdi", "bdo", "big", "blockquote",
      "br", "caption", "cite", "code", "col", "colgroup", "data", "dd", "del",
      "dfn", "div", "dl", "dt", "em", "figcaption", "figure", "footer", "header",
      "h1", "h2", "h3", "h4", "h5", "h6", "hr", "i", "img", "ins", "kbd",
      "li", "main", "mark", "meta", "nav", "ol", "p", "pre", "q", "rb", "rp",
      "rt", "rtc", "ruby", "s", "samp", "section", "small", "source", "span",
      "strong", "sub", "summary", "sup", "table", "tbody", "td", "tfoot", "th",
      "thead", "time", "tr", "track", "u", "ul", "var", "wbr",
      // SVG elements (safe subset)
      "svg", "g", "path", "rect", "circle", "ellipse", "line", "polyline",
      "polygon", "text", "tspan", "defs", "use", "symbol", "marker", "linearGradient",
      "radialGradient", "stop", "clipPath", "mask", "pattern", "filter", "feGaussianBlur",
      "feOffset", "feMerge", "feMergeNode", "feColorMatrix", "feBlend", "title",
      "desc", "image", "foreignObject", "switch",
    ],
    ALLOWED_ATTR: [
      // Global attributes
      "id", "class", "title", "style", "role", "aria-label", "aria-hidden",
      "aria-describedby", "data-*",
      // Link attributes
      "href", "target", "rel", "download",
      // Image attributes
      "src", "alt", "width", "height", "loading", "decoding",
      // Table attributes
      "colspan", "rowspan", "headers", "scope", "abbr", "align", "valign",
      "width", "height", "border", "cellpadding", "cellspacing",
      // Input/form attributes (safe subset)
      "type", "name", "value", "placeholder", "disabled", "readonly", "required",
      // SVG attributes
      "xmlns", "viewBox", "preserveAspectRatio", "width", "height", "x", "y",
      "cx", "cy", "r", "rx", "ry", "x1", "y1", "x2", "y2",
      "points", "d", "fill", "stroke", "stroke-width", "stroke-linecap",
      "stroke-linejoin", "stroke-dasharray", "stroke-opacity", "fill-opacity",
      "opacity", "transform", "transform-origin", "gradientUnits", "gradientTransform",
      "offset", "stop-color", "stop-opacity", "markerWidth", "markerHeight",
      "markerUnits", "refX", "refY", "orient", "clipPathUnits", "maskUnits",
      "filterUnits", "primitiveUnits", "in", "in2", "result", "stdDeviation",
      "dx", "dy", "mode", "values", "type", "xlink:href", "href", "xlink:title",
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    FORBID_TAGS: ["script", "style", "iframe", "embed", "object", "frame", "frameset",
      "applet", "meta", "link", "base", "noscript", "noframes", "html", "body",
      "head", "input", "button", "select", "option", "textarea", "form",
      "fieldset", "legend", "label", "output", "progress", "meter",
      "details", "dialog", "menu", "menuitem", "summary", "template", "slot",
      "canvas", "video", "audio", "source", "track", "map", "area", "param",
      "picture", "col", "optgroup", "datalist", "output", "keygen", "object"],
    FORBID_ATTR: ["on*", "onload", "onerror", "onclick", "onmouseover", "onmouseout",
      "onfocus", "onblur", "onchange", "onsubmit", "onkeydown", "onkeyup",
      "onkeypress", "onanimationstart", "onanimationend", "onanimationiteration",
      "ontransitionend", "style", "xmlns", "xmlns:*"],
    ADD_TAGS: [],
    ADD_ATTR: [],
    ADD_URI_SAFE_ATTR: [],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    FORCE_BODY: true,
    SANITIZE_DOM: true,
    WHOLE_DOCUMENT: false,
  });
}

/**
 * Sanitize HTML specifically for SVG content.
 * More restrictive - only allows safe SVG presentation elements.
 */
export function sanitizeSvg(svg: string): string {
  if (!svg) return "";
  return sanitize(svg, {
    ALLOWED_TAGS: [
      "svg", "g", "path", "rect", "circle", "ellipse", "line", "polyline",
      "polygon", "text", "tspan", "defs", "use", "symbol", "marker",
      "linearGradient", "radialGradient", "stop", "clipPath", "mask",
      "pattern", "filter", "feGaussianBlur", "feOffset", "feMerge",
      "feMergeNode", "feColorMatrix", "feBlend", "title", "desc", "image",
      "foreignObject", "switch",
    ],
    ALLOWED_ATTR: [
      "xmlns", "viewBox", "preserveAspectRatio", "width", "height", "x", "y",
      "cx", "cy", "r", "rx", "ry", "x1", "y1", "x2", "y2",
      "points", "d", "fill", "stroke", "stroke-width", "stroke-linecap",
      "stroke-linejoin", "stroke-dasharray", "stroke-opacity", "fill-opacity",
      "opacity", "transform", "transform-origin", "gradientUnits", "gradientTransform",
      "offset", "stop-color", "stop-opacity", "markerWidth", "markerHeight",
      "markerUnits", "refX", "refY", "orient", "clipPathUnits", "maskUnits",
      "filterUnits", "primitiveUnits", "in", "in2", "result", "stdDeviation",
      "dx", "dy", "mode", "values", "type", "xlink:href", "href", "xlink:title",
      "id", "class", "role", "aria-label", "aria-hidden",
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    FORBID_TAGS: ["script", "style", "animate", "animateTransform", "animateMotion",
      "set", "discard", "foreignObject"],
    FORBID_ATTR: ["on*", "style", "xmlns:*"],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    FORCE_BODY: true,
    SANITIZE_DOM: true,
  });
}