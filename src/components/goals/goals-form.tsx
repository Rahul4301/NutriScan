'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getUserNutritionalGoals, setUserNutritionalGoals, type NutritionalGoals } from '@/lib/actions/nutrition-goals';
import { Loader2 } from 'lucide-react';

export function GoalsForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [goals, setGoals] = useState<Partial<NutritionalGoals>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const data = await getUserNutritionalGoals();
      if (data) {
        setGoals(data);
      }
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await setUserNutritionalGoals({
        daily_calories: goals.daily_calories ? parseInt(String(goals.daily_calories)) : null,
        daily_protein_g: goals.daily_protein_g ? parseInt(String(goals.daily_protein_g)) : null,
        daily_carbs_g: goals.daily_carbs_g ? parseInt(String(goals.daily_carbs_g)) : null,
        daily_fat_g: goals.daily_fat_g ? parseInt(String(goals.daily_fat_g)) : null,
        activity_level: goals.activity_level || null,
        fitness_goal: goals.fitness_goal || null,
      });

      toast({
        title: 'Goals saved!',
        description: 'Your nutritional goals have been updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save goals',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-8 bg-[#F5F5F0]/90 border border-[#4A6741]/20 rounded-3xl">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#4A6741]" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-[#F5F5F0]/90 border border-[#4A6741]/20 rounded-3xl">
      <h2 className="text-2xl font-headline text-[#4A6741] mb-6">Set Your Goals</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Daily Calories */}
        <div className="space-y-2">
          <Label htmlFor="calories" className="text-[#4A6741]">
            Daily Calories
          </Label>
          <Input
            id="calories"
            type="number"
            placeholder="e.g., 2000"
            value={goals.daily_calories || ''}
            onChange={(e) => setGoals({ ...goals, daily_calories: e.target.value ? parseInt(e.target.value) : null })}
            className="bg-white border-[#4A6741]/20"
          />
        </div>

        {/* Macros */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="protein" className="text-[#4A6741]">
              Protein (g)
            </Label>
            <Input
              id="protein"
              type="number"
              placeholder="e.g., 150"
              value={goals.daily_protein_g || ''}
              onChange={(e) => setGoals({ ...goals, daily_protein_g: e.target.value ? parseInt(e.target.value) : null })}
              className="bg-white border-[#4A6741]/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="carbs" className="text-[#4A6741]">
              Carbs (g)
            </Label>
            <Input
              id="carbs"
              type="number"
              placeholder="e.g., 200"
              value={goals.daily_carbs_g || ''}
              onChange={(e) => setGoals({ ...goals, daily_carbs_g: e.target.value ? parseInt(e.target.value) : null })}
              className="bg-white border-[#4A6741]/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fat" className="text-[#4A6741]">
              Fat (g)
            </Label>
            <Input
              id="fat"
              type="number"
              placeholder="e.g., 65"
              value={goals.daily_fat_g || ''}
              onChange={(e) => setGoals({ ...goals, daily_fat_g: e.target.value ? parseInt(e.target.value) : null })}
              className="bg-white border-[#4A6741]/20"
            />
          </div>
        </div>

        {/* Activity Level */}
        <div className="space-y-2">
          <Label htmlFor="activity" className="text-[#4A6741]">
            Activity Level
          </Label>
          <Select
            value={goals.activity_level || ''}
            onValueChange={(value) => setGoals({ ...goals, activity_level: value as any || null })}
          >
            <SelectTrigger className="bg-white border-[#4A6741]/20">
              <SelectValue placeholder="Select activity level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedentary">Sedentary</SelectItem>
              <SelectItem value="lightly_active">Lightly Active</SelectItem>
              <SelectItem value="moderately_active">Moderately Active</SelectItem>
              <SelectItem value="very_active">Very Active</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Fitness Goal */}
        <div className="space-y-2">
          <Label htmlFor="fitness" className="text-[#4A6741]">
            Fitness Goal
          </Label>
          <Select
            value={goals.fitness_goal || ''}
            onValueChange={(value) => setGoals({ ...goals, fitness_goal: value as any || null })}
          >
            <SelectTrigger className="bg-white border-[#4A6741]/20">
              <SelectValue placeholder="Select fitness goal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weight_loss">Weight Loss</SelectItem>
              <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="general_health">General Health</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          disabled={saving}
          className="w-full h-12 rounded-[32px] bg-[#4A6741] text-white hover:bg-[#4A6741]/90"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Goals'
          )}
        </Button>
      </form>
    </Card>
  );
}
