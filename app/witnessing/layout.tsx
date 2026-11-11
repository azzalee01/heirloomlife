import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr';
import { SideNavWrapper } from '@/app/dashboard/_components/SideNavWrapper';
import BottomNav from '@/components/platform/BottomNav';

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function WitnessingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const fullName =
    user.user_metadata?.full_name ??
    user.email?.split('@')[0] ??
    'there';

  return (
    <div className="flex h-dvh overflow-hidden md:h-screen" style={{ background: 'var(--paper)' }}>
      <SideNavWrapper userName={fullName} />
      {/* Mobile: leave room for the fixed BottomNav (60px + safe area) so content
          isn't hidden behind it. Desktop has no bottom bar. */}
      <div className="flex-1 min-w-0 overflow-y-auto pb-[calc(60px+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </div>
      <BottomNav userName={fullName} />
    </div>
  );
}
