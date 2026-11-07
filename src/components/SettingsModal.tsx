import React, { useState } from 'react';
import { X, Sun, Moon, Scale, Users, Utensils, Download, Check, Sparkles, Puzzle } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  isDark: boolean;
  toggleDark: () => void;
  defaultServings: number;
  setDefaultServings: (servings: number) => void;
  defaultUnit: 'metric' | 'imperial';
  setDefaultUnit: (unit: 'metric' | 'imperial') => void;
  onOpenExtension?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  isDark,
  toggleDark,
  defaultServings,
  setDefaultServings,
  defaultUnit,
  setDefaultUnit,
  onOpenExtension,
}) => {
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>([
    'High-Protein',
    'Under 30 Min',
  ]);
  const [savedNotification, setSavedNotification] = useState(false);

  const availableDiets = [
    'High-Protein',
    'Under 30 Min',
    'Vegetarian',
    'Gluten-Free',
    'Dairy-Free',
    'Keto',
    'Low Carb',
  ];

  const toggleDiet = (diet: string) => {
    setDietaryPrefs((prev) =>
      prev.includes(diet) ? prev.filter((d) => d !== diet) : [...prev, diet]
    );
  };

  const handleExport = () => {
    const data = {
      recipes: localStorage.getItem('recime_recipes'),
      cookbooks: localStorage.getItem('recime_cookbooks'),
      grocery: localStorage.getItem('recime_grocery'),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recime-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] dark:bg-stone-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
          <div>
            <h2 className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100">
              Settings & Preferences
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Customize your cooking and recipe preferences
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Setting 1: Theme */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-stone-800/80 border border-stone-200/70 dark:border-stone-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-sm font-semibold text-stone-800 dark:text-stone-200 block">
                Appearance
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {isDark ? 'Dark Theme (OLED Friendly)' : 'Warm Cream Light Theme'}
              </span>
            </div>
          </div>
          <button
            onClick={toggleDark}
            className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-600 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
          >
            {isDark ? 'Switch to Light' : 'Switch to Dark'}
          </button>
        </div>

        {/* Setting 2: Measurement Units */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-stone-800/80 border border-stone-200/70 dark:border-stone-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-stone-800 dark:text-stone-200 block">
                Default Measurement Units
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                Applied to ingredient scaling
              </span>
            </div>
          </div>
          <div className="flex items-center p-0.5 rounded-xl bg-stone-100 dark:bg-stone-700 text-xs font-semibold">
            <button
              onClick={() => setDefaultUnit('metric')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                defaultUnit === 'metric'
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              Metric (g/ml)
            </button>
            <button
              onClick={() => setDefaultUnit('imperial')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                defaultUnit === 'imperial'
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              US (oz/cups)
            </button>
          </div>
        </div>

        {/* Setting 3: Default Servings */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-stone-800/80 border border-stone-200/70 dark:border-stone-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-stone-800 dark:text-stone-200 block">
                Default Household Servings
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                Initial scale for imported recipes
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 4, 6].map((num) => (
              <button
                key={num}
                onClick={() => setDefaultServings(num)}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                  defaultServings === num
                    ? 'bg-[#FF5A1F] text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Setting 4: Dietary Filters */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 block">
            Favorite Dietary Tags
          </span>
          <div className="flex flex-wrap gap-2">
            {availableDiets.map((diet) => {
              const active = dietaryPrefs.includes(diet);
              return (
                <button
                  key={diet}
                  onClick={() => toggleDiet(diet)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-[#FEEFEA] dark:bg-orange-950/60 text-[#FF5A1F] border border-orange-200 dark:border-orange-900/60 font-semibold'
                      : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700'
                  }`}
                >
                  {active && <Check className="w-3.5 h-3.5" />}
                  <span>{diet}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Setting 5: Browser Extension */}
        <div className="p-4 rounded-2xl bg-[#FEEFEA]/50 dark:bg-orange-950/20 border border-orange-200/80 dark:border-orange-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/40 text-[#FF5A1F] flex items-center justify-center">
              <Puzzle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-stone-900 dark:text-stone-100 block">
                Chrome & Edge Extension
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                1-click recipe capture directly while browsing Instagram, TikTok & blogs
              </span>
            </div>
          </div>
          {onOpenExtension && (
            <button
              onClick={() => {
                onClose();
                onOpenExtension();
              }}
              className="px-3 py-1.5 rounded-xl bg-[#FF5A1F] hover:bg-[#E84E15] text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
            >
              Open Hub
            </button>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <button
            onClick={handleExport}
            className="text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Recipe Data</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-[#E84E15] text-white text-xs font-semibold shadow-sm transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
