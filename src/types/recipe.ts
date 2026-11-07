export type IngredientCategory =
  | 'Produce'
  | 'Meat & Seafood'
  | 'Dairy & Eggs'
  | 'Pantry'
  | 'Bakery'
  | 'Spices & Seasonings'
  | 'Other';

export interface Ingredient {
  id: string;
  item: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
  originalText: string;
  checked?: boolean;
}

export interface InstructionStep {
  step: number;
  instruction: string;
  timerMinutes?: number;
  ingredientsUsed?: string[];
}

export type RecipeDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface Recipe {
  id: string;
  title: string;
  description: string;
  author?: string;
  sourceUrl?: string;
  sourcePlatform?: 'instagram' | 'tiktok' | 'web' | 'photo' | 'manual' | 'ai';
  imageUrl: string;
  servings: number;
  prepMinutes: number;
  cookMinutes: number;
  difficulty: RecipeDifficulty;
  cuisine: string;
  calories?: number;
  proteinGrams?: number;
  tags: string[];
  cookbookIds: string[];
  isFavorite: boolean;
  rating: number;
  ingredients: Ingredient[];
  instructions: InstructionStep[];
  notes?: string;
  createdAt: string;
}

export interface Cookbook {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  recipeCount?: number;
  isCustom?: boolean;
}

export interface GroceryItem {
  id: string;
  recipeId?: string;
  recipeTitle?: string;
  name: string;
  quantity: number | string;
  unit: string;
  category: IngredientCategory;
  checked: boolean;
  addedAt: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealPlanSlot {
  id: string;
  dateStr: string; // YYYY-MM-DD
  mealType: MealType;
  recipeId: string;
  servings: number;
}

export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string;
  bio?: string;
  createdAt: string;
}

