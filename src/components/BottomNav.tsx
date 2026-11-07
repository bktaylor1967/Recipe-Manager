import React from 'react';
import { Bookmark, Calendar, ShoppingCart, Compass, Plus } from 'lucide-react';
import { MainNavTab } from './Sidebar';

interface BottomNavProps {
  currentTab: MainNavTab;
  setCurrentTab: (tab: MainNavTab) => void;
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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 dark:bg-[#151413]/95 backdrop-blur-lg border-t border-stone-200/80 dark:border-stone-800 pb-safe select-none">
      <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-2">
        {/* Cookbooks */}
        <button
          onClick={() => setCurrentTab('cookbooks')}
          className={`min-h-[44px] flex flex-col items-center justify-center transition-colors ${
            currentTab === 'cookbooks'
              ? 'text-[#FF5A1F] font-semibold'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
          }`}
        >
          <Bookmark
            className={`w-5 h-5 ${
              currentTab === 'cookbooks' ? 'fill-current' : 'stroke-[1.8]'
            }`}
          />
          <span className="text-[10px] mt-1 tracking-tight">Cookbooks</span>
        </button>

        {/* Meal Plan */}
        <button
          onClick={() => setCurrentTab('plan')}
          className={`min-h-[44px] flex flex-col items-center justify-center transition-colors ${
            currentTab === 'plan'
              ? 'text-[#FF5A1F] font-semibold'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
          }`}
        >
          <Calendar
            className={`w-5 h-5 ${
              currentTab === 'plan' ? 'stroke-[2.3]' : 'stroke-[1.8]'
            }`}
          />
          <span className="text-[10px] mt-1 tracking-tight">Meal Plan</span>
        </button>

        {/* Center Primary Action: ReciMe Orange Circular + Button */}
        <div className="flex items-center justify-center">
          <button
            onClick={onOpenImport}
            aria-label="Save or import recipe"
            className="w-11 h-11 rounded-full bg-[#FF5A1F] text-white flex items-center justify-center shadow-md shadow-orange-600/30 active:scale-95 transition-transform"
          >
            <Plus className="w-5 h-5 stroke-[2.7]" />
          </button>
        </div>

        {/* Groceries */}
        <button
          onClick={() => setCurrentTab('grocery')}
          className={`min-h-[44px] flex flex-col items-center justify-center relative transition-colors ${
            currentTab === 'grocery'
              ? 'text-[#FF5A1F] font-semibold'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
          }`}
        >
          <div className="relative">
            <ShoppingCart
              className={`w-5 h-5 ${
                currentTab === 'grocery' ? 'stroke-[2.3]' : 'stroke-[1.8]'
              }`}
            />
            {groceryCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[15px] h-3.5 px-1 rounded-full bg-[#FF5A1F] text-[9px] font-bold text-white flex items-center justify-center">
                {groceryCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Groceries</span>
        </button>

        {/* Discover */}
        <button
          onClick={() => setCurrentTab('discover')}
          className={`min-h-[44px] flex flex-col items-center justify-center transition-colors ${
            currentTab === 'discover'
              ? 'text-[#FF5A1F] font-semibold'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
          }`}
        >
          <Compass
            className={`w-5 h-5 ${
              currentTab === 'discover' ? 'stroke-[2.3]' : 'stroke-[1.8]'
            }`}
          />
          <span className="text-[10px] mt-1 tracking-tight">Discover</span>
        </button>
      </div>
    </div>
  );
};
