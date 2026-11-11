import { SideNavWrapper } from '@/app/dashboard/_components/SideNavWrapper';
import BottomNav from '@/components/platform/BottomNav';

/**
 * Standard authenticated app chrome: desktop SideNav + mobile BottomNav around a
 * scrollable content area. Use this for every signed-in product section so the
 * navigation is consistent and the mobile bottom bar never goes missing.
 *
 * NOT for: marketing/auth/admin (own chrome), the dashboard (uses
 * DashboardWorkspace), or the /will/new wizard (immersive flow with its own
 * mobile footer nav — BottomNav self-hides there).
 */
export default function AppShell({
  userName,
  children,
}: {
  userName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh overflow-hidden md:h-screen" style={{ background: 'var(--paper)' }}>
      <SideNavWrapper userName={userName} />
      {/* Mobile: leave room for the fixed BottomNav (60px + safe area) so content
          isn't hidden behind it. Desktop has no bottom bar. */}
      <div className="flex-1 min-w-0 overflow-y-auto pb-[calc(60px+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </div>
      <BottomNav userName={userName} />
    </div>
  );
}
