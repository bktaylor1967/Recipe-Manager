import React, { useState } from 'react';
import { Recipe, Ingredient } from '../types/recipe';
import {
  X,
  Play,
  Heart,
  CalendarPlus,
  ShoppingBag,
  Share2,
  Trash2,
  Minus,
  Plus,
  Clock,
  Flame,
  Check,
  Instagram,
  Globe,
  ChefHat,
  Sparkles,
  Printer,
  Copy,
} from 'lucide-react';
import { scaleIngredient, convertUnitSystem, formatQuantity } from '../utils/unitConverter';

interface RecipeDetailModalProps {
  recipe: Recipe;
  onClose: () => void;
  onStartCook: (recipe: Recipe) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onAddToMealPlan: (recipe: Recipe) => void;
  onAddAllToGrocery: (recipe: Recipe, scaledIngredients: Ingredient[]) => void;
  onDeleteRecipe: (id: string) => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  onClose,
  onStartCook,
  onToggleFavorite,
  onAddToMealPlan,
  onAddAllToGrocery,
  onDeleteRecipe,
}) => {
  const [servings, setServings] = useState(recipe.servings || 2);
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [showShareNotification, setShowShareNotification] = useState(false);

  const toggleCheck = (id: string) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAdjustServings = (delta: number) => {
    setServings((prev) => Math.max(1, Math.min(24, prev + delta)));
  };

  // Compute scaled and converted ingredients
  const displayIngredients: Ingredient[] = recipe.ingredients.map((ing) => {
    const scaledQty = scaleIngredient(ing.quantity, recipe.servings, servings);
    const converted = convertUnitSystem(scaledQty, ing.unit, unitSystem);
    return {
      ...ing,
      quantity: converted.quantity,
      unit: converted.unit,
      checked: checkedIngredients[ing.id] || false,
    };
  });

  const handleAddGrocery = () => {
    onAddAllToGrocery(recipe, displayIngredients);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setShowShareNotification(true);
    setTimeout(() => setShowShareNotification(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const renderSourceIcon = () => {
    switch (recipe.sourcePlatform) {
      case 'instagram':
        return <Instagram className="w-4 h-4 text-pink-600" />;
      case 'tiktok':
        return <span className="font-bold text-sm">♪</span>;
      case 'ai':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'web':
        return <Globe className="w-4 h-4 text-stone-500" />;
      default:
        return <ChefHat className="w-4 h-4 text-stone-500" />;
    }
  };

  const totalMinutes = recipe.prepMinutes + recipe.cookMinutes;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-stone-50 dark:bg-stone-900 w-full max-w-3xl min-h-screen sm:min-h-0 sm:rounded-3xl overflow-hidden shadow-2xl border border-stone-200/80 dark:border-stone-800 flex flex-col my-auto">
        {/* Hero Image Section */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full bg-stone-100 dark:bg-stone-800">
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Top Actions */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 transition-colors focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => onToggleFavorite(recipe.id, e)}
                className="p-2.5 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 transition-colors focus:outline-none"
              >
                <Heart
                  className={`w-5 h-5 ${
                    recipe.isFavorite ? 'fill-red-500 text-red-500' : ''
                  }`}
                />
              </button>
              <button
                onClick={handleCopyLink}
                className="p-2.5 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 transition-colors focus:outline-none"
                title="Copy share link"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Bottom Title Overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 text-xs font-medium text-stone-300 mb-1">
              <div className="flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm">
                {renderSourceIcon()}
                <span>{recipe.author || 'ReciMe'}</span>
              </div>
              <span aria-hidden="true">·</span>
              <span>{recipe.cuisine}</span>
              <span aria-hidden="true">·</span>
              <span>{recipe.difficulty}</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-sm">
              {recipe.title}
            </h1>
          </div>
        </div>

        {/* Share notification toast */}
        {showShareNotification && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-2 text-center font-medium animate-in slide-in-from-top">
            Recipe link copied to clipboard!
          </div>
        )}

        {/* Main Content Body */}
        <div className="p-6 sm:p-8 space-y-8 flex-1">
          {/* Quick Metrics & CTA Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6 border-b border-stone-200 dark:border-stone-800">
            {/* Quick Metrics */}
            <div className="flex items-center gap-6 text-xs text-stone-600 dark:text-stone-300">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-stone-600 dark:text-stone-300 block">
                  Prep
                </span>
                <span className="text-sm font-semibold tabular-nums text-stone-900 dark:text-stone-100">
                  {recipe.prepMinutes} min
                </span>
              </div>
              <span className="text-stone-300 dark:text-stone-700" aria-hidden="true">|</span>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-stone-600 dark:text-stone-300 block">
                  Cook
                </span>
                <span className="text-sm font-semibold tabular-nums text-stone-900 dark:text-stone-100">
                  {recipe.cookMinutes} min
                </span>
              </div>
              <span className="text-stone-300 dark:text-stone-700" aria-hidden="true">|</span>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-stone-600 dark:text-stone-300 block">
                  Total
                </span>
                <span className="text-sm font-semibold tabular-nums text-stone-900 dark:text-stone-100">
                  {totalMinutes} min
                </span>
              </div>
              {recipe.calories && (
                <>
                  <span className="text-stone-300 dark:text-stone-700" aria-hidden="true">|</span>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-stone-600 dark:text-stone-300 block">
                      Calories
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-stone-900 dark:text-stone-100">
                      {recipe.calories} kcal
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Primary Action: Start Cook Mode */}
            <button
              onClick={() => onStartCook(recipe)}
              className="px-6 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-600/20 active:scale-[0.98] transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Cook Mode</span>
            </button>
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-stone-700 dark:text-stone-300 leading-relaxed">
            {recipe.description}
          </p>

          {/* Action Row: Add to Plan & Add to Grocery */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onAddToMealPlan(recipe)}
              className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <CalendarPlus className="w-4 h-4 text-orange-600" />
              <span>Add to Meal Plan</span>
            </button>
            <button
              onClick={handleAddGrocery}
              className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-orange-600" />
              <span>Add to Grocery List</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
              title="Print recipe card"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>

          {/* Ingredients Section with Servings Adjuster & Unit System */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                Ingredients ({displayIngredients.length})
              </h2>

              <div className="flex items-center gap-3">
                {/* Unit Switcher */}
                <div className="flex items-center p-0.5 rounded-lg bg-stone-200 dark:bg-stone-800 text-xs font-medium">
                  <button
                    onClick={() => setUnitSystem('metric')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      unitSystem === 'metric'
                        ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                        : 'text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    Metric (g/ml)
                  </button>
                  <button
                    onClick={() => setUnitSystem('imperial')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      unitSystem === 'imperial'
                        ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                        : 'text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    US (cups/oz)
                  </button>
                </div>

                {/* Servings Adjuster */}
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs">
                  <span className="text-stone-500 dark:text-stone-400">Servings:</span>
                  <button
                    onClick={() => handleAdjustServings(-1)}
                    disabled={servings <= 1}
                    className="p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-700 disabled:opacity-30"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-bold tabular-nums text-stone-900 dark:text-stone-100 min-w-[16px] text-center">
                    {servings}
                  </span>
                  <button
                    onClick={() => handleAdjustServings(1)}
                    className="p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-700"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Ingredients Checklist */}
            <div className="divide-y divide-stone-100 dark:divide-stone-800 border-t border-b border-stone-200 dark:border-stone-800">
              {displayIngredients.map((ing) => {
                const isChecked = Boolean(checkedIngredients[ing.id]);
                const qtyStr = formatQuantity(ing.quantity);

                return (
                  <div
                    key={ing.id}
                    onClick={() => toggleCheck(ing.id)}
                    className="py-3 flex items-center justify-between cursor-pointer group select-none hover:bg-stone-100/50 dark:hover:bg-stone-800/50 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          isChecked
                            ? 'bg-orange-600 border-orange-600 text-white'
                            : 'border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 group-hover:border-stone-400'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span
                        className={`text-sm ${
                          isChecked
                            ? 'line-through text-stone-400 dark:text-stone-500'
                            : 'text-stone-800 dark:text-stone-200'
                        }`}
                      >
                        {ing.item}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-stone-600 dark:text-stone-400 tabular-nums">
                      {qtyStr} {ing.unit}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Instructions Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              Cooking Instructions ({recipe.instructions.length} steps)
            </h2>

            <div className="space-y-4">
              {recipe.instructions.map((step) => (
                <div
                  key={step.step}
                  className="p-4 rounded-2xl bg-white dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-800 flex gap-4"
                >
                  <div className="w-7 h-7 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 font-bold text-xs flex items-center justify-center shrink-0">
                    {step.step}
                  </div>

                  <div className="flex-1 space-y-2">
                    <p className="text-sm sm:text-base text-stone-800 dark:text-stone-200 leading-relaxed">
                      {step.instruction}
                    </p>

                    {step.timerMinutes && step.timerMinutes > 0 && (
                      <button
                        onClick={() => onStartCook(recipe)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 text-orange-700 dark:text-orange-400 text-xs font-medium hover:bg-orange-100 transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Timer: {step.timerMinutes} mins</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chef's Notes */}
          {recipe.notes && (
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200">
              <span className="font-bold block mb-1">Chef's Note:</span>
              <p className="leading-relaxed">{recipe.notes}</p>
            </div>
          )}

          {/* Footer Actions: Delete / Source Link */}
          <div className="pt-6 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
            {recipe.sourceUrl ? (
              <a
                href={recipe.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:underline flex items-center gap-1"
              >
                <span>Original source link</span>
                <Globe className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span>Created in ReciMe</span>
            )}

            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this recipe from your collection?')) {
                  onDeleteRecipe(recipe.id);
                  onClose();
                }
              }}
              className="text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Recipe</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
