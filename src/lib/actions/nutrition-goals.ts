'use server';

import { createServerSupabaseClient } from '../supabase-server';
import { revalidatePath } from 'next/cache';

export type NutritionalGoals = {
  id?: string;
  user_id?: string;
  daily_calories?: number | null;
  daily_protein_g?: number | null;
  daily_carbs_g?: number | null;
  daily_fat_g?: number | null;
  activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | null;
  fitness_goal?: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'general_health' | null;
  created_at?: string;
  updated_at?: string;
};

export async function getUserNutritionalGoals(): Promise<NutritionalGoals | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return null;
    }

    const { data, error } = await supabase
      .from('user_nutritional_goals')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Failed to fetch goals:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserNutritionalGoals:', error);
    return null;
  }
}

export async function setUserNutritionalGoals(
  goals: Omit<NutritionalGoals, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<NutritionalGoals> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('user_nutritional_goals')
      .upsert({
        user_id: user.id,
        ...goals,
      }, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to set goals: ${error.message}`);
    }

    revalidatePath('/dashboard');
    return data;
  } catch (error) {
    console.error('Error in setUserNutritionalGoals:', error);
    throw error;
  }
}
