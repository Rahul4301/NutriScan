'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Calendar, CheckCircle2, Circle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MainNav } from '@/components/navigation/main-nav';
import {
  getMealPlans,
  createMealPlan,
  deleteMealPlan,
  type MealPlan,
} from '@/lib/actions/meal-plans';
// Simple date formatting helper
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
};

const getWeekEnd = (date: Date): Date => {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end;
};

export default function MealPlansPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPlan, setNewPlan] = useState({
    plan_name: '',
    start_date: formatDate(getWeekStart(new Date())),
    end_date: formatDate(getWeekEnd(new Date())),
    notes: '',
  });
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadPlans();
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

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await getMealPlans();
      setPlans(data);
    } catch (error) {
      console.error('Failed to load meal plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to load meal plans',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    if (!newPlan.plan_name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a plan name',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      await createMealPlan(newPlan);
      toast({
        title: 'Success',
        description: 'Meal plan created!',
      });
      setShowCreateDialog(false);
      setNewPlan({
        plan_name: '',
        start_date: formatDate(getWeekStart(new Date())),
        end_date: formatDate(getWeekEnd(new Date())),
        notes: '',
      });
      loadPlans();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create meal plan',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this meal plan?')) return;

    try {
      await deleteMealPlan(planId);
      toast({
        title: 'Success',
        description: 'Meal plan deleted',
      });
      loadPlans();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete meal plan',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#4A6741]/30 border-t-[#4A6741] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#4A6741]">Loading meal plans...</p>
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
              <h1 className="text-2xl font-headline text-[#4A6741]">Meal Plans</h1>
              <p className="text-sm text-[#4A6741]/60">Plan your meals for the week</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="rounded-[32px] bg-[#4A6741] text-white hover:bg-[#4A6741]/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Plan
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="text-[#4A6741] hover:bg-[#4A6741]/10"
              >
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 pb-24">
        {plans.length === 0 ? (
          <Card className="p-12 text-center bg-[#F5F5F0]/90 border border-[#4A6741]/20 rounded-3xl">
            <Calendar className="h-12 w-12 text-[#4A6741]/40 mx-auto mb-4" />
            <h3 className="text-xl font-headline text-[#4A6741] mb-2">No meal plans yet</h3>
            <p className="text-sm text-[#4A6741]/60 mb-6">
              Create your first meal plan to start planning your meals
            </p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="rounded-[32px] bg-[#4A6741] text-white hover:bg-[#4A6741]/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Meal Plan
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className="p-6 bg-[#F5F5F0]/90 border border-[#4A6741]/20 rounded-3xl hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/meal-plans/${plan.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-headline text-[#4A6741] mb-2">
                      {plan.plan_name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-[#4A6741]/60">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(plan.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                        {new Date(plan.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  {plan.is_active ? (
                    <CheckCircle2 className="h-5 w-5 text-[#4A6741]" />
                  ) : (
                    <Circle className="h-5 w-5 text-[#4A6741]/40" />
                  )}
                </div>
                {plan.notes && (
                  <p className="text-sm text-[#4A6741]/70 mb-4 line-clamp-2">{plan.notes}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/meal-plans/${plan.id}`);
                    }}
                    className="flex-1 rounded-[32px] border-[#4A6741]/20 text-[#4A6741]"
                  >
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlan(plan.id!);
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#F5F5F0] border-[#4A6741]/20 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-[#4A6741]">Create Meal Plan</DialogTitle>
            <DialogDescription>
              Plan your meals for the week ahead
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plan_name" className="text-[#4A6741]">
                Plan Name
              </Label>
              <Input
                id="plan_name"
                value={newPlan.plan_name}
                onChange={(e) => setNewPlan({ ...newPlan, plan_name: e.target.value })}
                placeholder="e.g., Week of Jan 15"
                className="bg-white border-[#4A6741]/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date" className="text-[#4A6741]">
                  Start Date
                </Label>
                <Input
                  id="start_date"
                  type="date"
                  value={newPlan.start_date}
                  onChange={(e) => setNewPlan({ ...newPlan, start_date: e.target.value })}
                  className="bg-white border-[#4A6741]/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date" className="text-[#4A6741]">
                  End Date
                </Label>
                <Input
                  id="end_date"
                  type="date"
                  value={newPlan.end_date}
                  onChange={(e) => setNewPlan({ ...newPlan, end_date: e.target.value })}
                  className="bg-white border-[#4A6741]/20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-[#4A6741]">
                Notes (optional)
              </Label>
              <Textarea
                id="notes"
                value={newPlan.notes}
                onChange={(e) => setNewPlan({ ...newPlan, notes: e.target.value })}
                placeholder="Any notes about this meal plan..."
                className="bg-white border-[#4A6741]/20"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              className="rounded-[32px] border-[#4A6741]/20 text-[#4A6741]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePlan}
              disabled={creating}
              className="rounded-[32px] bg-[#4A6741] text-white hover:bg-[#4A6741]/90"
            >
              {creating ? 'Creating...' : 'Create Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <MainNav />
    </div>
  );
}
