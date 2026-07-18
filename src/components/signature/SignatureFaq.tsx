"use client";

import type { SignatureFaqItem } from "@/types/site-config";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export function SignatureFaq({ items }: { items: SignatureFaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="signature-faq-list">
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div key={`${item.question}-${index}`} className="signature-faq-item">
            <button
              type="button"
              className="accordion-trigger"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : index)}
            >
              {item.question}
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
                <p className="body-text">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
