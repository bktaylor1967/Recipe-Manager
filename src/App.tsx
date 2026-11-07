/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Recipe, Cookbook, GroceryItem, MealPlanSlot, Ingredient } from './types/recipe';
import {
  INITIAL_RECIPES,
  INITIAL_COOKBOOKS,
  INITIAL_GROCERY_ITEMS,
} from './data/initialRecipes';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { RecipeCard } from './components/RecipeCard';
import { RecipeDetailModal } from './components/RecipeDetailModal';
import { CookModeModal } from './components/CookModeModal';
import { ImportRecipeModal } from './components/ImportRecipeModal';
import { MealPlannerView } from './components/MealPlannerView';
import { GroceryListView } from './components/GroceryListView';
import { CookbooksManager } from './components/CookbooksManager';
import { DiscoverFeed } from './components/DiscoverFeed';
import {
  Search,
  SlidersHorizontal,
  Plus,
  BookOpen,
  Sparkles,
  Heart,
  Clock,
  ChefHat,
  Instagram,
} from 'lucide-react';

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<'recipes' | 'discover' | 'plan' | 'grocery'>('recipes');

  // Persistence States
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('recime_recipes');
    return saved ? JSON.parse(saved) : INITIAL_RECIPES;
  });

  const [cookbooks, setCookbooks] = useState<Cookbook[]>(() => {
    const saved = localStorage.getItem('recime_cookbooks');
    return saved ? JSON.parse(saved) : INITIAL_COOKBOOKS;
  });

  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>(() => {
    const saved = localStorage.getItem('recime_grocery');
    return saved ? JSON.parse(saved) : INITIAL_GROCERY_ITEMS;
  });

  const [mealPlan, setMealPlan] = useState<MealPlanSlot[]>(() => {
    const saved = localStorage.getItem('recime_meal_plan');
    return saved ? JSON.parse(saved) : [];
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('recime_theme');
    if (savedTheme) return savedTheme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Modals
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [cookingRecipe, setCookingRecipe] = useState<Recipe | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCookbookId, setSelectedCookbookId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'quickest' | 'rating'>('newest');

  // Theme synchronization
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('recime_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('recime_theme', 'light');
    }
  }, [isDark]);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('recime_recipes', JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem('recime_cookbooks', JSON.stringify(cookbooks));
  }, [cookbooks]);

  useEffect(() => {
    localStorage.setItem('recime_grocery', JSON.stringify(groceryItems));
  }, [groceryItems]);

  useEffect(() => {
    localStorage.setItem('recime_meal_plan', JSON.stringify(mealPlan));
  }, [mealPlan]);

  const toggleDark = () => setIsDark((prev) => !prev);

  // Recipe Operations
  const handleSaveRecipe = (newRecipe: Recipe) => {
    setRecipes((prev) => [newRecipe, ...prev]);
    setSelectedRecipe(newRecipe);
  };

  const handleDeleteRecipe = (id: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    setMealPlan((prev) => prev.filter((s) => s.recipeId !== id));
  };

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r))
    );
  };

  const handleCreateCookbook = (title: string, description: string) => {
    const newCb: Cookbook = {
      id: `cb-${Date.now()}`,
      title,
      description,
      recipeCount: 0,
      isCustom: true,
    };
    setCookbooks((prev) => [...prev, newCb]);
    setSelectedCookbookId(newCb.id);
  };

  // Grocery Operations
  const handleToggleGroceryItem = (id: string) => {
    setGroceryItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleDeleteGroceryItem = (id: string) => {
    setGroceryItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearCheckedGrocery = () => {
    setGroceryItems((prev) => prev.filter((i) => !i.checked));
  };

  const handleAddCustomGrocery = (
    newItem: Omit<GroceryItem, 'id' | 'addedAt'>
  ) => {
    const item: GroceryItem = {
      ...newItem,
      id: `groc-${Date.now()}`,
      addedAt: new Date().toISOString(),
    };
    setGroceryItems((prev) => [item, ...prev]);
  };

  const handleAddAllToGrocery = (
    recipe: Recipe,
    scaledIngredients: Ingredient[]
  ) => {
    const newItems: GroceryItem[] = scaledIngredients.map((ing) => ({
      id: `groc-${Date.now()}-${ing.id}`,
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      name: ing.item,
      quantity: ing.quantity,
      unit: ing.unit,
      category: ing.category,
      checked: false,
      addedAt: new Date().toISOString(),
    }));

    setGroceryItems((prev) => [...newItems, ...prev]);
  };

  // Send whole week's recipes to grocery
  const handleSendPlanToGrocery = (recipeIds: string[]) => {
    const recipesToProcess = recipes.filter((r) => recipeIds.includes(r.id));
    const itemsToAdd: GroceryItem[] = [];

    recipesToProcess.forEach((recipe) => {
      recipe.ingredients.forEach((ing) => {
        itemsToAdd.push({
          id: `groc-${Date.now()}-${recipe.id}-${ing.id}`,
          recipeId: recipe.id,
          recipeTitle: recipe.title,
          name: ing.item,
          quantity: ing.quantity,
          unit: ing.unit,
          category: ing.category,
          checked: false,
          addedAt: new Date().toISOString(),
        });
      });
    });

    setGroceryItems((prev) => [...itemsToAdd, ...prev]);
  };

  // Quick Start Cook Mode
  const handleQuickStartCook = (recipe: Recipe, e: React.MouseEvent) => {
    e.stopPropagation();
    setCookingRecipe(recipe);
  };

  // Filtered & Sorted Recipes
  const filteredRecipes = useMemo(() => {
    return recipes
      .filter((r) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = r.title.toLowerCase().includes(q);
          const matchesCuisine = r.cuisine.toLowerCase().includes(q);
          const matchesAuthor = r.author?.toLowerCase().includes(q);
          const matchesIngredient = r.ingredients.some((i) =>
            i.item.toLowerCase().includes(q)
          );
          if (!matchesTitle && !matchesCuisine && !matchesAuthor && !matchesIngredient) {
            return false;
          }
        }

        // Cookbook filter
        if (selectedCookbookId) {
          if (!r.cookbookIds.includes(selectedCookbookId)) return false;
        }

        // Tag filter
        if (selectedTag) {
          if (selectedTag === 'Favorites') {
            if (!r.isFavorite) return false;
          } else {
            if (!r.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase())) {
              return false;
            }
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'quickest') {
          return a.prepMinutes + a.cookMinutes - (b.prepMinutes + b.cookMinutes);
        }
        if (sortBy === 'rating') {
          return b.rating - a.rating;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [recipes, searchQuery, selectedCookbookId, selectedTag, sortBy]);

  const allTags = ['Favorites', 'High-Protein', 'Under 30 Min', 'Vegetarian', 'Quick'];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors pb-20 md:pb-8">
      {/* 3-Zone Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenImport={() => setIsImportModalOpen(true)}
        isDark={isDark}
        toggleDark={toggleDark}
        groceryCount={groceryItems.filter((i) => !i.checked).length}
      />

      {/* Main App View Routing */}
      <main className="flex-1">
        {/* TAB 1: MY RECIPES */}
        {currentTab === 'recipes' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Search & Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search recipes, ingredients, cuisines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 shadow-xs"
                />
              </div>

              {/* Sorting & Filter controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-600 dark:text-stone-400 font-medium">
                    Sort:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-medium text-stone-700 dark:text-stone-300 focus:outline-none"
                  >
                    <option value="newest">Recently Saved</option>
                    <option value="quickest">Cook Time (Fastest)</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Cookbooks Horizontal Strips */}
            <CookbooksManager
              cookbooks={cookbooks}
              selectedCookbookId={selectedCookbookId}
              onSelectCookbook={setSelectedCookbookId}
              onCreateCookbook={handleCreateCookbook}
              totalRecipeCount={recipes.length}
            />

            {/* Tag Quick Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedTag === null
                    ? 'bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                All Tags
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    selectedTag === tag
                      ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 font-semibold'
                      : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  {tag === 'Favorites' && <Heart className="w-3 h-3 fill-current" />}
                  <span>{tag}</span>
                </button>
              ))}
            </div>

            {/* Recipe Cards Grid */}
            {filteredRecipes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onSelect={setSelectedRecipe}
                    onToggleFavorite={handleToggleFavorite}
                    onQuickStartCook={handleQuickStartCook}
                  />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 space-y-4">
                <ChefHat className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto" />
                <div>
                  <h3 className="text-base font-bold text-stone-800 dark:text-stone-200">
                    No recipes match your criteria
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Try clearing your search or import a new recipe from Instagram, TikTok, or a website.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCookbookId(null);
                    setSelectedTag(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DISCOVER */}
        {currentTab === 'discover' && (
          <DiscoverFeed
            discoverRecipes={INITIAL_RECIPES}
            myRecipeIds={new Set(recipes.map((r) => r.id))}
            onSaveToMyRecipes={handleSaveRecipe}
            onSelectRecipe={setSelectedRecipe}
            onToggleFavorite={handleToggleFavorite}
            onQuickStartCook={handleQuickStartCook}
          />
        )}

        {/* TAB 3: MEAL PLAN */}
        {currentTab === 'plan' && (
          <MealPlannerView
            recipes={recipes}
            mealPlan={mealPlan}
            onUpdateMealPlan={setMealPlan}
            onSendPlanToGrocery={handleSendPlanToGrocery}
            onSelectRecipe={setSelectedRecipe}
          />
        )}

        {/* TAB 4: GROCERY LIST */}
        {currentTab === 'grocery' && (
          <GroceryListView
            items={groceryItems}
            onToggleItem={handleToggleGroceryItem}
            onDeleteItem={handleDeleteGroceryItem}
            onClearChecked={handleClearCheckedGrocery}
            onAddItem={handleAddCustomGrocery}
            onNavigateToRecipes={() => setCurrentTab('recipes')}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenImport={() => setIsImportModalOpen(true)}
        groceryCount={groceryItems.filter((i) => !i.checked).length}
      />

      {/* MODAL: Recipe Detail View */}
      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onStartCook={(r) => {
            setSelectedRecipe(null);
            setCookingRecipe(r);
          }}
          onToggleFavorite={handleToggleFavorite}
          onAddToMealPlan={(r) => {
            setCurrentTab('plan');
            setSelectedRecipe(null);
          }}
          onAddAllToGrocery={handleAddAllToGrocery}
          onDeleteRecipe={handleDeleteRecipe}
        />
      )}

      {/* MODAL: Fullscreen Cook Mode */}
      {cookingRecipe && (
        <CookModeModal
          recipe={cookingRecipe}
          onClose={() => setCookingRecipe(null)}
        />
      )}

      {/* MODAL: Save / Import Recipe */}
      {isImportModalOpen && (
        <ImportRecipeModal
          onClose={() => setIsImportModalOpen(false)}
          onSaveRecipe={handleSaveRecipe}
        />
      )}
    </div>
  );
}
