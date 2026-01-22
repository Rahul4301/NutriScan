'use server';

import { createServerSupabaseClient } from '../supabase-server';
import { revalidatePath } from 'next/cache';

export type LoggedMeal = {
  id?: string;
  user_id?: string;
  food_item_id?: string | null;
  meal_name: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  food_name: string;
  restaurant_name?: string | null;
  calories?: number | null;
  protein_g?: number | null;
  carbs_g?: number | null;
  fat_g?: number | null;
  portion_size?: string | null;
  portion_multiplier?: number;
  meal_date?: string;
  meal_time?: string | null;
  notes?: string | null;
  is_custom?: boolean;
  created_at?: string;
  updated_at?: string;
};

export async function logMeal(meal: Omit<LoggedMeal, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<LoggedMeal> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // Parse numeric values from strings if needed
    const parsedMeal = {
      ...meal,
      calories: meal.calories ? parseInt(String(meal.calories)) : null,
      protein_g: meal.protein_g ? parseFloat(String(meal.protein_g)) : null,
      carbs_g: meal.carbs_g ? parseFloat(String(meal.carbs_g)) : null,
      fat_g: meal.fat_g ? parseFloat(String(meal.fat_g)) : null,
      portion_multiplier: meal.portion_multiplier || 1.0,
      meal_date: meal.meal_date || new Date().toISOString().split('T')[0],
      is_custom: meal.is_custom || false,
    };

    const { data, error } = await supabase
      .from('logged_meals')
      .insert({
        user_id: user.id,
        ...parsedMeal,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to log meal: ${error.message}`);
    }

    revalidatePath('/dashboard');
    revalidatePath('/meals');
    return data;
  } catch (error) {
    console.error('Error in logMeal:', error);
    throw error;
  }
}

export async function getLoggedMeals(
  startDate?: string,
  endDate?: string
): Promise<LoggedMeal[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return [];
    }

  let query = supabase
    .from('logged_meals')
    .select('*')
    .eq('user_id', user.id)
    .order('meal_date', { ascending: false })
    .order('meal_time', { ascending: false });

  if (startDate) {
    query = query.gte('meal_date', startDate);
  }
  if (endDate) {
    query = query.lte('meal_date', endDate);
  }

  const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch meals:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getLoggedMeals:', error);
    return [];
  }
}

export async function getMealsByDate(date: string): Promise<LoggedMeal[]> {
  return getLoggedMeals(date, date);
}

export async function updateMeal(
  mealId: string,
  updates: Partial<Omit<LoggedMeal, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<LoggedMeal> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('logged_meals')
      .update(updates)
      .eq('id', mealId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update meal: ${error.message}`);
    }

    revalidatePath('/dashboard');
    revalidatePath('/meals');
    return data;
  } catch (error) {
    console.error('Error in updateMeal:', error);
    throw error;
  }
}

export async function deleteMeal(mealId: string): Promise<void> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // Try using the database function first (preferred method)
    const { error: rpcError } = await supabase.rpc('delete_meal_safely', {
      meal_id_to_delete: mealId,
    });

    if (rpcError) {
      // Fallback to direct deletion if RPC doesn't exist or fails
      // The trigger should now handle daily_summaries updates correctly
      if (rpcError.message.includes('function') && rpcError.message.includes('does not exist')) {
        console.warn('delete_meal_safely function not found, using direct deletion');
      }
      
      // Direct deletion - trigger will handle daily_summaries update
      const { error: deleteError } = await supabase
        .from('logged_meals')
        .delete()
        .eq('id', mealId)
        .eq('user_id', user.id);

      if (deleteError) {
        throw new Error(`Failed to delete meal: ${deleteError.message}`);
      }
    }

    revalidatePath('/dashboard');
    revalidatePath('/meals');
  } catch (error) {
    console.error('Error in deleteMeal:', error);
    throw error;
  }
}
