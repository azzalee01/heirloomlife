import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { robots: { index: false, follow: false } };
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr';
import { SideNavWrapper } from './_components/SideNavWrapper';
import DashboardWorkspace from './_components/DashboardWorkspace';
import BottomNav from '@/components/platform/BottomNav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const firstName =
    user.user_metadata?.full_name?.split(' ')[0] ??
    user.email?.split('@')[0] ??
    'there';

  const fullName =
    user.user_metadata?.full_name ?? firstName;

  return (
    <div className="flex h-dvh overflow-hidden md:h-screen" style={{ background: 'var(--paper)' }}>
      <SideNavWrapper userName={fullName} />
      <DashboardWorkspace>
        {children}
      </DashboardWorkspace>
      <BottomNav userName={fullName} />
    </div>
  );
}
