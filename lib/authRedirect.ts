import type { SupabaseClient } from '@supabase/supabase-js';

export async function getPostAuthPath(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('name, school, student_id')
    .eq('id', userId)
    .maybeSingle();

  const hasFinishedProfile = Boolean(data?.name && data.school && data.student_id);
  return hasFinishedProfile ? '/' : '/onboarding';
}
