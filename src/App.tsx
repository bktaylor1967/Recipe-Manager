/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Recipe, Cookbook, GroceryItem, MealPlanSlot, Ingredient, UserProfile } from './types/recipe';
import {
  INITIAL_RECIPES,
  INITIAL_COOKBOOKS,
  INITIAL_GROCERY_ITEMS,
} from './data/initialRecipes';
import { Sidebar, MainNavTab } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { RecipeCard } from './components/RecipeCard';
import { RecipeDetailModal } from './components/RecipeDetailModal';
import { CookModeModal } from './components/CookModeModal';
import { ImportRecipeModal } from './components/ImportRecipeModal';
import { MealPlannerView } from './components/MealPlannerView';
import { GroceryListView } from './components/GroceryListView';
import { CookbooksManager } from './components/CookbooksManager';
import { DiscoverFeed } from './components/DiscoverFeed';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { ManageCookbooksModal } from './components/ManageCookbooksModal';
import { ExtensionModal } from './components/ExtensionModal';
import {
  Search,
  Plus,
  Heart,
  ChefHat,
  Sun,
  Moon,
  User,
  Puzzle,
} from 'lucide-react';

const DEFAULT_USER: UserProfile = {
  id: 'usr-bktaylor',
  userId: 'bktaylor',
  name: 'Brian Taylor',
  avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=bktaylor',
  bio: 'Home chef loving weeknight quick pasta & high-protein seafood.',
  createdAt: '2026-11-01T00:00:00Z',
};

