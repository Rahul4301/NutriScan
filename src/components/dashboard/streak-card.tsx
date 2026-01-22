'use client';

import { Card } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import type { UserStreak } from '@/lib/actions/streaks';

interface StreakCardProps {
  streak: UserStreak | null;
}

export function StreakCard({ streak }: StreakCardProps) {
  const currentStreak = streak?.current_streak_days || 0;
  const longestStreak = streak?.longest_streak_days || 0;

  return (
    <Card className="p-6 bg-gradient-to-br from-[#C27D5F]/10 to-[#4A6741]/10 border border-[#4A6741]/20 rounded-3xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-2xl bg-[#C27D5F]/20">
          <Flame className="h-6 w-6 text-[#C27D5F]" />
        </div>
        <div>
          <p className="text-sm font-medium text-[#4A6741]/70">Current Streak</p>
          <p className="text-3xl font-headline text-[#4A6741]">
            {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
          </p>
        </div>
      </div>
      {longestStreak > 0 && (
        <p className="text-sm text-[#4A6741]/60">
          Best: <span className="font-semibold text-[#4A6741]">{longestStreak} days</span>
        </p>
      )}
      {currentStreak === 0 && (
        <p className="text-sm text-[#4A6741]/60 italic">
          Start logging meals to build your streak!
        </p>
      )}
    </Card>
  );
}
