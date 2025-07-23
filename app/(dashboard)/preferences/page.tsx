// app/(dashboard)/preferences/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DietaryPreferences from '@/components/DietaryPreferences';

export default async function PreferencesPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="p-6">
      <DietaryPreferences userId={user.id} />
    </div>
  );
}