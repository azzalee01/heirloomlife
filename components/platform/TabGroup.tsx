'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

// ── TabGroup ──────────────────────────────────────────────────────────────────
// Donna's Apple-style sliding indicator tab group, remapped to Heirloom tokens.
// Active tab indicator slides smoothly between tabs on click.

export interface Tab {
  id: string;
  label: React.ReactNode;
  count?: number;
}

export interface TabGroupProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

export function TabGroup({ tabs, activeTab, onTabChange, className }: TabGroupProps) {
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const [animate, setAnimate] = useState(false);

  // Enable animation after first paint so initial position snaps without transition
  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Reposition indicator when active tab changes
  useEffect(() => {
    const idx = tabs.findIndex(t => t.id === activeTab);
    const btn = tabsRef.current[idx];
    if (btn) setIndicator({ left: btn.offsetLeft, width: btn.offsetWidth });
  }, [activeTab, tabs]);

  return (
    <div className={cn('relative inline-flex items-center', className)}>
      {/* Sliding background */}
      <div
        className={cn(
          'absolute top-0 bottom-0 rounded-lg pointer-events-none',
          animate ? 'transition-all duration-300 ease-out' : 'transition-none',
        )}
        style={{
          left: indicator.left,
          width: indicator.width,
          background: 'var(--paper-warm)',
          border: '1px solid var(--line)',
        }}
      />

      {/* Tabs */}
      {tabs.map((tab, i) => (
        <button
          key={tab.id}
          ref={el => { tabsRef.current[i] = el; }}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'relative z-10 px-3 py-2 text-sm rounded-lg transition-colors select-none',
            activeTab === tab.id ? 'font-medium' : 'hover:opacity-80',
          )}
          style={{ color: activeTab === tab.id ? 'var(--ink)' : 'var(--neutral)' }}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className="ml-1.5 text-xs"
              style={{ color: activeTab === tab.id ? 'var(--teal)' : 'var(--neutral)' }}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export default TabGroup;
