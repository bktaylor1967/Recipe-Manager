import React, { useState } from 'react';
import { Recipe, Cookbook } from '../types/recipe';
import {
  Heart,
  Clock,
  UtensilsCrossed,
  ChefHat,
  Instagram,
  Globe,
  Sparkles,
  MoreVertical,
  Trash2,
  FolderMinus,
  FolderPlus,
  CalendarPlus,
  ShoppingBag,
} from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  activeCookbookId?: string | null;
  activeCookbookTitle?: string;
  onSelect: (recipe: Recipe) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onQuickStartCook?: (recipe: Recipe, e: React.MouseEvent) => void;
  onDeleteRecipe?: (id: string) => void;
  onRemoveFromCookbook?: (recipeId: string, cookbookId: string) => void;
  onManageCookbooks?: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  activeCookbookId,
  activeCookbookTitle,
  onSelect,
  onToggleFavorite,
  onQuickStartCook,
  onDeleteRecipe,
  onRemoveFromCookbook,
  onManageCookbooks,
}) => {
  const [imageError, setImageError] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteRecipe) {
      onDeleteRecipe(recipe.id);
    }
    setShowConfirmDelete(false);
    setShowMenu(false);
  };

  const handleRemoveFromThisCookbook = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemoveFromCookbook && activeCookbookId) {
      onRemoveFromCookbook(recipe.id, activeCookbookId);
    }
    setShowMenu(false);
  };

  return (
    <div
      onClick={() => onSelect(recipe)}
      className="group relative cursor-pointer rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 hover:border-orange-200 dark:hover:border-stone-700 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col select-none"
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

        {/* Top-Right Action Row: Favorite & 3-Dots Menu */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          <button
            onClick={(e) => onToggleFavorite(recipe.id, e)}
            aria-label={recipe.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            className="p-2 rounded-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm text-stone-700 dark:text-stone-200 hover:text-red-500 dark:hover:text-red-400 transition-colors shadow-xs focus:outline-none"
          >
            <Heart
              className={`w-3.5 h-3.5 transition-transform ${
                recipe.isFavorite ? 'fill-red-500 text-red-500 scale-110' : ''
              }`}
            />
          </button>

          {/* 3-Dots Menu Trigger */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              aria-label="Recipe actions"
              className="p-2 rounded-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm text-stone-700 dark:text-stone-200 hover:text-stone-900 dark:hover:text-white transition-colors shadow-xs focus:outline-none"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-9 w-52 bg-white dark:bg-stone-800 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-700 py-1.5 z-30 text-xs animate-in fade-in duration-150"
              >
                {activeCookbookId && onRemoveFromCookbook && (
                  <button
                    onClick={handleRemoveFromThisCookbook}
                    className="w-full px-3.5 py-2 text-left text-stone-700 dark:text-stone-200 hover:bg-orange-50 dark:hover:bg-orange-950/40 flex items-center gap-2 transition-colors"
                  >
                    <FolderMinus className="w-3.5 h-3.5 text-orange-600" />
                    <span className="truncate">
                      Remove from {activeCookbookTitle || 'cookbook'}
                    </span>
                  </button>
                )}

                {onManageCookbooks && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onManageCookbooks(recipe);
                    }}
                    className="w-full px-3.5 py-2 text-left text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center gap-2 transition-colors"
                  >
                    <FolderPlus className="w-3.5 h-3.5 text-stone-500" />
                    <span>Manage Cookbooks...</span>
                  </button>
                )}

                <div className="h-px bg-stone-100 dark:bg-stone-700 my-1" />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowConfirmDelete(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Recipe</span>
                </button>
              </div>
            )}
          </div>
        </div>

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
            {(recipe.protein ?? recipe.proteinGrams) !== undefined && (
              <>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{recipe.protein ?? recipe.proteinGrams}g protein</span>
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

      {/* In-App Confirmation Popover for Deletion (No window.confirm!) */}
      {showConfirmDelete && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 z-40 bg-stone-950/85 backdrop-blur-xs p-4 flex flex-col items-center justify-center text-center text-white animate-in fade-in duration-150"
        >
          <div className="w-10 h-10 rounded-full bg-red-950/80 text-red-400 flex items-center justify-center mb-2">
            <Trash2 className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold mb-1">Delete this recipe?</p>
          <p className="text-[11px] text-stone-300 mb-3 px-2">
            This will remove "{recipe.title}" from all cookbooks.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowConfirmDelete(false);
              }}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
