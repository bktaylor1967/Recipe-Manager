import React, { useState } from 'react';
import { Recipe, MealPlanSlot, MealType } from '../types/recipe';
import {
  CalendarDays,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Sparkles,
  Utensils,
  Check,
  X,
} from 'lucide-react';

interface MealPlannerViewProps {
  recipes: Recipe[];
  mealPlan: MealPlanSlot[];
  onUpdateMealPlan: (plan: MealPlanSlot[]) => void;
  onSendPlanToGrocery: (recipeIds: string[]) => void;
  onSelectRecipe: (recipe: Recipe) => void;
}

export const MealPlannerView: React.FC<MealPlannerViewProps> = ({
  recipes,
  mealPlan,
  onUpdateMealPlan,
  onSendPlanToGrocery,
  onSelectRecipe,
}) => {
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, 1 = next week
  const [selectingSlot, setSelectingSlot] = useState<{
    dateStr: string;
    mealType: MealType;
  } | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  // Compute 7 days of the week starting from Monday
  const getDaysOfWeek = (offset: number) => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday...
    const distanceToMonday = (currentDay + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMonday + offset * 7);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const isToday =
        d.toDateString() === new Date().toDateString();

      days.push({ dateStr, dayName, dayNum, isToday });
    }
    return days;
  };

  const days = getDaysOfWeek(weekOffset);
  const mealTypes: { type: MealType; label: string }[] = [
    { type: 'breakfast', label: 'Breakfast' },
    { type: 'lunch', label: 'Lunch' },
    { type: 'dinner', label: 'Dinner' },
  ];

  const getSlotRecipe = (dateStr: string, mealType: MealType) => {
    const slot = mealPlan.find(
      (s) => s.dateStr === dateStr && s.mealType === mealType
    );
    if (!slot) return null;
    return recipes.find((r) => r.id === slot.recipeId) || null;
  };

  const handleAssignRecipe = (recipeId: string) => {
    if (!selectingSlot) return;
    const filtered = mealPlan.filter(
      (s) =>
        !(
          s.dateStr === selectingSlot.dateStr &&
          s.mealType === selectingSlot.mealType
        )
    );
    const newSlot: MealPlanSlot = {
      id: `slot-${Date.now()}`,
      dateStr: selectingSlot.dateStr,
      mealType: selectingSlot.mealType,
      recipeId,
      servings: 2,
    };
    onUpdateMealPlan([...filtered, newSlot]);
    setSelectingSlot(null);
  };

  const handleRemoveSlot = (dateStr: string, mealType: MealType, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = mealPlan.filter(
      (s) => !(s.dateStr === dateStr && s.mealType === mealType)
    );
    onUpdateMealPlan(updated);
  };

  // Quick autofill random plan
  const handleAutoFill = () => {
    if (recipes.length === 0) return;
    const newSlots: MealPlanSlot[] = [];
    days.forEach((day, dayIdx) => {
      // Pick a dinner recipe
      const dinnerRecipe = recipes[(dayIdx + weekOffset) % recipes.length];
      newSlots.push({
        id: `slot-${Date.now()}-${day.dateStr}-dinner`,
        dateStr: day.dateStr,
        mealType: 'dinner',
        recipeId: dinnerRecipe.id,
        servings: 2,
      });

      // Pick a lunch recipe every other day
      if (dayIdx % 2 === 0) {
        const lunchRecipe = recipes[(dayIdx + 1) % recipes.length];
        newSlots.push({
          id: `slot-${Date.now()}-${day.dateStr}-lunch`,
          dateStr: day.dateStr,
          mealType: 'lunch',
          recipeId: lunchRecipe.id,
          servings: 2,
        });
      }
    });

    onUpdateMealPlan(newSlots);
  };

  const handleSendWeekToGrocery = () => {
    const weekDateStrings = new Set(days.map((d) => d.dateStr));
    const currentWeekSlots = mealPlan.filter((s) => weekDateStrings.has(s.dateStr));
    const recipeIds = Array.from(new Set(currentWeekSlots.map((s) => s.recipeId)));

    if (recipeIds.length === 0) {
      alert('Your meal plan for this week is empty. Add a recipe to get started!');
      return;
    }

    onSendPlanToGrocery(recipeIds);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header with week navigation & actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <span>Weekly Meal Planner</span>
            <span className="text-xs px-2.5 py-1 rounded-md bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 font-semibold">
              Smart Planner
            </span>
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Organize dinners, reduce food waste, and sync directly to your grocery list.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Week Selector */}
          <div className="flex items-center gap-1 p-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl shadow-xs">
            <button
              onClick={() => setWeekOffset((prev) => prev - 1)}
              className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold px-2 min-w-[80px] text-center text-stone-800 dark:text-stone-200">
              {weekOffset === 0
                ? 'This Week'
                : weekOffset === 1
                ? 'Next Week'
                : `${weekOffset > 0 ? '+' : ''}${weekOffset} Weeks`}
            </span>
            <button
              onClick={() => setWeekOffset((prev) => prev + 1)}
              className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleAutoFill}
            className="px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Auto-Plan</span>
          </button>

          <button
            onClick={handleSendWeekToGrocery}
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Send to Grocery</span>
          </button>
        </div>
      </div>

      {showNotification && (
        <div className="p-3 rounded-xl bg-emerald-600 text-white text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top">
          <Check className="w-4 h-4" />
          <span>All ingredients from this week's meals were merged into your Grocery List!</span>
        </div>
      )}

      {/* Week Grid (Mon - Sun) */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {days.map((day) => (
          <div
            key={day.dateStr}
            className={`rounded-2xl border transition-all flex flex-col ${
              day.isToday
                ? 'bg-orange-50/40 dark:bg-orange-950/20 border-orange-300 dark:border-orange-800/80 shadow-xs'
                : 'bg-white dark:bg-stone-900 border-stone-200/80 dark:border-stone-800'
            }`}
          >
            {/* Day Header */}
            <div className="p-3 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                  {day.dayName}
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                  {day.dayNum}
                </span>
              </div>
              {day.isToday && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  Today
                </span>
              )}
            </div>

            {/* Meal Slots: Breakfast, Lunch, Dinner */}
            <div className="p-2 space-y-2 flex-1 flex flex-col justify-between">
              {mealTypes.map(({ type, label }) => {
                const recipe = getSlotRecipe(day.dateStr, type);

                return (
                  <div key={type} className="flex-1">
                    <span className="text-[10px] font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider px-1 block mb-1">
                      {label}
                    </span>

                    {recipe ? (
                      <div
                        onClick={() => onSelectRecipe(recipe)}
                        className="group relative p-2 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200/60 dark:border-stone-700 hover:border-orange-300 cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={recipe.imageUrl}
                            alt={recipe.title}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-lg object-cover shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                              {recipe.title}
                            </h4>
                            <span className="text-[10px] text-stone-500 dark:text-stone-400 tabular-nums">
                              {recipe.prepMinutes + recipe.cookMinutes}m
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => handleRemoveSlot(day.dateStr, type, e)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-500 hover:text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove recipe"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          setSelectingSlot({ dateStr: day.dateStr, mealType: type })
                        }
                        className="w-full py-2 px-2 rounded-xl border border-dashed border-stone-200 dark:border-stone-800 hover:border-orange-400 text-stone-400 hover:text-orange-600 dark:hover:text-orange-400 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Recipe Picker Modal for Meal Slot */}
      {selectingSlot && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-stone-50 dark:bg-stone-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 capitalize">
                Pick a Recipe for {selectingSlot.mealType}
              </h3>
              <button
                onClick={() => setSelectingSlot(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {recipes.map((r) => (
                <div
                  key={r.id}
                  onClick={() => handleAssignRecipe(r.id)}
                  className="p-3 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-orange-500 cursor-pointer flex items-center gap-3 transition-colors"
                >
                  <img
                    src={r.imageUrl}
                    alt={r.title}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                      {r.title}
                    </h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 truncate">
                      {r.cuisine} · {r.prepMinutes + r.cookMinutes}m · {r.difficulty}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
