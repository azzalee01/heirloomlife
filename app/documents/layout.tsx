import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr';
import { SideNavWrapper } from '@/app/dashboard/_components/SideNavWrapper';

export default async function DocumentsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const fullName =
    user.user_metadata?.full_name ??
    user.email?.split('@')[0] ??
    'there';

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--paper)' }}>
      <SideNavWrapper userName={fullName} />
      <div className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
