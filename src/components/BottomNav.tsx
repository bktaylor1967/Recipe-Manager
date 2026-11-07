import React from 'react';
import { BookOpen, Compass, CalendarDays, ShoppingBag, Plus } from 'lucide-react';

interface BottomNavProps {
  currentTab: 'recipes' | 'discover' | 'plan' | 'grocery';
  setCurrentTab: (tab: 'recipes' | 'discover' | 'plan' | 'grocery') => void;
  onOpenImport: () => void;
  groceryCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  setCurrentTab,
  onOpenImport,
  groceryCount,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-50/95 dark:bg-stone-900/95 backdrop-blur-lg border-t border-stone-200/80 dark:border-stone-800 pb-safe">
      <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-2">
        <button
          onClick={() => setCurrentTab('recipes')}
          className={`min-h-[44px] flex flex-col items-center justify-center transition-colors ${
            currentTab === 'recipes'
              ? 'text-orange-600 dark:text-orange-500 font-medium'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Recipes</span>
        </button>

        <button
          onClick={() => setCurrentTab('discover')}
          className={`min-h-[44px] flex flex-col items-center justify-center transition-colors ${
            currentTab === 'discover'
              ? 'text-orange-600 dark:text-orange-500 font-medium'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Discover</span>
        </button>

        {/* Center Primary Action: Quick Save */}
        <div className="flex items-center justify-center">
          <button
            onClick={onOpenImport}
            aria-label="Save recipe"
            className="w-12 h-12 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-600/30 active:scale-95 transition-transform"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        <button
          onClick={() => setCurrentTab('plan')}
          className={`min-h-[44px] flex flex-col items-center justify-center transition-colors ${
            currentTab === 'plan'
              ? 'text-orange-600 dark:text-orange-500 font-medium'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
          }`}
        >
          <CalendarDays className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Planner</span>
        </button>

        <button
          onClick={() => setCurrentTab('grocery')}
          className={`min-h-[44px] flex flex-col items-center justify-center relative transition-colors ${
            currentTab === 'grocery'
              ? 'text-orange-600 dark:text-orange-500 font-medium'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {groceryCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-orange-600 text-[9px] font-bold text-white flex items-center justify-center">
                {groceryCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Grocery</span>
        </button>
      </div>
    </div>
  );
};
