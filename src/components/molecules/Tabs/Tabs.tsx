import type { ReactNode } from 'react';

export interface TabItem {
  id: string;
  label: ReactNode;
  panel: ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, activeId, onChange }: TabsProps) {
  const activeTab = tabs.find((t) => t.id === activeId);
  return (
    <div className="ads-tabs">
      <div className="ads-tabs-list" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={tab.id === activeId}
            aria-controls={`ads-tab-panel-${tab.id}`}
            id={`ads-tab-${tab.id}`}
            className={`ads-tab-btn ${tab.id === activeId ? 'ads-tab-btn-active' : ''}`}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        id={`ads-tab-panel-${activeId}`}
        role="tabpanel"
        aria-labelledby={`ads-tab-${activeId}`}
        className="ads-tabs-panel"
      >
        {activeTab?.panel}
      </div>
    </div>
  );
}
