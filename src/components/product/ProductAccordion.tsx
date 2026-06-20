"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

export interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

interface ProductAccordionProps {
  items: AccordionItem[];
  defaultOpenId?: string;
}

function AccordionContent({ content }: { content: string }) {
  const paragraphs = content
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="detail-text">
      {paragraphs.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  );
}

export function ProductAccordion({
  items,
  defaultOpenId,
}: ProductAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(
    defaultOpenId ?? items[0]?.id ?? null,
  );

  return (
    <div>
      <h2 className="section-title mb-2">Product Details</h2>

      {items.map((item) => {
        const isOpen = openId === item.id;

        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="accordion-trigger"
              aria-expanded={isOpen}
            >
              {item.title}
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                strokeWidth={1.5}
              />
            </button>

            <div
              className={`accordion-panel ${isOpen ? "accordion-panel--open" : ""}`}
              aria-hidden={!isOpen}
            >
              <div className="accordion-panel-inner">
                <AccordionContent content={item.content} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
