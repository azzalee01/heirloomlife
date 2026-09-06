import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr';
import { SideNavWrapper } from '@/app/dashboard/_components/SideNavWrapper';
import BottomNav from '@/components/platform/BottomNav';

export default async function WillLayout({ children }: { children: React.ReactNode }) {
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
      <main className="h-full min-w-0 flex-1 overflow-hidden bg-[var(--paper-warm)]">
        {children}
      </main>
      <BottomNav userName={fullName} />
    </div>
  );
}
