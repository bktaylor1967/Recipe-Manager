import React, { useState } from 'react';
import { Cookbook } from '../types/recipe';
import { BookMarked, Plus, FolderPlus, X, Check } from 'lucide-react';

interface CookbooksManagerProps {
  cookbooks: Cookbook[];
  selectedCookbookId: string | null;
  onSelectCookbook: (id: string | null) => void;
  onCreateCookbook: (title: string, description: string) => void;
  totalRecipeCount: number;
}

export const CookbooksManager: React.FC<CookbooksManagerProps> = ({
  cookbooks,
  selectedCookbookId,
  onSelectCookbook,
  onCreateCookbook,
  totalRecipeCount,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreateCookbook(title.trim(), description.trim());
    setTitle('');
    setDescription('');
    setIsModalOpen(false);
  };

  return (
    <div>
      {/* Horizontal filter pill bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => onSelectCookbook(null)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCookbookId === null
              ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs'
              : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 border border-stone-200/80 dark:border-stone-700'
          }`}
        >
          <span>All Recipes</span>
          <span className="ml-1.5 opacity-70 tabular-nums">({totalRecipeCount})</span>
        </button>

        {cookbooks.map((cb) => {
          const isSelected = selectedCookbookId === cb.id;
          return (
            <button
              key={cb.id}
              onClick={() => onSelectCookbook(cb.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs'
                  : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 border border-stone-200/80 dark:border-stone-700'
              }`}
            >
              <BookMarked className="w-3.5 h-3.5 text-orange-500" />
              <span>{cb.title}</span>
            </button>
          );
        })}

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 hover:bg-orange-100 flex items-center gap-1 whitespace-nowrap transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Cookbook</span>
        </button>
      </div>

      {/* New Cookbook Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-stone-50 dark:bg-stone-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <FolderPlus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  Create New Cookbook
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Cookbook Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Quick 15-Min Dinners, Sunday Baking"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Description (optional)
                </label>
                <input
                  type="text"
                  placeholder="Short note about what goes inside..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  Create Cookbook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
