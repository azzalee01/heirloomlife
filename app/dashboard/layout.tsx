// app/dashboard/layout.tsx
// Wraps the dashboard in Donna's flex h-screen shell:
// [SideNav] [main content area]
// Drop this file into app/dashboard/layout.tsx

import { redirect } from 'next/navigation';
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
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--paper)' }}>
      <SideNavWrapper userName={fullName} />
      <DashboardWorkspace>
        {children}
      </DashboardWorkspace>
      <BottomNav userName={fullName} />
    </div>
  );
}
