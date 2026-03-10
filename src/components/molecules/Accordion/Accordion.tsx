import { useState, type ReactNode } from 'react';

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpenIds?: string[];
}

export function Accordion({ items, allowMultiple = false, defaultOpenIds = [] }: AccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(defaultOpenIds));

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        if (!allowMultiple) next.clear();
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="ads-accordion">
      {items.map((item) => {
        const isOpen = openIds.has(item.id);
        return (
          <div key={item.id} className="ads-accordion-item">
            <button
              type="button"
              className="ads-accordion-trigger"
              aria-expanded={isOpen}
              aria-controls={`ads-accordion-panel-${item.id}`}
              id={`ads-accordion-heading-${item.id}`}
              onClick={() => toggle(item.id)}
            >
              {item.title}
              <span className="ads-accordion-icon" aria-hidden>{isOpen ? '−' : '+'}</span>
            </button>
            <div
              id={`ads-accordion-panel-${item.id}`}
              role="region"
              aria-labelledby={`ads-accordion-heading-${item.id}`}
              className={`ads-accordion-panel ${isOpen ? 'ads-accordion-panel-open' : ''}`}
              hidden={!isOpen}
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
