"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { RichText } from "@/components/ui/RichText";

export interface AccordionFact {
  label: string;
  value: string;
}

export interface AccordionItem {
  id: string;
  title: string;
  content: string;
  facts?: AccordionFact[];
}

interface ProductAccordionProps {
  items: AccordionItem[];
  defaultOpenId?: string;
}

function AccordionContent({
  content,
  facts,
}: {
  content: string;
  facts?: AccordionFact[];
}) {
  return (
    <div className="detail-text">
      {content.trim() ? (
        <RichText content={content} className="detail-rich-text" />
      ) : null}

      {facts && facts.length > 0 ? (
        <dl className="detail-facts">
          {facts.map((fact) => (
            <div key={fact.label} className="detail-fact">
              <dt className="detail-fact-label">{fact.label}</dt>
              <dd className="detail-fact-value">{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
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
                <AccordionContent content={item.content} facts={item.facts} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
