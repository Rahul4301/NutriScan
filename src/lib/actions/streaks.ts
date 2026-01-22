'use server';

import { createServerSupabaseClient } from '../supabase-server';

export type UserStreak = {
  id: string;
  user_id: string;
  current_streak_days: number;
  longest_streak_days: number;
  last_logged_date: string | null;
  updated_at: string;
};

export async function getUserStreak(): Promise<UserStreak | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return null;
    }

    const { data, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Failed to fetch streak:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserStreak:', error);
    return null;
  }
}
