import React, { useState } from 'react';
import { Cookbook } from '../types/recipe';
import { BookMarked, Plus, FolderPlus, X, Trash2, Edit2 } from 'lucide-react';

interface CookbooksManagerProps {
  cookbooks: Cookbook[];
  selectedCookbookId: string | null;
  onSelectCookbook: (id: string | null) => void;
  onCreateCookbook: (title: string, description: string) => void;
  onDeleteCookbook?: (cookbookId: string) => void;
  totalRecipeCount: number;
}

export const CookbooksManager: React.FC<CookbooksManagerProps> = ({
  cookbooks,
  selectedCookbookId,
  onSelectCookbook,
  onCreateCookbook,
  onDeleteCookbook,
  totalRecipeCount,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showConfirmDeleteCb, setShowConfirmDeleteCb] = useState(false);

  const selectedCookbook = cookbooks.find((c) => c.id === selectedCookbookId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreateCookbook(title.trim(), description.trim());
    setTitle('');
    setDescription('');
    setIsModalOpen(false);
  };

  const handleDeleteCurrentCookbook = () => {
    if (onDeleteCookbook && selectedCookbookId) {
      onDeleteCookbook(selectedCookbookId);
      setShowConfirmDeleteCb(false);
    }
  };

  return (
    <div className="space-y-3">
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
                  ? 'bg-[#FF5A1F] text-white shadow-xs'
                  : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 border border-stone-200/80 dark:border-stone-700'
              }`}
            >
              <BookMarked
                className={`w-3.5 h-3.5 ${
                  isSelected ? 'text-white' : 'text-[#FF5A1F]'
                }`}
              />
              <span>{cb.title}</span>
            </button>
          );
        })}

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#FF5A1F] dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 hover:bg-orange-100 flex items-center gap-1 whitespace-nowrap transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Cookbook</span>
        </button>
      </div>

      {/* Active Cookbook Details Strip if a cookbook is selected */}
      {selectedCookbook && (
        <div className="p-3.5 rounded-2xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/70 dark:border-orange-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                {selectedCookbook.title}
              </span>
              <span className="text-orange-700 dark:text-orange-400 font-semibold text-[11px]">
                Cookbook
              </span>
            </div>
            {selectedCookbook.description && (
              <p className="text-stone-600 dark:text-stone-400 text-xs mt-0.5">
                {selectedCookbook.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onDeleteCookbook && (
              <button
                onClick={() => setShowConfirmDeleteCb(true)}
                className="px-3 py-1.5 rounded-xl text-stone-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-1 transition-colors font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Cookbook</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* In-app confirmation for deleting the cookbook itself */}
      {showConfirmDeleteCb && selectedCookbook && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/70 border border-red-200 dark:border-red-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="text-red-900 dark:text-red-200">
            <span className="font-bold block">Delete cookbook "{selectedCookbook.title}"?</span>
            <span>Your recipes will remain in "All Recipes", but this cookbook folder will be removed.</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowConfirmDeleteCb(false)}
              className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteCurrentCookbook}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold shadow-xs"
            >
              Yes, Delete Cookbook
            </button>
          </div>
        </div>
      )}

      {/* New Cookbook Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-[#FAF8F5] dark:bg-stone-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950 text-[#FF5A1F] flex items-center justify-center">
                  <FolderPlus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold font-serif text-stone-900 dark:text-stone-100">
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]"
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
                  className="px-5 py-2 rounded-xl bg-[#FF5A1F] hover:bg-[#E84E15] text-white text-xs font-semibold shadow-xs transition-all"
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
