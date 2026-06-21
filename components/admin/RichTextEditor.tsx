"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { Placeholder } from "@tiptap/extension-placeholder";
import { useState, useCallback, useEffect } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Quote, Code, Image as ImageIcon, Link as LinkIcon,
  Undo2, Redo2, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Table as TableIcon, Heading, Palette, Highlighter, ChevronDown
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  label?: string;
  editable?: boolean;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Start typing...",
  label,
  editable = true,
}: RichTextEditorProps) {
  const [tableMenuOpen, setTableMenuOpen] = useState(false);
  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [headingMenuOpen, setHeadingMenuOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-brand-royal underline cursor-pointer" },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-lg max-w-full" },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  const addTable = useCallback(
    (rows: number, cols: number) => {
      editor?.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
      setTableMenuOpen(false);
    },
    [editor]
  );

  const addImage = useCallback(() => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      const alt = window.prompt("Enter alt text (optional):") || "";
      editor?.chain().focus().setImage({ src: url, alt }).run();
    }
  }, [editor]);

  const setLink = useCallback(() => {
    const prevUrl = editor?.getAttributes("link").href || "";
    const url = window.prompt("Enter link URL:", prevUrl);
    if (url === null) return;
    if (url === "") {
      editor?.chain().focus().unsetLink().run();
    } else {
      editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  const ToolbarButton = ({
    onClick, active, title, children
  }: {
    onClick: () => void; active: boolean; title: string; children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-md text-sm transition-colors ${
        active
          ? "bg-brand-royal text-white"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
      }`}
    >
      {children}
    </button>
  );

  const headingLevel = editor.isActive("heading", { level: 1 })
    ? "h1"
    : editor.isActive("heading", { level: 2 })
    ? "h2"
    : editor.isActive("heading", { level: 3 })
    ? "h3"
    : "p";

  return (
    <div className="flex flex-col">
      {label && (
        <label className="block text-xs font-semibold text-slate-500 mb-2">{label}</label>
      )}

      <div
        className={`border border-slate-200 rounded-xl overflow-hidden transition-all ${
          editor.isFocused ? "border-brand-royal ring-1 ring-brand-royal/20" : ""
        }`}
      >
        {/* Toolbar */}
        {editable && (
          <div className="bg-brand-bg/50 border-b border-slate-200 px-3 py-2">
            {/* Row 1: Text formatting */}
            <div className="flex items-center gap-0.5 flex-wrap">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                active={editor.isActive("bold")}
                title="Bold (Ctrl+B)"
              >
                <Bold className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                active={editor.isActive("italic")}
                title="Italic (Ctrl+I)"
              >
                <Italic className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                active={editor.isActive("underline")}
                title="Underline (Ctrl+U)"
              >
                <UnderlineIcon className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                active={editor.isActive("strike")}
                title="Strikethrough"
              >
                <Strikethrough className="h-4 w-4" />
              </ToolbarButton>

              <div className="w-px h-5 bg-slate-200 mx-1" />

              {/* Heading dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setHeadingMenuOpen(!headingMenuOpen)}
                  className={`p-1.5 rounded-md text-sm transition-colors flex items-center gap-0.5 ${
                    headingLevel !== "p" ? "bg-brand-royal text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                  title="Heading"
                >
                  <Heading className="h-4 w-4" />
                  <ChevronDown className="h-3 w-3" />
                </button>
                {headingMenuOpen && (
                  <div
                    className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20 min-w-[130px]"
                    onMouseLeave={() => setHeadingMenuOpen(false)}
                    onClick={() => setHeadingMenuOpen(false)}
                  >
                    {[
                      { label: "Paragraph", action: () => editor.chain().focus().setParagraph().run(), active: headingLevel === "p" },
                      { label: "Heading 1", action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: headingLevel === "h1" },
                      { label: "Heading 2", action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: headingLevel === "h2" },
                      { label: "Heading 3", action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: headingLevel === "h3" },
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={item.action}
                        className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                          item.active ? "bg-brand-royal/10 text-brand-royal font-medium" : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-px h-5 bg-slate-200 mx-1" />

              {/* Text color */}
              <div className="relative">
                <ToolbarButton
                  onClick={() => setColorMenuOpen(!colorMenuOpen)}
                  active={colorMenuOpen}
                  title="Text Color"
                >
                  <Palette className="h-4 w-4" />
                </ToolbarButton>
                {colorMenuOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-2 z-20">
                    <div className="grid grid-cols-5 gap-1">
                      {["#000000", "#434343", "#666666", "#999999", "#b7b7b7", "#cc0000", "#e06666", "#f6b26b", "#ffd966", "#93c47d", "#38761d", "#6fa8dc", "#0b5394", "#8e7cc3", "#674ea7"].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => { editor.chain().focus().setColor(c).run(); setColorMenuOpen(false); }}
                          className="w-6 h-6 rounded border border-slate-200 hover:scale-110 transition-transform"
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => { editor.chain().focus().unsetColor().run(); setColorMenuOpen(false); }}
                      className="w-full mt-1.5 text-xs text-slate-500 hover:text-slate-700 py-1"
                    >
                      Reset color
                    </button>
                  </div>
                )}
              </div>

              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                active={editor.isActive("highlight")}
                title="Highlight"
              >
                <Highlighter className="h-4 w-4" />
              </ToolbarButton>

              <div className="w-px h-5 bg-slate-200 mx-1" />

              <ToolbarButton onClick={() => editor.chain().focus().undo().run()} active={false} title="Undo">
                <Undo2 className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().redo().run()} active={false} title="Redo">
                <Redo2 className="h-4 w-4" />
              </ToolbarButton>
            </div>

            {/* Row 2: Structure & media */}
            <div className="flex items-center gap-0.5 flex-wrap mt-1.5 pt-1.5 border-t border-slate-200/60">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                active={editor.isActive("bulletList")}
                title="Bullet List"
              >
                <List className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                active={editor.isActive("orderedList")}
                title="Numbered List"
              >
                <ListOrdered className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                active={editor.isActive("blockquote")}
                title="Blockquote"
              >
                <Quote className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                active={editor.isActive("codeBlock")}
                title="Code Block"
              >
                <Code className="h-4 w-4" />
              </ToolbarButton>

              <div className="w-px h-5 bg-slate-200 mx-1" />

              <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign("left").run()}
                active={editor.isActive({ textAlign: "left" })}
                title="Align Left"
              >
                <AlignLeft className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign("center").run()}
                active={editor.isActive({ textAlign: "center" })}
                title="Align Center"
              >
                <AlignCenter className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign("right").run()}
                active={editor.isActive({ textAlign: "right" })}
                title="Align Right"
              >
                <AlignRight className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign("justify").run()}
                active={editor.isActive({ textAlign: "justify" })}
                title="Justify"
              >
                <AlignJustify className="h-4 w-4" />
              </ToolbarButton>

              <div className="w-px h-5 bg-slate-200 mx-1" />

              <ToolbarButton
                onClick={setLink}
                active={editor.isActive("link")}
                title="Insert Link"
              >
                <LinkIcon className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={addImage}
                active={false}
                title="Insert Image"
              >
                <ImageIcon className="h-4 w-4" />
              </ToolbarButton>

              {/* Table dropdown */}
              <div className="relative">
                <ToolbarButton
                  onClick={() => setTableMenuOpen(!tableMenuOpen)}
                  active={editor.isActive("table")}
                  title="Insert Table"
                >
                  <TableIcon className="h-4 w-4" />
                  <ChevronDown className="h-3 w-3 ml-0.5" />
                </ToolbarButton>
                {tableMenuOpen && (
                  <div
                    className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-3 z-20"
                    onMouseLeave={() => setTableMenuOpen(false)}
                  >
                    <p className="text-xs text-slate-500 mb-2">Insert Table</p>
                    <div className="grid grid-cols-6 gap-0.5 mb-2">
                      {Array.from({ length: 6 }).map((_, row) =>
                        Array.from({ length: 6 }).map((_, col) => (
                          <button
                            key={`${row}-${col}`}
                            type="button"
                            onClick={() => addTable(row + 1, col + 1)}
                            onMouseEnter={() => {
                              // Highlight cells
                            }}
                            className={`w-5 h-5 rounded-sm border transition-colors ${
                              row < 3 && col < 3
                                ? "bg-brand-royal/30 border-brand-royal"
                                : "bg-slate-100 border-slate-200 hover:bg-slate-200"
                            }`}
                            title={`${row + 1} x ${col + 1}`}
                          />
                        ))
                      )}
                    </div>
                    <p className="text-xs text-slate-400">Click grid to insert</p>
                  </div>
                )}
              </div>

              {editor.isActive("table") && (
                <>
                  <div className="w-px h-5 bg-slate-200 mx-1" />
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().addColumnBefore().run()}
                    className="px-2 py-1 text-xs rounded text-slate-500 hover:bg-slate-100"
                    title="Add Column Before"
                  >
                    +Col
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().addColumnAfter().run()}
                    className="px-2 py-1 text-xs rounded text-slate-500 hover:bg-slate-100"
                    title="Add Column After"
                  >
                    Col+
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().addRowBefore().run()}
                    className="px-2 py-1 text-xs rounded text-slate-500 hover:bg-slate-100"
                    title="Add Row Before"
                  >
                    +Row
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().addRowAfter().run()}
                    className="px-2 py-1 text-xs rounded text-slate-500 hover:bg-slate-100"
                    title="Add Row After"
                  >
                    Row+
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().deleteTable().run()}
                    className="px-2 py-1 text-xs rounded text-red-500 hover:bg-red-50"
                    title="Delete Table"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Editor Content */}
        <div className="relative">
          <EditorContent
            editor={editor}
            className="prose prose-sm max-w-none [&_.ProseMirror]:min-h-[180px] [&_.ProseMirror]:px-4 [&_.ProseMirror]:py-3 [&_.ProseMirror]:outline-none [&_.ProseMirror]:text-sm [&_.ProseMirror]:text-slate-700 [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-slate-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_table]:border-collapse [&_.ProseMirror_table]:w-full [&_.ProseMirror_th]:border [&_.ProseMirror_th]:border-slate-300 [&_.ProseMirror_th]:px-3 [&_.ProseMirror_th]:py-2 [&_.ProseMirror_th]:bg-slate-50 [&_.ProseMirror_th]:text-left [&_.ProseMirror_th]:font-semibold [&_.ProseMirror_th]:text-sm [&_.ProseMirror_td]:border [&_.ProseMirror_td]:border-slate-300 [&_.ProseMirror_td]:px-3 [&_.ProseMirror_td]:py-2 [&_.ProseMirror_td]:text-sm [&_.ProseMirror_blockquote]:border-l-3 [&_.ProseMirror_blockquote]:border-brand-royal/30 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:text-slate-500 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_code]:bg-slate-100 [&_.ProseMirror_code]:text-slate-700 [&_.ProseMirror_code]:px-1.5 [&_.ProseMirror_code]:py-0.5 [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:text-xs [&_.ProseMirror_pre]:bg-slate-900 [&_.ProseMirror_pre]:text-slate-100 [&_.ProseMirror_pre]:p-4 [&_.ProseMirror_pre]:rounded-lg [&_.ProseMirror_pre_code]:bg-transparent [&_.ProseMirror_pre_code]:text-inherit [&_.ProseMirror_img]:rounded-lg [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_hr]:border-slate-200 [&_.ProseMirror_h1]:text-xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h2]:text-lg [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h3]:text-base [&_.ProseMirror_h3]:font-semibold"
          />
        </div>
      </div>
    </div>
  );
}
