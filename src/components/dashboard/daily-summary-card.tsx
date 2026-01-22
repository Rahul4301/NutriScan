'use client';

import { Card } from '@/components/ui/card';
import { Flame, Beef, Wheat, Droplets, Target, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DailySummary } from '@/lib/actions/summaries';
import type { NutritionalGoals } from '@/lib/actions/nutrition-goals';

interface DailySummaryCardProps {
  summary: DailySummary | null;
  goals: NutritionalGoals | null;
}

const FatIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 3c-1.2 0-2.3.4-3.2 1.1A6.7 6.7 0 0 0 6 9.3c0 3.4 2.7 6.2 6 6.2s6-2.8 6-6.2c0-1.9-.8-3.6-2.1-4.9A5.4 5.4 0 0 0 12 3Z" />
  </svg>
);

export function DailySummaryCard({ summary, goals }: DailySummaryCardProps) {
  const calories = summary?.total_calories || 0;
  const protein = summary?.total_protein_g || 0;
  const carbs = summary?.total_carbs_g || 0;
  const fat = summary?.total_fat_g || 0;
  const mealCount = summary?.meal_count || 0;

  const calorieGoal = goals?.daily_calories || 0;
  const proteinGoal = goals?.daily_protein_g || 0;
  const carbsGoal = goals?.daily_carbs_g || 0;
  const fatGoal = goals?.daily_fat_g || 0;

  const calorieProgress = calorieGoal > 0 ? Math.min((calories / calorieGoal) * 100, 100) : 0;
  const proteinProgress = proteinGoal > 0 ? Math.min((protein / proteinGoal) * 100, 100) : 0;
  const carbsProgress = carbsGoal > 0 ? Math.min((carbs / carbsGoal) * 100, 100) : 0;
  const fatProgress = fatGoal > 0 ? Math.min((fat / fatGoal) * 100, 100) : 0;

  return (
    <div className="space-y-4">
      {/* Goal Achievement Badge */}
      {summary?.goal_achieved && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 p-3 rounded-2xl bg-[#4A6741]/10 border border-[#4A6741]/20"
        >
          <CheckCircle2 className="h-5 w-5 text-[#4A6741]" />
          <p className="text-sm font-medium text-[#4A6741]">Daily goals achieved! 🎉</p>
        </motion.div>
      )}

      {/* Calories Card */}
      <Card className="p-6 bg-[#F5F5F0]/90 border border-[#4A6741]/20 rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-[#C27D5F]/10">
              <Flame className="h-5 w-5 text-[#C27D5F]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#4A6741]/70">Calories</p>
              <p className="text-2xl font-headline text-[#4A6741]">
                {calories} {calorieGoal > 0 && `/ ${calorieGoal}`}
              </p>
            </div>
          </div>
        </div>
        {calorieGoal > 0 && (
          <div className="w-full h-2 bg-[#4A6741]/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${calorieProgress}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full rounded-full ${
                calorieProgress > 100 ? 'bg-red-500' : 'bg-[#C27D5F]'
              }`}
            />
          </div>
        )}
      </Card>

      {/* Macros Grid */}
      <div className="grid grid-cols-3 gap-4">
        <MacroCard
          icon={Beef}
          label="Protein"
          value={protein}
          goal={proteinGoal}
          progress={proteinProgress}
          color="text-[#4A6741]"
          bgColor="bg-[#4A6741]/10"
        />
        <MacroCard
          icon={Wheat}
          label="Carbs"
          value={carbs}
          goal={carbsGoal}
          progress={carbsProgress}
          color="text-[#4A6741]"
          bgColor="bg-[#4A6741]/10"
        />
        <MacroCard
          icon={FatIcon}
          label="Fats"
          value={fat}
          goal={fatGoal}
          progress={fatProgress}
          color="text-[#4A6741]"
          bgColor="bg-[#4A6741]/10"
        />
      </div>

      {/* Meal Count */}
      <Card className="p-4 bg-[#F5F5F0]/90 border border-[#4A6741]/20 rounded-2xl">
        <p className="text-sm text-[#4A6741]/70">
          <span className="font-semibold text-[#4A6741]">{mealCount}</span> meals logged today
        </p>
      </Card>
    </div>
  );
}

function MacroCard({
  icon: Icon,
  label,
  value,
  goal,
  progress,
  color,
  bgColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  goal: number;
  progress: number;
  color: string;
  bgColor: string;
}) {
  return (
    <Card className={`p-4 ${bgColor} border border-[#4A6741]/20 rounded-2xl`}>
      <div className="flex justify-center mb-2">
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <p className="text-xs text-center text-[#4A6741]/60 font-medium mb-1">{label}</p>
      <p className={`text-lg font-semibold text-center ${color}`}>
        {value.toFixed(0)}g
      </p>
      {goal > 0 && (
        <p className="text-xs text-center text-[#4A6741]/50 mt-1">
          {goal > 0 ? `of ${goal}g` : ''}
        </p>
      )}
      {goal > 0 && (
        <div className="w-full h-1 bg-[#4A6741]/10 rounded-full overflow-hidden mt-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-[#4A6741] rounded-full"
          />
        </div>
      )}
    </Card>
  );
}
