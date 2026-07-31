'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/src/lib/supabase';
import { SideNav } from '@/components/platform/SideNav';

export function SideNavWrapper({ userName }: { userName: string }) {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/auth/login');
  }

  return <SideNav userName={userName} onLogout={handleLogout} />;
}
