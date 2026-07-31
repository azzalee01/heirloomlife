import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr';
import SideNav from '@/app/_components/SideNav';

export default async function WillLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const userName =
    user.user_metadata?.full_name?.split(' ')[0] ??
    user.email?.split('@')[0] ??
    'User';
  const userEmail = user.email ?? '';

  return (
    <div className="flex h-full overflow-hidden">
      <SideNav userName={userName} userEmail={userEmail} />
      <main className="flex-1 h-full overflow-hidden bg-[var(--paper-warm)]">
        {children}
      </main>
    </div>
  );
}
