import React from 'react';
import { Plus, Sun, Moon, UtensilsCrossed } from 'lucide-react';

interface NavbarProps {
  currentTab: 'recipes' | 'discover' | 'plan' | 'grocery';
  setCurrentTab: (tab: 'recipes' | 'discover' | 'plan' | 'grocery') => void;
  onOpenImport: () => void;
  isDark: boolean;
  toggleDark: () => void;
  groceryCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenImport,
  isDark,
  toggleDark,
  groceryCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-stone-50/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setCurrentTab('recipes')}
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-stone-900 dark:text-stone-50 whitespace-nowrap shrink-0 group focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="w-4 h-4" />
          </div>
          <span>ReciMe</span>
        </button>

        {/* Zone 2: 4 clean single-line nav links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button
            onClick={() => setCurrentTab('recipes')}
            className={`whitespace-nowrap transition-colors pb-1 border-b-2 ${
              currentTab === 'recipes'
                ? 'border-orange-600 text-stone-900 dark:text-stone-50 font-semibold'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            My Recipes
          </button>
          <button
            onClick={() => setCurrentTab('discover')}
            className={`whitespace-nowrap transition-colors pb-1 border-b-2 ${
              currentTab === 'discover'
                ? 'border-orange-600 text-stone-900 dark:text-stone-50 font-semibold'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => setCurrentTab('plan')}
            className={`whitespace-nowrap transition-colors pb-1 border-b-2 ${
              currentTab === 'plan'
                ? 'border-orange-600 text-stone-900 dark:text-stone-50 font-semibold'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            Meal Plan
          </button>
          <button
            onClick={() => setCurrentTab('grocery')}
            className={`whitespace-nowrap transition-colors pb-1 border-b-2 flex items-center gap-1.5 ${
              currentTab === 'grocery'
                ? 'border-orange-600 text-stone-900 dark:text-stone-50 font-semibold'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <span>Grocery List</span>
            {groceryCount > 0 && (
              <span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 tabular-nums">
                ({groceryCount})
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: 1 primary action + theme toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleDark}
            aria-label="Toggle color theme"
            className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors focus:outline-none"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenImport}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 active:scale-[0.98] transition-all shadow-sm whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Save Recipe</span>
          </button>
        </div>
      </div>
    </header>
  );
};
