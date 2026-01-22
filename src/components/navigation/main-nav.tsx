'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Home, Calendar, Target, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function MainNav() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: Home },
    { id: 'scan', path: '/app', label: 'Scan Menu', icon: UtensilsCrossed },
    { id: 'meal-plans', path: '/meal-plans', label: 'Meal Plans', icon: Calendar },
    { id: 'goals', path: '/dashboard', label: 'Goals', icon: Target, query: '?tab=goals', exact: false },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#F5F5F0]/95 backdrop-blur-md border-t border-[#4A6741]/10">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact === false 
              ? pathname?.startsWith(item.path)
              : pathname === item.path || (item.query && pathname?.includes(item.path));
            
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path + (item.query || ''))}
                className={cn(
                  'flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all',
                  isActive
                    ? 'text-[#4A6741] bg-[#4A6741]/10'
                    : 'text-[#4A6741]/60 hover:text-[#4A6741] hover:bg-[#4A6741]/5'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
