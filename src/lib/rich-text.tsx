import type { ReactNode } from "react";
import { Fragment, createElement } from "react";

/**
 * Lightweight artist-facing rich text (Markdown subset).
 * Supports: # / ## / ### headings, **bold**, *italic*, bullet lists,
 * horizontal rules, paragraphs, and single newlines as line breaks.
 */

type Block =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "rule" };

function parseInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Bold first (**…**), then italic (*…*) — avoids matching list markers mid-line.
  const pattern = /(\*\*[^*]+?\*\*|\*[^*]+?\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let part = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        <Fragment key={`${keyPrefix}-t-${part++}`}>
          {text.slice(lastIndex, match.index)}
        </Fragment>,
      );
    }

    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(
        <strong key={`${keyPrefix}-b-${part++}`}>{token.slice(2, -2)}</strong>,
      );
    } else {
      nodes.push(<em key={`${keyPrefix}-i-${part++}`}>{token.slice(1, -1)}</em>);
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(
      <Fragment key={`${keyPrefix}-t-${part++}`}>{text.slice(lastIndex)}</Fragment>,
    );
  }

  return nodes.length > 0 ? nodes : [text];
}

function renderParagraphLines(text: string, keyPrefix: string): ReactNode[] {
  const lines = text.split("\n");
  const nodes: ReactNode[] = [];

  lines.forEach((line, index) => {
    if (index > 0) {
      nodes.push(<br key={`${keyPrefix}-br-${index}`} />);
    }
    nodes.push(...parseInline(line, `${keyPrefix}-l${index}`));
  });

  return nodes;
}

function looksLikeMarkdown(source: string): boolean {
  return /(?:^|\n)#{1,3}\s+\S|\*\*[^*]+\*\*/m.test(source);
}

/**
 * Upgrade plain-text bios (newlines / * lists / short title lines) into the
 * markdown subset so older CMS content still formats before artists re-save.
 */
function upgradeLegacyPlainText(source: string): string {
  const chunks = source
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  return chunks
    .map((chunk) => {
      if (/^(-{3,}|\u2014{3,}|⸻+)$/.test(chunk)) {
        return "---";
      }

      const lines = chunk.split("\n").map((line) => line.trimEnd());
      if (lines.every((line) => /^[-*]\s+\S/.test(line.trim()))) {
        return lines
          .map((line) => `- ${line.trim().replace(/^[-*]\s+/, "")}`)
          .join("\n");
      }

      // Short standalone title lines → headings (artist common pattern).
      // Skip instructional / meta lines (offers, dispatch notes, etc.).
      if (
        lines.length === 1 &&
        lines[0].length > 0 &&
        lines[0].length <= 48 &&
        !/[.!?]$/.test(lines[0]) &&
        !/^[-*]\s+/.test(lines[0]) &&
        !/\d/.test(lines[0]) &&
        !/[₹$€|]/.test(lines[0]) &&
        !/\b(use on|orders above|dispatches|made to order)\b/i.test(lines[0])
      ) {
        return `## ${lines[0]}`;
      }

      return chunk;
    })
    .join("\n\n");
}

function parseBlocks(source: string): Block[] {
  const prepared = source.replace(/\r\n/g, "\n").trim();
  if (!prepared) {
    return [];
  }

  const normalized = looksLikeMarkdown(prepared)
    ? prepared
    : upgradeLegacyPlainText(prepared);

  const chunks = normalized.split(/\n{2,}/);
  const blocks: Block[] = [];

  for (const chunk of chunks) {
    const trimmed = chunk.trim();
    if (!trimmed) {
      continue;
    }

    if (/^(-{3,}|\u2014{3,}|⸻+)$/.test(trimmed)) {
      blocks.push({ type: "rule" });
      continue;
    }

    const headingMatch = /^(#{1,3})\s+(.+)$/.exec(trimmed);
    if (headingMatch && !trimmed.includes("\n")) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length as 1 | 2 | 3,
        text: headingMatch[2].trim(),
      });
      continue;
    }

    const lines = trimmed.split("\n");
    const listLines = lines.filter((line) => /^[-*]\s+/.test(line.trim()));
    if (listLines.length > 0 && listLines.length === lines.length) {
      blocks.push({
        type: "list",
        items: lines.map((line) => line.trim().replace(/^[-*]\s+/, "")),
      });
      continue;
    }

    blocks.push({ type: "paragraph", text: trimmed });
  }

  return blocks;
}

export function renderRichText(source: string): ReactNode {
  const blocks = parseBlocks(source);

  return blocks.map((block, index) => {
    const key = `rt-${index}`;

    switch (block.type) {
      case "heading": {
        const tag = `h${block.level}` as "h1" | "h2" | "h3";
        return createElement(
          tag,
          {
            key,
            className: `rich-text-heading rich-text-heading--${block.level}`,
          },
          parseInline(block.text, key),
        );
      }
      case "list":
        return (
          <ul key={key} className="rich-text-list">
            {block.items.map((item, itemIndex) => (
              <li key={`${key}-${itemIndex}`} className="rich-text-list-item">
                {parseInline(item, `${key}-${itemIndex}`)}
              </li>
            ))}
          </ul>
        );
      case "rule":
        return <hr key={key} className="rich-text-rule" />;
      case "paragraph":
      default:
        return (
          <p key={key} className="rich-text-paragraph">
            {renderParagraphLines(block.text, key)}
          </p>
        );
    }
  });
}

/** Strip markdown markers for SEO, JSON-LD, and other plain-text contexts. */
export function stripRichTextToPlain(source: string): string {
  return source
    .replace(/\r\n/g, "\n")
    .replace(/^#{1,3}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^[-*]\s+/gm, "")
    .replace(/^(-{3,}|\u2014{3,}|⸻+)$/gm, "")
    .replace(/\n{2,}/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

/** Wrap the current selection (or insert at caret) with markdown markers. */
export function wrapSelection(
  value: string,
  start: number,
  end: number,
  before: string,
  after: string = before,
): { value: string; selectionStart: number; selectionEnd: number } {
  const selected = value.slice(start, end);
  const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;

  if (selected.length === 0) {
    const caret = start + before.length;
    return { value: next, selectionStart: caret, selectionEnd: caret };
  }

  return {
    value: next,
    selectionStart: start,
    selectionEnd: start + before.length + selected.length + after.length,
  };
}

export function prefixLines(
  value: string,
  start: number,
  end: number,
  prefix: string,
): { value: string; selectionStart: number; selectionEnd: number } {
  const lineStart = value.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
  const lineEndIndex = value.indexOf("\n", end);
  const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
  const block = value.slice(lineStart, lineEnd);
  const prefixed = block
    .split("\n")
    .map((line) => {
      const trimmed = line.trimStart();
      if (!trimmed) {
        return `${prefix}`;
      }
      if (trimmed.startsWith(prefix.trim())) {
        return line;
      }
      // Replace an existing heading prefix when applying a new one.
      if (prefix.startsWith("#")) {
        return `${prefix}${trimmed.replace(/^#{1,3}\s+/, "")}`;
      }
      if (prefix.startsWith("- ") || prefix.startsWith("* ")) {
        return `${prefix}${trimmed.replace(/^[-*]\s+/, "")}`;
      }
      return `${prefix}${trimmed}`;
    })
    .join("\n");

  const next = `${value.slice(0, lineStart)}${prefixed}${value.slice(lineEnd)}`;
  return {
    value: next,
    selectionStart: lineStart,
    selectionEnd: lineStart + prefixed.length,
  };
}
