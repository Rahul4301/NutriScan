'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Target, UtensilsCrossed, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { MainNav } from '@/components/navigation/main-nav';
import { DailySummaryCard } from '@/components/dashboard/daily-summary-card';
import { StreakCard } from '@/components/dashboard/streak-card';
import { GoalsForm } from '@/components/goals/goals-form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getDailySummary } from '@/lib/actions/summaries';
import { getUserNutritionalGoals } from '@/lib/actions/nutrition-goals';
import { getUserStreak } from '@/lib/actions/streaks';
import { getMealsByDate, deleteMeal } from '@/lib/actions/meals';
import type { DailySummary } from '@/lib/actions/summaries';
import type { NutritionalGoals } from '@/lib/actions/nutrition-goals';
import type { UserStreak } from '@/lib/actions/streaks';
import type { LoggedMeal } from '@/lib/actions/meals';
// Simple date formatting helpers
const formatDate = (date: Date, formatStr: string = 'EEEE, MMMM d, yyyy'): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  if (formatStr === 'EEEE, MMMM d, yyyy') {
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }
  return date.toLocaleDateString();
};

const formatDateISO = (date: Date): string => {
  return date.toISOString().split('T')[0];
};
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [goals, setGoals] = useState<NutritionalGoals | null>(null);
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [todayMeals, setTodayMeals] = useState<LoggedMeal[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Check for tab query parameter
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'goals') {
      setActiveTab('goals');
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth');
      return;
    }
    setUser(user);
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const today = formatDateISO(new Date());
      
      const [summaryData, goalsData, streakData, mealsData] = await Promise.all([
        getDailySummary(today),
        getUserNutritionalGoals(),
        getUserStreak(),
        getMealsByDate(today),
      ]);

      setSummary(summaryData);
      setGoals(goalsData);
      setStreak(streakData);
      setTodayMeals(mealsData || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeal = async (mealId: string, foodName: string) => {
    if (!confirm(`Are you sure you want to delete "${foodName}"?`)) {
      return;
    }

    try {
      await deleteMeal(mealId);
      toast({
        title: 'Meal deleted',
        description: `"${foodName}" has been removed from your log.`,
      });
      // Reload dashboard data to reflect the deletion
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to delete meal:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete meal',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#4A6741]/30 border-t-[#4A6741] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#4A6741]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#F5F5F0]/95 backdrop-blur-md border-b border-[#4A6741]/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-headline text-[#4A6741]">Dashboard</h1>
              <p className="text-sm text-[#4A6741]/60">{formatDate(new Date())}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/app')}
                className="text-[#4A6741] hover:bg-[#4A6741]/10"
              >
                Scan Menu
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 pb-24 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/50 border border-[#4A6741]/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#4A6741] data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="goals" className="data-[state=active]:bg-[#4A6741] data-[state=active]:text-white">
              Goals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Streak Card */}
            <StreakCard streak={streak} />

            {/* Daily Summary */}
            <DailySummaryCard summary={summary} goals={goals} />

            {/* Today's Meals */}
            <Card className="p-6 bg-[#F5F5F0]/90 border border-[#4A6741]/20 rounded-3xl">
              <div className="flex items-center gap-3 mb-4">
                <UtensilsCrossed className="h-5 w-5 text-[#4A6741]" />
                <h2 className="text-xl font-headline text-[#4A6741]">Today's Meals</h2>
              </div>
              {todayMeals.length === 0 ? (
                <p className="text-sm text-[#4A6741]/60 italic">
                  No meals logged today. Start by scanning a menu!
                </p>
              ) : (
                <div className="space-y-3">
                  {todayMeals.map((meal) => (
                    <div
                      key={meal.id}
                      className="p-4 rounded-2xl bg-white/50 border border-[#4A6741]/10 hover:bg-white/70 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-medium text-[#4A6741]">{meal.food_name}</p>
                          <p className="text-sm text-[#4A6741]/60">{meal.meal_name}</p>
                        </div>
                        <div className="text-right flex-1">
                          <p className="font-semibold text-[#4A6741]">
                            {meal.calories || 0} kcal
                          </p>
                          <p className="text-xs text-[#4A6741]/60">
                            {meal.protein_g?.toFixed(0)}g P • {meal.carbs_g?.toFixed(0)}g C • {meal.fat_g?.toFixed(0)}g F
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => meal.id && handleDeleteMeal(meal.id, meal.food_name)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 flex-shrink-0"
                          title="Delete meal"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="goals">
            <GoalsForm />
          </TabsContent>
        </Tabs>
      </main>
      <MainNav />
    </div>
  );
}
