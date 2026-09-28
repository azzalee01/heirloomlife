import React from 'react';
import { C, F, R } from '../tokens/design';
import { HeirloomWordmark } from './HeirloomWordmark';

interface NavItem {
  label: string;
  icon: string; // SVG path
  active?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z',
    active: false,
  },
  {
    label: 'My Will',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    active: true,
  },
  {
    label: 'Vault',
    icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
    active: false,
  },
  {
    label: 'Life Events',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    active: false,
  },
];

interface Props {
  children: React.ReactNode;
  activeNav?: number; // 0-based index into NAV_ITEMS
  showSidebar?: boolean;
  // For compact/mobile mode
  compact?: boolean;
}

// Desktop platform shell — sidebar + header + content area.
// Faithful to the production SideNav + layout structure.
export const PlatformShell: React.FC<Props> = ({
  children,
  activeNav = 1,
  showSidebar = true,
  compact = false,
}) => {
  const sidebarW = compact ? 0 : 220;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        background: C.paperWarm,
        overflow: 'hidden',
        borderRadius: 12,
      }}
    >
      {/* Sidebar */}
      {showSidebar && (
        <div
          style={{
            width: sidebarW,
            height: '100%',
            background: C.paper,
            borderRight: `1px solid ${C.line}`,
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
          }}
        >
          {/* Logo area */}
          <div
            style={{
              height: 56,
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              borderBottom: `1px solid ${C.lineSoft}`,
              flexShrink: 0,
            }}
          >
            <HeirloomWordmark size={18} />
          </div>

          {/* Nav items */}
          <nav style={{ padding: '8px 8px', flex: 1 }}>
            {NAV_ITEMS.map((item, i) => {
              const isActive = i === activeNav;
              return (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 9,
                    padding: '7px 10px',
                    borderRadius: R.btn,
                    marginBottom: 2,
                    background: isActive ? C.tealLight : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={isActive ? C.tealDeep : C.neutral}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={item.icon} />
                  </svg>
                  <span
                    style={{
                      fontFamily: F.sans,
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? C.tealDeep : C.neutral,
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </nav>

          {/* Avatar / user area */}
          <div
            style={{
              padding: '12px 12px 16px',
              borderTop: `1px solid ${C.lineSoft}`,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                background: C.teal,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: F.sans,
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#fff',
                }}
              >
                JS
              </span>
            </div>
            <div>
              <p
                style={{
                  fontFamily: F.sans,
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.ink,
                  margin: 0,
                }}
              >
                Jane Smith
              </p>
              <p
                style={{
                  fontFamily: F.sans,
                  fontSize: 10,
                  color: C.neutral,
                  margin: 0,
                }}
              >
                Member
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div
          style={{
            height: 56,
            borderBottom: `1px solid ${C.line}`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            background: 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(16px)',
            flexShrink: 0,
          }}
        >
          {!showSidebar && (
            <div style={{ marginRight: 16 }}>
              <HeirloomWordmark size={18} />
            </div>
          )}
          <div style={{ flex: 1 }}>
            <span
              style={{
                fontFamily: F.sans,
                fontSize: 14,
                fontWeight: 600,
                color: C.ink,
              }}
            >
              {NAV_ITEMS[activeNav]?.label ?? 'My Will'}
            </span>
          </div>
          {/* Avatar pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: C.paperWarm,
              border: `1px solid ${C.line}`,
              borderRadius: R.full,
              padding: '4px 10px 4px 4px',
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                background: C.teal,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: F.sans,
                  fontSize: 9,
                  fontWeight: 700,
                  color: '#fff',
                }}
              >
                JS
              </span>
            </div>
            <span
              style={{
                fontFamily: F.sans,
                fontSize: 12,
                color: C.ink,
              }}
            >
              Jane
            </span>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {children}
        </div>
      </div>
    </div>
  );
};
