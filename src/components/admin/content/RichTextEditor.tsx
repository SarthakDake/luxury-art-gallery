"use client";

import { useRef, useState } from "react";
import { Bold, Heading2, Heading3, List, Eye, PencilLine } from "lucide-react";
import { RichText } from "@/components/ui/RichText";
import { prefixLines, wrapSelection } from "@/lib/rich-text";

type FormatAction = "bold" | "h2" | "h3" | "list";

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  label = "Formatted text",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  function applyFormat(action: FormatAction) {
    const el = textareaRef.current;
    if (!el) {
      return;
    }

    const start = el.selectionStart;
    const end = el.selectionEnd;
    let next: { value: string; selectionStart: number; selectionEnd: number };

    switch (action) {
      case "bold":
        next = wrapSelection(value, start, end, "**");
        break;
      case "h2":
        next = prefixLines(value, start, end, "## ");
        break;
      case "h3":
        next = prefixLines(value, start, end, "### ");
        break;
      case "list":
        next = prefixLines(value, start, end, "- ");
        break;
      default:
        return;
    }

    onChange(next.value);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(next.selectionStart, next.selectionEnd);
    });
  }

  return (
    <div className="rich-text-editor">
      <div className="rich-text-editor-toolbar">
        <div className="rich-text-editor-formats" role="toolbar" aria-label={label}>
          <button
            type="button"
            className="rich-text-editor-btn"
            onClick={() => applyFormat("bold")}
            title="Bold"
            aria-label="Bold"
            disabled={mode === "preview"}
          >
            <Bold className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className="rich-text-editor-btn"
            onClick={() => applyFormat("h2")}
            title="Heading"
            aria-label="Heading"
            disabled={mode === "preview"}
          >
            <Heading2 className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className="rich-text-editor-btn"
            onClick={() => applyFormat("h3")}
            title="Subheading"
            aria-label="Subheading"
            disabled={mode === "preview"}
          >
            <Heading3 className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className="rich-text-editor-btn"
            onClick={() => applyFormat("list")}
            title="Bullet list"
            aria-label="Bullet list"
            disabled={mode === "preview"}
          >
            <List className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="rich-text-editor-modes">
          <button
            type="button"
            className={`rich-text-editor-mode${mode === "edit" ? " rich-text-editor-mode--active" : ""}`}
            onClick={() => setMode("edit")}
          >
            <PencilLine className="h-3.5 w-3.5" strokeWidth={1.75} />
            Edit
          </button>
          <button
            type="button"
            className={`rich-text-editor-mode${mode === "preview" ? " rich-text-editor-mode--active" : ""}`}
            onClick={() => setMode("preview")}
          >
            <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
            Preview
          </button>
        </div>
      </div>

      {mode === "edit" ? (
        <textarea
          ref={textareaRef}
          className="input-field input-field--textarea rich-text-editor-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={16}
        />
      ) : (
        <div className="rich-text-editor-preview">
          {value.trim() ? (
            <RichText content={value} />
          ) : (
            <p className="studio-field-hint">Nothing to preview yet.</p>
          )}
        </div>
      )}

      <p className="studio-field-hint rich-text-editor-hint">
        Blank lines start a new paragraph. Use the toolbar for bold, headings, and
        lists — or type <code>**bold**</code>, <code>## Heading</code>, and{" "}
        <code>- list item</code>.
      </p>
    </div>
  );
}
