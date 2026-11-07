import React, { useState } from 'react';
import { Recipe, Cookbook } from '../types/recipe';
import { X, Check, FolderPlus, Bookmark, Plus } from 'lucide-react';

interface ManageCookbooksModalProps {
  recipe: Recipe;
  allCookbooks: Cookbook[];
  onClose: () => void;
  onUpdateRecipeCookbooks: (recipeId: string, cookbookIds: string[]) => void;
  onCreateCookbook: (title: string, description: string) => void;
}

export const ManageCookbooksModal: React.FC<ManageCookbooksModalProps> = ({
  recipe,
  allCookbooks,
  onClose,
  onUpdateRecipeCookbooks,
  onCreateCookbook,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(recipe.cookbookIds || []);
  const [newTitle, setNewTitle] = useState('');
  const [showNewInput, setShowNewInput] = useState(false);

  const toggleCookbook = (cbId: string) => {
    setSelectedIds((prev) =>
      prev.includes(cbId) ? prev.filter((id) => id !== cbId) : [...prev, cbId]
    );
  };

  const handleSave = () => {
    onUpdateRecipeCookbooks(recipe.id, selectedIds);
    onClose();
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newId = `cb-${Date.now()}`;
    onCreateCookbook(newTitle.trim(), '');
    setSelectedIds((prev) => [...prev, newId]);
    setNewTitle('');
    setShowNewInput(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-[#FAF8F5] dark:bg-stone-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950 text-[#FF5A1F] flex items-center justify-center">
              <Bookmark className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif text-stone-900 dark:text-stone-100">
                Organize Cookbooks
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1">
                {recipe.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cookbooks Checklist */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {allCookbooks.map((cb) => {
            const isChecked = selectedIds.includes(cb.id);

            return (
              <div
                key={cb.id}
                onClick={() => toggleCookbook(cb.id)}
                className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  isChecked
                    ? 'bg-[#FEEFEA] dark:bg-orange-950/40 border-orange-300 dark:border-orange-800 text-stone-900 dark:text-stone-100'
                    : 'bg-white dark:bg-stone-800 border-stone-200/80 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      isChecked
                        ? 'bg-[#FF5A1F] border-[#FF5A1F] text-white'
                        : 'border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold block">{cb.title}</span>
                    {cb.description && (
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1">
                        {cb.description}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Create new cookbook row */}
        {showNewInput ? (
          <form onSubmit={handleCreate} className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="New cookbook name..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
              autoFocus
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-[#FF5A1F] text-white text-xs font-semibold shadow-xs"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowNewInput(false)}
              className="px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowNewInput(true)}
            className="w-full py-2.5 px-3 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:text-[#FF5A1F] hover:border-orange-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create new cookbook</span>
          </button>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-[#FF5A1F] hover:bg-[#E84E15] text-white text-xs font-semibold shadow-xs transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
