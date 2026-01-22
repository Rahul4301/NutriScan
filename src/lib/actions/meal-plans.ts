'use server';

import { createServerSupabaseClient } from '../supabase-server';
import { revalidatePath } from 'next/cache';

export type MealPlan = {
  id?: string;
  user_id?: string;
  plan_name: string;
  start_date: string;
  end_date: string;
  is_active?: boolean;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type MealPlanItem = {
  id?: string;
  meal_plan_id: string;
  food_item_id?: string | null;
  custom_food_item_id?: string | null;
  meal_name: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  planned_date: string;
  planned_time?: string | null;
  portion_size?: string | null;
  portion_multiplier?: number;
  is_completed?: boolean;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
  // Joined data
  food_name?: string;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
};

export async function createMealPlan(plan: Omit<MealPlan, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<MealPlan> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

  const { data, error } = await supabase
    .from('meal_plans')
    .insert({
      user_id: user.id,
      ...plan,
      is_active: plan.is_active ?? true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create meal plan: ${error.message}`);
  }

    revalidatePath('/meal-plans');
    return data;
  } catch (error) {
    console.error('Error in createMealPlan:', error);
    throw error;
  }
}

export async function getMealPlans(activeOnly: boolean = false): Promise<MealPlan[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return [];
    }

    let query = supabase
    .from('meal_plans')
    .select('*')
    .eq('user_id', user.id)
    .order('start_date', { ascending: false });

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch meal plans:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getMealPlans:', error);
    return [];
  }
}

export async function getMealPlan(planId: string): Promise<MealPlan | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return null;
    }

  const { data, error } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('id', planId)
    .eq('user_id', user.id)
    .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Failed to fetch meal plan:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getMealPlan:', error);
    return null;
  }
}

export async function updateMealPlan(
  planId: string,
  updates: Partial<Omit<MealPlan, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<MealPlan> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

  const { data, error } = await supabase
    .from('meal_plans')
    .update(updates)
    .eq('id', planId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update meal plan: ${error.message}`);
  }

    revalidatePath('/meal-plans');
    return data;
  } catch (error) {
    console.error('Error in updateMealPlan:', error);
    throw error;
  }
}

export async function deleteMealPlan(planId: string): Promise<void> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

  const { error } = await supabase
    .from('meal_plans')
    .delete()
    .eq('id', planId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to delete meal plan: ${error.message}`);
  }

    revalidatePath('/meal-plans');
  } catch (error) {
    console.error('Error in deleteMealPlan:', error);
    throw error;
  }
}

export async function addMealPlanItem(item: Omit<MealPlanItem, 'id' | 'created_at' | 'updated_at'>): Promise<MealPlanItem> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

  // Verify meal plan belongs to user
  const { data: plan } = await supabase
    .from('meal_plans')
    .select('id')
    .eq('id', item.meal_plan_id)
    .eq('user_id', user.id)
    .single();

  if (!plan) {
    throw new Error('Meal plan not found');
  }

  const { data, error } = await supabase
    .from('meal_plan_items')
    .insert({
      ...item,
      portion_multiplier: item.portion_multiplier || 1.0,
      is_completed: item.is_completed || false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add meal plan item: ${error.message}`);
  }

    revalidatePath('/meal-plans');
    return data;
  } catch (error) {
    console.error('Error in addMealPlanItem:', error);
    throw error;
  }
}

export async function getMealPlanItems(planId: string): Promise<MealPlanItem[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return [];
    }

  // Verify meal plan belongs to user
  const { data: plan } = await supabase
    .from('meal_plans')
    .select('id')
    .eq('id', planId)
    .eq('user_id', user.id)
    .single();

  if (!plan) {
    throw new Error('Meal plan not found');
  }

  const { data, error } = await supabase
    .from('meal_plan_items')
    .select(`
      *,
      food_items:food_item_id (
        food_name,
        name,
        nutrition_facts
      )
    `)
    .eq('meal_plan_id', planId)
    .order('planned_date', { ascending: true })
    .order('planned_time', { ascending: true, nullsFirst: false });

    if (error) {
      console.error('Failed to fetch meal plan items:', error);
      return [];
    }

    // Transform the data to include food name and nutrition
    const items = (data || []).map((item: any) => {
    const foodItem = item.food_items;
    const nutrition = foodItem?.nutrition_facts || {};
    
    return {
      ...item,
      food_name: foodItem?.food_name || foodItem?.name || 'Unknown',
      calories: nutrition.calories ? parseInt(String(nutrition.calories).replace(/[^0-9]/g, '')) : null,
      protein_g: nutrition.protein ? parseFloat(String(nutrition.protein).replace(/[^0-9.]/g, '')) : null,
      carbs_g: nutrition.carbs ? parseFloat(String(nutrition.carbs).replace(/[^0-9.]/g, '')) : null,
      fat_g: nutrition.fat ? parseFloat(String(nutrition.fat).replace(/[^0-9.]/g, '')) : null,
      };
    });

    return items;
  } catch (error) {
    console.error('Error in getMealPlanItems:', error);
    return [];
  }
}

export async function updateMealPlanItem(
  itemId: string,
  updates: Partial<Omit<MealPlanItem, 'id' | 'meal_plan_id' | 'created_at' | 'updated_at'>>
): Promise<MealPlanItem> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

  // Verify item belongs to user's meal plan
  const { data: item } = await supabase
    .from('meal_plan_items')
    .select('meal_plan_id, meal_plans!inner(user_id)')
    .eq('id', itemId)
    .single();

  if (!item || (item.meal_plans as any).user_id !== user.id) {
    throw new Error('Meal plan item not found');
  }

  const { data, error } = await supabase
    .from('meal_plan_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update meal plan item: ${error.message}`);
  }

    revalidatePath('/meal-plans');
    return data;
  } catch (error) {
    console.error('Error in updateMealPlanItem:', error);
    throw error;
  }
}

export async function deleteMealPlanItem(itemId: string): Promise<void> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

  // Verify item belongs to user's meal plan
  const { data: item } = await supabase
    .from('meal_plan_items')
    .select('meal_plan_id, meal_plans!inner(user_id)')
    .eq('id', itemId)
    .single();

  if (!item || (item.meal_plans as any).user_id !== user.id) {
    throw new Error('Meal plan item not found');
  }

  const { error } = await supabase
    .from('meal_plan_items')
    .delete()
    .eq('id', itemId);

  if (error) {
    throw new Error(`Failed to delete meal plan item: ${error.message}`);
  }

    revalidatePath('/meal-plans');
  } catch (error) {
    console.error('Error in deleteMealPlanItem:', error);
    throw error;
  }
}

export async function completeMealPlanItem(itemId: string): Promise<MealPlanItem> {
  return updateMealPlanItem(itemId, {
    is_completed: true,
    completed_at: new Date().toISOString(),
  });
}
