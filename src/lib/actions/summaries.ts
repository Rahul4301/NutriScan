'use server';

import { createServerSupabaseClient } from '../supabase-server';

export type DailySummary = {
  id: string;
  user_id: string;
  summary_date: string;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  meal_count: number;
  goal_achieved: boolean;
  created_at: string;
  updated_at: string;
};

export async function getDailySummary(date: string): Promise<DailySummary | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return null;
    }

    const { data, error } = await supabase
      .from('daily_summaries')
      .select('*')
      .eq('user_id', user.id)
      .eq('summary_date', date)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Failed to fetch daily summary:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getDailySummary:', error);
    return null;
  }
}

export async function getWeeklySummaries(startDate: string): Promise<DailySummary[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return [];
    }

  // Calculate end date (7 days from start)
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const endDate = end.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('daily_summaries')
    .select('*')
    .eq('user_id', user.id)
    .gte('summary_date', startDate)
    .lte('summary_date', endDate)
    .order('summary_date', { ascending: true });

    if (error) {
      console.error('Failed to fetch weekly summaries:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getWeeklySummaries:', error);
    return [];
  }
}

export async function getMonthlySummaries(year: number, month: number): Promise<DailySummary[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return [];
    }

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

  const { data, error } = await supabase
    .from('daily_summaries')
    .select('*')
    .eq('user_id', user.id)
    .gte('summary_date', startDate)
    .lte('summary_date', endDate)
    .order('summary_date', { ascending: true });

    if (error) {
      console.error('Failed to fetch monthly summaries:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getMonthlySummaries:', error);
    return [];
  }
}