export default function App() {
  // Active Profile State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('recime_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return DEFAULT_USER;
  });

  // Navigation Tab State (defaults to 'cookbooks' matching ReciMe reference)
  const [currentTab, setCurrentTab] = useState<MainNavTab>('cookbooks');

  // Persistence States per active profile
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const userKey = currentUser ? `recime_recipes_${currentUser.userId}` : 'recime_recipes';
    const saved = localStorage.getItem(userKey);
    return saved ? JSON.parse(saved) : INITIAL_RECIPES;
  });

  const [cookbooks, setCookbooks] = useState<Cookbook[]>(() => {
    const userKey = currentUser ? `recime_cookbooks_${currentUser.userId}` : 'recime_cookbooks';
    const saved = localStorage.getItem(userKey);
    return saved ? JSON.parse(saved) : INITIAL_COOKBOOKS;
  });

  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>(() => {
    const userKey = currentUser ? `recime_grocery_${currentUser.userId}` : 'recime_grocery';
    const saved = localStorage.getItem(userKey);
    return saved ? JSON.parse(saved) : INITIAL_GROCERY_ITEMS;
  });

  const [mealPlan, setMealPlan] = useState<MealPlanSlot[]>(() => {
    const userKey = currentUser ? `recime_meal_plan_${currentUser.userId}` : 'recime_meal_plan';
    const saved = localStorage.getItem(userKey);
    return saved ? JSON.parse(saved) : [];
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('recime_theme');
    if (savedTheme) return savedTheme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Settings State
  const [defaultServings, setDefaultServings] = useState<number>(2);
  const [defaultUnit, setDefaultUnit] = useState<'metric' | 'imperial'>('metric');

  // Modals
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [cookingRecipe, setCookingRecipe] = useState<Recipe | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
  const [managingCookbooksRecipe, setManagingCookbooksRecipe] = useState<Recipe | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCookbookId, setSelectedCookbookId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'quickest' | 'rating'>('newest');

  // Skip auto-sync on initial mount
  const isFirstMount = useRef(true);

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

  // Sync active user to local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('recime_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('recime_current_user');
    }
  }, [currentUser]);

  // Sync user-isolated data to localStorage & server
  useEffect(() => {
    if (!currentUser) return;
    const userKey = `recime_recipes_${currentUser.userId}`;
    localStorage.setItem(userKey, JSON.stringify(recipes));

    // Also update server data
    if (!isFirstMount.current) {
      fetch('/api/user/data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.userId,
          data: { recipes, cookbooks, mealPlan, groceryItems },
        }),
      }).catch((e) => console.warn('Could not sync to server:', e));
    }
  }, [recipes, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const userKey = `recime_cookbooks_${currentUser.userId}`;
    localStorage.setItem(userKey, JSON.stringify(cookbooks));
  }, [cookbooks, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const userKey = `recime_grocery_${currentUser.userId}`;
    localStorage.setItem(userKey, JSON.stringify(groceryItems));
  }, [groceryItems, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const userKey = `recime_meal_plan_${currentUser.userId}`;
    localStorage.setItem(userKey, JSON.stringify(mealPlan));
  }, [mealPlan, currentUser]);

  useEffect(() => {
    isFirstMount.current = false;
  }, []);

  const toggleDark = () => setIsDark((prev) => !prev);

  // Profile Login / Register Success Handler
  const handleLoginSuccess = (user: UserProfile, data?: any) => {
    setCurrentUser(user);
    if (data) {
      if (Array.isArray(data.recipes)) setRecipes(data.recipes);
      if (Array.isArray(data.cookbooks)) setCookbooks(data.cookbooks);
      if (Array.isArray(data.groceryItems)) setGroceryItems(data.groceryItems);
      if (Array.isArray(data.mealPlan)) setMealPlan(data.mealPlan);
    } else {
      // Load from local storage for this user
      const userRecipes = localStorage.getItem(`recime_recipes_${user.userId}`);
      setRecipes(userRecipes ? JSON.parse(userRecipes) : INITIAL_RECIPES);

      const userCookbooks = localStorage.getItem(`recime_cookbooks_${user.userId}`);
      setCookbooks(userCookbooks ? JSON.parse(userCookbooks) : INITIAL_COOKBOOKS);

      const userGroceries = localStorage.getItem(`recime_grocery_${user.userId}`);
      setGroceryItems(userGroceries ? JSON.parse(userGroceries) : []);

      const userMealPlan = localStorage.getItem(`recime_meal_plan_${user.userId}`);
      setMealPlan(userMealPlan ? JSON.parse(userMealPlan) : []);
    }
    setSelectedCookbookId(null);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setRecipes([]);
    setCookbooks([]);
    setGroceryItems([]);
    setMealPlan([]);
    setSelectedCookbookId(null);
  };

  const handleUpdateProfile = (updated: UserProfile) => {
    setCurrentUser(updated);
  };

  // Recipe Operations: Add, Delete, Remove from Cookbook, Update Cookbooks
  const handleSaveRecipe = (newRecipe: Recipe) => {
    setRecipes((prev) => [newRecipe, ...prev]);
    setSelectedRecipe(newRecipe);
  };

  const handleDeleteRecipe = (id: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    setMealPlan((prev) => prev.filter((s) => s.recipeId !== id));
    if (selectedRecipe?.id === id) {
      setSelectedRecipe(null);
    }
  };

  const handleRemoveFromCookbook = (recipeId: string, cookbookId: string) => {
    setRecipes((prev) =>
      prev.map((r) =>
        r.id === recipeId
          ? {
              ...r,
              cookbookIds: r.cookbookIds.filter((cid) => cid !== cookbookId),
            }
          : r
      )
    );
    if (selectedRecipe?.id === recipeId) {
      setSelectedRecipe((prev) =>
        prev
          ? {
              ...prev,
              cookbookIds: prev.cookbookIds.filter((cid) => cid !== cookbookId),
            }
          : null
      );
    }
  };

  const handleUpdateRecipeCookbooks = (recipeId: string, cookbookIds: string[]) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === recipeId ? { ...r, cookbookIds } : r))
    );
    if (selectedRecipe?.id === recipeId) {
      setSelectedRecipe((prev) => (prev ? { ...prev, cookbookIds } : null));
    }
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

  const handleDeleteCookbook = (cookbookId: string) => {
    setCookbooks((prev) => prev.filter((c) => c.id !== cookbookId));
    setRecipes((prev) =>
      prev.map((r) => ({
        ...r,
        cookbookIds: r.cookbookIds.filter((id) => id !== cookbookId),
      }))
    );
    setSelectedCookbookId(null);
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

  // Active cookbook metadata
  const activeCookbook = useMemo(() => {
    return cookbooks.find((c) => c.id === selectedCookbookId) || null;
  }, [cookbooks, selectedCookbookId]);

  // Filtered & Sorted Recipes for Cookbooks view
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

  // Current Page Title matching the serif heading in reference image
  const pageTitle = useMemo(() => {
    switch (currentTab) {
      case 'cookbooks':
        return 'Cookbooks';
      case 'plan':
        return 'Meal Plan';
      case 'grocery':
        return 'Groceries';
      case 'discover':
        return 'Discover';
      case 'settings':
        return 'Settings';
      default:
        return 'Cookbooks';
    }
  }, [currentTab]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#151413] text-stone-900 dark:text-stone-100 flex font-sans transition-colors pb-16 md:pb-0">
      {/* ReciMe Desktop/Tablet Dock Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onOpenImport={() => setIsImportModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenExtension={() => setIsExtensionModalOpen(true)}
        isDark={isDark}
        toggleDark={toggleDark}
        groceryCount={groceryItems.filter((i) => !i.checked).length}
      />

      {/* Main Content Area: Large White Rounded Paper Sheet */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#FAF8F5] dark:bg-[#151413] border-b border-stone-200/80 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
              {pageTitle}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {currentUser && (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-7 h-7 rounded-full overflow-hidden border border-orange-300"
              >
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
              </button>
            )}
            <button
              onClick={toggleDark}
              className="p-1.5 rounded-xl text-stone-600 dark:text-stone-300"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="w-8 h-8 rounded-full bg-[#FF5A1F] text-white flex items-center justify-center shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[2.7]" />
            </button>
          </div>
        </div>

        {/* White Rounded Main Surface */}
        <main className="flex-1 bg-white dark:bg-[#1E1C1A] md:rounded-tl-[36px] md:rounded-bl-[36px] shadow-xs border-t md:border-t-0 md:border-l border-stone-200/70 dark:border-stone-800 p-6 sm:p-10 transition-colors overflow-y-auto">
          {/* Desktop Heading Area matching reference screenshot */}
          <div className="hidden md:flex items-center justify-between pb-6 mb-6 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif text-stone-900 dark:text-stone-100 tracking-tight">
                {pageTitle}
              </h1>
              {currentTab === 'cookbooks' && (
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  {currentUser ? (
                    <span>
                      Signed in as <strong className="text-stone-700 dark:text-stone-200">@{currentUser.userId}</strong> ·{' '}
                      {selectedCookbookId
                        ? `${filteredRecipes.length} recipes in "${activeCookbook?.title || 'Cookbook'}"`
                        : `${filteredRecipes.length} recipes in your collection`}
                    </span>
                  ) : (
                    <span>Log in or register to save your recipes across devices</span>
                  )}
                </p>
              )}
            </div>

            {/* Quick Actions in Desktop Header */}
            <div className="flex items-center gap-3">
              {/* User profile capsule */}
              {currentUser ? (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-[#FAF8F5] dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 hover:border-orange-300 transition-colors"
                >
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-full border border-orange-200 bg-orange-50"
                  />
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                    @{currentUser.userId}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100"
                >
                  Log in
                </button>
              )}

              <button
                onClick={() => setIsExtensionModalOpen(true)}
                title="ReciMe Browser Extension & Simulator"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                <Puzzle className="w-3.5 h-3.5 text-[#FF5A1F]" />
                <span>Extension</span>
              </button>

              <button
                onClick={() => setIsImportModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#FF5A1F] hover:bg-[#E84E15] active:scale-[0.98] transition-all shadow-sm"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Save Recipe</span>
              </button>

              <button
                onClick={toggleDark}
                aria-label="Toggle color theme"
                className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* TAB: COOKBOOKS */}
          {currentTab === 'cookbooks' && (
            <div className="space-y-6">
              {/* Search & Sorting Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search recipes, ingredients, cuisines..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-[#FAF8F5]/80 dark:bg-stone-900/60 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/30"
                  />
                </div>

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

              {/* Cookbooks Horizontal Folder Strips */}
              <CookbooksManager
                cookbooks={cookbooks}
                selectedCookbookId={selectedCookbookId}
                onSelectCookbook={setSelectedCookbookId}
                onCreateCookbook={handleCreateCookbook}
                onDeleteCookbook={handleDeleteCookbook}
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
                        ? 'bg-[#FEEFEA] dark:bg-orange-950 text-[#FF5A1F] font-semibold'
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
                      activeCookbookId={selectedCookbookId}
                      activeCookbookTitle={activeCookbook?.title}
                      onSelect={setSelectedRecipe}
                      onToggleFavorite={handleToggleFavorite}
                      onQuickStartCook={handleQuickStartCook}
                      onDeleteRecipe={handleDeleteRecipe}
                      onRemoveFromCookbook={handleRemoveFromCookbook}
                      onManageCookbooks={(r) => setManagingCookbooksRecipe(r)}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center rounded-3xl bg-[#FAF8F5] dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 space-y-4">
                  <ChefHat className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto" />
                  <div>
                    <h3 className="text-base font-bold text-stone-800 dark:text-stone-200">
                      No recipes in this view
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      {selectedCookbookId
                        ? `This cookbook is currently empty. Click the orange + button or assign recipes to it.`
                        : `Your profile doesn't have any recipes matching this filter yet.`}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCookbookId(null);
                      setSelectedTag(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-200/60 dark:bg-stone-800 hover:bg-stone-200 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB: MEAL PLAN */}
          {currentTab === 'plan' && (
            <MealPlannerView
              recipes={recipes}
              mealPlan={mealPlan}
              onUpdateMealPlan={setMealPlan}
              onSendPlanToGrocery={handleSendPlanToGrocery}
              onSelectRecipe={setSelectedRecipe}
            />
          )}

          {/* TAB: GROCERIES */}
          {currentTab === 'grocery' && (
            <GroceryListView
              items={groceryItems}
              onToggleItem={handleToggleGroceryItem}
              onDeleteItem={handleDeleteGroceryItem}
              onClearChecked={handleClearCheckedGrocery}
              onAddItem={handleAddCustomGrocery}
              onNavigateToRecipes={() => setCurrentTab('cookbooks')}
            />
          )}

          {/* TAB: DISCOVER */}
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
        </main>
      </div>

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
          activeCookbookId={selectedCookbookId}
          activeCookbookTitle={activeCookbook?.title}
          allCookbooks={cookbooks}
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
          onRemoveFromCookbook={handleRemoveFromCookbook}
          onOpenManageCookbooks={(r) => setManagingCookbooksRecipe(r)}
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
          onOpenExtension={() => setIsExtensionModalOpen(true)}
        />
      )}

      {/* MODAL: Manage Recipe Cookbooks */}
      {managingCookbooksRecipe && (
        <ManageCookbooksModal
          recipe={managingCookbooksRecipe}
          allCookbooks={cookbooks}
          onClose={() => setManagingCookbooksRecipe(null)}
          onUpdateRecipeCookbooks={handleUpdateRecipeCookbooks}
          onCreateCookbook={handleCreateCookbook}
        />
      )}

      {/* MODAL: Settings */}
      {isSettingsModalOpen && (
        <SettingsModal
          onClose={() => setIsSettingsModalOpen(false)}
          isDark={isDark}
          toggleDark={toggleDark}
          defaultServings={defaultServings}
          setDefaultServings={setDefaultServings}
          defaultUnit={defaultUnit}
          setDefaultUnit={setDefaultUnit}
          onOpenExtension={() => setIsExtensionModalOpen(true)}
        />
      )}

      {/* MODAL: Login, Register & Profile Manager */}
      {isAuthModalOpen && (
        <AuthModal
          currentUser={currentUser}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          onLogout={handleLogout}
          onUpdateProfile={handleUpdateProfile}
          recipeCount={recipes.length}
          cookbookCount={cookbooks.length}
        />
      )}

      {/* MODAL: Browser Extension Hub & Live Simulator */}
      {isExtensionModalOpen && (
        <ExtensionModal
          currentUser={currentUser}
          cookbooks={cookbooks}
          onClose={() => setIsExtensionModalOpen(false)}
          onSaveRecipe={handleSaveRecipe}
        />
      )}
    </div>
  );
}
