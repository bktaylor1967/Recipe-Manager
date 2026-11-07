import React, { useState } from 'react';
import {
  Menu,
  Plus,
  Bookmark,
  Calendar,
  ShoppingCart,
  Smartphone,
  Settings,
  Compass,
  Sun,
  Moon,
  X,
  User,
  Heart,
  BookOpen,
} from 'lucide-react';

import { UserProfile } from '../types/recipe';

export type MainNavTab = 'cookbooks' | 'discover' | 'plan' | 'grocery' | 'settings';

interface SidebarProps {
  currentTab: MainNavTab;
  setCurrentTab: (tab: MainNavTab) => void;
  currentUser: UserProfile | null;
  onOpenImport: () => void;
  onOpenAuth: () => void;
  onOpenSettings: () => void;
  isDark: boolean;
  toggleDark: () => void;
  groceryCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onOpenImport,
  onOpenAuth,
  onOpenSettings,
  isDark,
  toggleDark,
  groceryCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Desktop / Tablet Vertical Sidebar */}
      <aside className="hidden md:flex flex-col items-center justify-between py-6 px-3 w-20 lg:w-[88px] bg-[#FAF8F5] dark:bg-[#151413] shrink-0 min-h-screen sticky top-0 select-none transition-colors">
        {/* Top Group: Hamburger & Primary + Button & Nav Items */}
        <div className="flex flex-col items-center w-full gap-4">
          {/* Hamburger Menu Icon */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label="Toggle navigation menu"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-stone-800 dark:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800/60 transition-colors focus:outline-none"
          >
            <Menu className="w-5 h-5 stroke-[2.2]" />
          </button>

          {/* ReciMe Signature Vibrant Orange Circular + Button */}
          <button
            onClick={onOpenImport}
            aria-label="Add or import recipe"
            title="Import from Instagram, TikTok, Photo, or Link"
            className="w-11 h-11 rounded-full bg-[#FF5A1F] text-white flex items-center justify-center shadow-md shadow-orange-600/25 hover:bg-[#E84E15] hover:scale-105 active:scale-95 transition-all focus:outline-none"
          >
            <Plus className="w-5 h-5 stroke-[2.7]" />
          </button>

          {/* Primary Nav List (Cookbooks, Meal Plan, Groceries) */}
          <div className="flex flex-col items-center w-full gap-2 mt-2">
            {/* Cookbooks (Active State in reference image) */}
            <button
              onClick={() => setCurrentTab('cookbooks')}
              aria-label="Cookbooks"
              className={`w-full py-2.5 px-1.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                currentTab === 'cookbooks'
                  ? 'bg-[#FEEFEA] dark:bg-orange-950/40 text-[#FF5A1F] dark:text-orange-400 font-semibold'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/40 dark:hover:bg-stone-800/40'
              }`}
            >
              <Bookmark
                className={`w-5 h-5 ${
                  currentTab === 'cookbooks' ? 'fill-current' : 'stroke-[1.8]'
                }`}
              />
              <span className="text-[11px] tracking-tight leading-tight">Cookbooks</span>
            </button>

            {/* Meal Plan */}
            <button
              onClick={() => setCurrentTab('plan')}
              aria-label="Meal Plan"
              className={`w-full py-2.5 px-1.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                currentTab === 'plan'
                  ? 'bg-[#FEEFEA] dark:bg-orange-950/40 text-[#FF5A1F] dark:text-orange-400 font-semibold'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/40 dark:hover:bg-stone-800/40'
              }`}
            >
              <Calendar
                className={`w-5 h-5 ${
                  currentTab === 'plan' ? 'stroke-[2.3]' : 'stroke-[1.8]'
                }`}
              />
              <span className="text-[11px] tracking-tight leading-tight">Meal Plan</span>
            </button>

            {/* Groceries */}
            <button
              onClick={() => setCurrentTab('grocery')}
              aria-label="Groceries"
              className={`w-full py-2.5 px-1.5 rounded-2xl flex flex-col items-center justify-center gap-1 relative transition-all ${
                currentTab === 'grocery'
                  ? 'bg-[#FEEFEA] dark:bg-orange-950/40 text-[#FF5A1F] dark:text-orange-400 font-semibold'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/40 dark:hover:bg-stone-800/40'
              }`}
            >
              <div className="relative">
                <ShoppingCart
                  className={`w-5 h-5 ${
                    currentTab === 'grocery' ? 'stroke-[2.3]' : 'stroke-[1.8]'
                  }`}
                />
                {groceryCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[15px] h-3.5 px-1 rounded-full bg-[#FF5A1F] text-[9px] font-bold text-white flex items-center justify-center">
                    {groceryCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] tracking-tight leading-tight">Groceries</span>
            </button>

            {/* Discover (Community Feed) */}
            <button
              onClick={() => setCurrentTab('discover')}
              aria-label="Discover"
              className={`w-full py-2.5 px-1.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                currentTab === 'discover'
                  ? 'bg-[#FEEFEA] dark:bg-orange-950/40 text-[#FF5A1F] dark:text-orange-400 font-semibold'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/40 dark:hover:bg-stone-800/40'
              }`}
            >
              <Compass
                className={`w-5 h-5 ${
                  currentTab === 'discover' ? 'stroke-[2.3]' : 'stroke-[1.8]'
                }`}
              />
              <span className="text-[11px] tracking-tight leading-tight">Discover</span>
            </button>
          </div>
        </div>

        {/* Bottom Group: Divider, Log in, Settings */}
        <div className="flex flex-col items-center w-full gap-2">
          {/* Subtle Hairline Divider */}
          <div className="w-10 h-px bg-stone-300/80 dark:bg-stone-800 my-2" />

          {/* Log in or Profile */}
          <button
            onClick={onOpenAuth}
            aria-label={currentUser ? `Profile for @${currentUser.userId}` : 'Log in'}
            className="w-full py-2 px-1 rounded-2xl flex flex-col items-center justify-center gap-1 text-stone-700 dark:text-stone-300 hover:bg-stone-200/40 dark:hover:bg-stone-800/40 transition-all group"
          >
            {currentUser ? (
              <div className="relative">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full border border-orange-300 dark:border-stone-600 bg-orange-50 group-hover:scale-105 transition-transform"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white dark:border-stone-900" />
              </div>
            ) : (
              <Smartphone className="w-5 h-5 stroke-[1.8]" />
            )}
            <span className="text-[10px] tracking-tight leading-tight truncate max-w-[68px]">
              {currentUser ? `@${currentUser.userId}` : 'Log in'}
            </span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className="w-full py-2.5 px-1.5 rounded-2xl flex flex-col items-center justify-center gap-1 text-stone-700 dark:text-stone-300 hover:bg-stone-200/40 dark:hover:bg-stone-800/40 transition-all"
          >
            <Settings className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[11px] tracking-tight leading-tight">Settings</span>
          </button>
        </div>
      </aside>

      {/* Flyout Drawer when Hamburger Menu is clicked */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsExpanded(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Drawer content */}
          <div className="relative w-72 bg-[#FAF8F5] dark:bg-[#181615] h-full shadow-2xl p-6 flex flex-col justify-between border-r border-stone-200/80 dark:border-stone-800 animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-stone-200 dark:border-stone-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FF5A1F] text-white flex items-center justify-center font-bold text-sm">
                    R
                  </div>
                  <span className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-serif">
                    ReciMe
                  </span>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-200/60 dark:hover:bg-stone-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation links */}
              <div className="space-y-1.5 mt-6">
                <button
                  onClick={() => {
                    setCurrentTab('cookbooks');
                    setIsExpanded(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    currentTab === 'cookbooks'
                      ? 'bg-[#FEEFEA] dark:bg-orange-950/40 text-[#FF5A1F] font-semibold'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-800'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  <span>Cookbooks & Recipes</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentTab('plan');
                    setIsExpanded(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    currentTab === 'plan'
                      ? 'bg-[#FEEFEA] dark:bg-orange-950/40 text-[#FF5A1F] font-semibold'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-800'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Weekly Meal Planner</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentTab('grocery');
                    setIsExpanded(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    currentTab === 'grocery'
                      ? 'bg-[#FEEFEA] dark:bg-orange-950/40 text-[#FF5A1F] font-semibold'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-800'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span className="flex-1 text-left">Smart Groceries</span>
                  {groceryCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#FF5A1F] text-[10px] font-bold text-white">
                      {groceryCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setCurrentTab('discover');
                    setIsExpanded(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    currentTab === 'discover'
                      ? 'bg-[#FEEFEA] dark:bg-orange-950/40 text-[#FF5A1F] font-semibold'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-800'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  <span>Discover Creators</span>
                </button>
              </div>
            </div>

            {/* Bottom Actions inside drawer */}
            <div className="pt-6 border-t border-stone-200 dark:border-stone-800 space-y-2">
              <button
                onClick={toggleDark}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  <span>{isDark ? 'Light Theme' : 'Dark Theme'}</span>
                </div>
                <span className="text-[11px] text-stone-400">Toggle</span>
              </button>

              <button
                onClick={() => {
                  setIsExpanded(false);
                  onOpenAuth();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
              >
                <div className="flex items-center gap-2.5 truncate">
                  {currentUser ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-5 h-5 rounded-full border border-orange-200"
                    />
                  ) : (
                    <Smartphone className="w-4 h-4" />
                  )}
                  <span className="truncate">
                    {currentUser ? currentUser.name : 'Log in / Register'}
                  </span>
                </div>
                {currentUser && (
                  <span className="text-[10px] text-[#FF5A1F] font-bold">
                    @{currentUser.userId}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setIsExpanded(false);
                  onOpenSettings();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Settings & Preferences</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
