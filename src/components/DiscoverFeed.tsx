import React, { useState } from 'react';
import { Recipe } from '../types/recipe';
import { RecipeCard } from './RecipeCard';
import { Sparkles, TrendingUp, Compass, BookmarkPlus, Check } from 'lucide-react';

interface DiscoverFeedProps {
  discoverRecipes: Recipe[];
  myRecipeIds: Set<string>;
  onSaveToMyRecipes: (recipe: Recipe) => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onQuickStartCook: (recipe: Recipe, e: React.MouseEvent) => void;
}

export const DiscoverFeed: React.FC<DiscoverFeedProps> = ({
  discoverRecipes,
  myRecipeIds,
  onSaveToMyRecipes,
  onSelectRecipe,
  onToggleFavorite,
  onQuickStartCook,
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const tags = [
    'All',
    'High-Protein',
    'Under 30 Min',
    'Vegetarian',
    'Italian',
    'Dessert',
  ];

  const filteredRecipes =
    selectedTag === 'All'
      ? discoverRecipes
      : discoverRecipes.filter(
          (r) =>
            r.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase()) ||
            r.cuisine.toLowerCase() === selectedTag.toLowerCase()
        );

  const handleSave = (recipe: Recipe, e: React.MouseEvent) => {
    e.stopPropagation();
    onSaveToMyRecipes(recipe);
    setSavedIds((prev) => new Set(prev).add(recipe.id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Banner for Discover */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white p-6 sm:p-10 border border-stone-800 shadow-sm">
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-semibold backdrop-blur-sm border border-orange-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Trending Community Recipes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Discover Viral Creator Recipes
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Hand-curated dishes saved from top Instagram chefs and TikTok foodies. Tap any recipe to view or save directly into your custom cookbooks.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTag === tag
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 border border-stone-200/80 dark:border-stone-700'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <span className="text-xs text-stone-600 dark:text-stone-400 whitespace-nowrap tabular-nums">
          {filteredRecipes.length} recipes
        </span>
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRecipes.map((recipe) => {
          const isAlreadySaved = myRecipeIds.has(recipe.id) || savedIds.has(recipe.id);

          return (
            <div key={recipe.id} className="relative group">
              <RecipeCard
                recipe={recipe}
                onSelect={onSelectRecipe}
                onToggleFavorite={onToggleFavorite}
                onQuickStartCook={onQuickStartCook}
              />

              {/* Quick Save to Cookbooks Button Overlay */}
              <div className="absolute top-3 left-3">
                <button
                  onClick={(e) => handleSave(recipe, e)}
                  disabled={isAlreadySaved}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 backdrop-blur-md shadow-sm transition-all ${
                    isAlreadySaved
                      ? 'bg-emerald-600/90 text-white cursor-default'
                      : 'bg-white/90 dark:bg-stone-900/90 text-stone-800 dark:text-stone-200 hover:bg-orange-600 hover:text-white'
                  }`}
                  title={isAlreadySaved ? 'Saved to your cookbooks' : 'Save to my recipes'}
                >
                  {isAlreadySaved ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
