import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr';
import AppShell from '@/components/platform/AppShell';

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function DocumentsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const fullName =
    user.user_metadata?.full_name ??
    user.email?.split('@')[0] ??
    'there';

  return <AppShell userName={fullName}>{children}</AppShell>;
}
