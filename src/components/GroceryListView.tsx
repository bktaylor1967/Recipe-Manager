import React, { useState } from 'react';
import { GroceryItem, IngredientCategory } from '../types/recipe';
import {
  ShoppingBag,
  Plus,
  Trash2,
  Check,
  Share2,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface GroceryListViewProps {
  items: GroceryItem[];
  onToggleItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onClearChecked: () => void;
  onAddItem: (newItem: Omit<GroceryItem, 'id' | 'addedAt'>) => void;
  onNavigateToRecipes: () => void;
}

const CATEGORY_ORDER: IngredientCategory[] = [
  'Produce',
  'Meat & Seafood',
  'Dairy & Eggs',
  'Bakery',
  'Pantry',
  'Spices & Seasonings',
  'Other',
];

export const GroceryListView: React.FC<GroceryListViewProps> = ({
  items,
  onToggleItem,
  onDeleteItem,
  onClearChecked,
  onAddItem,
  onNavigateToRecipes,
}) => {
  const [customName, setCustomName] = useState('');
  const [customQty, setCustomQty] = useState('');
  const [customCategory, setCustomCategory] =
    useState<IngredientCategory>('Produce');
  const [isAdding, setIsAdding] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const uncheckedCount = items.filter((i) => !i.checked).length;
  const checkedCount = items.filter((i) => i.checked).length;

  // Group items by category
  const groupedItems = CATEGORY_ORDER.reduce<
    Record<IngredientCategory, GroceryItem[]>
  >((acc, cat) => {
    acc[cat] = items.filter((item) => item.category === cat);
    return acc;
  }, {} as any);

  const handleCreateCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    onAddItem({
      name: customName.trim(),
      quantity: customQty.trim() || '1',
      unit: '',
      category: customCategory,
      checked: false,
    });

    setCustomName('');
    setCustomQty('');
    setIsAdding(false);
  };

  const handleCopyList = () => {
    if (items.length === 0) return;

    let text = '🛒 ReciMe Grocery List:\n\n';
    CATEGORY_ORDER.forEach((cat) => {
      const catItems = groupedItems[cat];
      if (catItems && catItems.length > 0) {
        text += `[${cat.toUpperCase()}]\n`;
        catItems.forEach((i) => {
          text += `${i.checked ? '✓' : '□'} ${i.quantity ? `${i.quantity} ` : ''}${i.unit ? `${i.unit} ` : ''}${i.name}\n`;
        });
        text += '\n';
      }
    });

    navigator.clipboard?.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <span>Smart Grocery List</span>
            <span className="text-xs px-2.5 py-1 rounded-md bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 font-semibold">
              Aisle Sorted
            </span>
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Organized by supermarket section so you never double-back in the store.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <>
              <button
                onClick={handleCopyList}
                className="px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Copy formatted list for sharing"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Copy List</span>
              </button>

              {checkedCount > 0 && (
                <button
                  onClick={onClearChecked}
                  className="px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:text-red-500 hover:bg-stone-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Checked ({checkedCount})</span>
                </button>
              )}
            </>
          )}

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {copiedNotification && (
        <div className="p-3 rounded-xl bg-emerald-600 text-white text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top">
          <Check className="w-4 h-4" />
          <span>Grocery list copied with checkboxes to clipboard!</span>
        </div>
      )}

      {/* Add Custom Item Form */}
      {isAdding && (
        <form
          onSubmit={handleCreateCustomItem}
          className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-orange-300 dark:border-orange-800 shadow-sm space-y-3"
        >
          <div className="text-xs font-bold text-stone-800 dark:text-stone-200">
            Quick Add to Grocery List
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Item name (e.g. Oat Milk, Lemons)"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
              autoFocus
            />
            <input
              type="text"
              placeholder="Quantity / Unit (optional, e.g. 1 carton)"
              value={customQty}
              onChange={(e) => setCustomQty(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <select
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value as any)}
              className="px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {CATEGORY_ORDER.map((c) => (
                <option key={c} value={c}>
                  Aisle: {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-orange-600 text-white text-xs font-semibold hover:bg-orange-700"
            >
              Save Item
            </button>
          </div>
        </form>
      )}

      {/* Empty State */}
      {items.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Your grocery list is empty
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-sm mx-auto">
              Add ingredients from any saved recipe, sync your weekly meal plan, or add custom items above.
            </p>
          </div>
          <button
            onClick={onNavigateToRecipes}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <span>Browse My Recipes</span>
          </button>
        </div>
      )}

      {/* Categorized List */}
      <div className="space-y-6">
        {CATEGORY_ORDER.map((category) => {
          const catItems = groupedItems[category];
          if (!catItems || catItems.length === 0) return null;

          return (
            <div
              key={category}
              className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 overflow-hidden shadow-xs"
            >
              {/* Category Header */}
              <div className="px-5 py-3 bg-stone-50 dark:bg-stone-800/60 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  {category}
                </span>
                <span className="text-xs text-stone-600 dark:text-stone-300 font-semibold tabular-nums">
                  {catItems.filter((i) => !i.checked).length} items
                </span>
              </div>

              {/* Items in Aisle */}
              <div className="divide-y divide-stone-100 dark:divide-stone-800/60">
                {catItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onToggleItem(item.id)}
                    className="px-5 py-3.5 flex items-center justify-between cursor-pointer group hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          item.checked
                            ? 'bg-orange-600 border-orange-600 text-white'
                            : 'border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 group-hover:border-stone-400'
                        }`}
                      >
                        {item.checked && (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        )}
                      </div>

                      <div>
                        <span
                          className={`text-sm font-medium ${
                            item.checked
                              ? 'line-through text-stone-400 dark:text-stone-500'
                              : 'text-stone-800 dark:text-stone-200'
                          }`}
                        >
                          {item.name}
                        </span>
                        {item.recipeTitle && (
                          <span className="block text-[11px] text-stone-600 dark:text-stone-300">
                            From: {item.recipeTitle}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-stone-600 dark:text-stone-400 tabular-nums">
                        {item.quantity} {item.unit}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteItem(item.id);
                        }}
                        className="p-1 rounded-lg text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
