import React, { useState } from 'react';
import { Recipe } from '../types/recipe';
import { Heart, Clock, UtensilsCrossed, ChefHat, Instagram, Globe, Sparkles } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onQuickStartCook?: (recipe: Recipe, e: React.MouseEvent) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onSelect,
  onToggleFavorite,
  onQuickStartCook,
}) => {
  const [imageError, setImageError] = useState(false);
  const totalMinutes = recipe.prepMinutes + recipe.cookMinutes;

  const renderSourceIcon = () => {
    switch (recipe.sourcePlatform) {
      case 'instagram':
        return <Instagram className="w-3.5 h-3.5 text-pink-600" />;
      case 'tiktok':
        return <span className="text-[11px] font-bold">♪</span>;
      case 'ai':
        return <Sparkles className="w-3.5 h-3.5 text-amber-500" />;
      case 'web':
        return <Globe className="w-3.5 h-3.5 text-stone-500" />;
      default:
        return <ChefHat className="w-3.5 h-3.5 text-stone-500" />;
    }
  };

  return (
    <div
      onClick={() => onSelect(recipe)}
      className="group cursor-pointer rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 hover:border-orange-200 dark:hover:border-stone-700 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
    >
      {/* Recipe Photo with scrim & favorite button */}
      <div className="relative aspect-[4/3] w-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
        {!imageError && recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-stone-100 to-orange-50 dark:from-stone-800 dark:to-stone-900 text-stone-400 p-4 text-center">
            <UtensilsCrossed className="w-10 h-10 mb-2 text-stone-300 dark:text-stone-600" />
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400 line-clamp-1">
              {recipe.title}
            </span>
          </div>
        )}

        {/* Favorite Heart Button */}
        <button
          onClick={(e) => onToggleFavorite(recipe.id, e)}
          aria-label={recipe.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm text-stone-700 dark:text-stone-200 hover:text-red-500 dark:hover:text-red-400 transition-colors shadow-sm focus:outline-none"
        >
          <Heart
            className={`w-4 h-4 transition-transform ${
              recipe.isFavorite ? 'fill-red-500 text-red-500 scale-110' : ''
            }`}
          />
        </button>

        {/* Floating Cook Time Scrim */}
        <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>{totalMinutes} min</span>
        </div>
      </div>

      {/* Recipe Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Unboxed Metadata (Zero-Pill Discipline) */}
          <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mb-1.5 flex-wrap">
            <span>{recipe.cuisine}</span>
            <span aria-hidden="true">·</span>
            <span>{recipe.difficulty}</span>
            {recipe.proteinGrams && (
              <>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{recipe.proteinGrams}g protein</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 line-clamp-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
            {recipe.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
            {recipe.description}
          </p>
        </div>

        {/* Footer info: Source / Author & Quick Cook */}
        <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-1.5 truncate max-w-[170px]">
            {renderSourceIcon()}
            <span className="truncate">{recipe.author || 'ReciMe Chef'}</span>
          </div>

          {onQuickStartCook && (
            <button
              onClick={(e) => onQuickStartCook(recipe, e)}
              className="text-xs font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
            >
              Cook Mode →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
