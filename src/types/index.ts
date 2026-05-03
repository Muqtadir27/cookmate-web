export interface PantryItem {
  id: string
  name: string
  emoji: string
  quantity: string
  unit: string
  category: string
}

export interface Recipe {
  id: string
  name: string
  emoji: string
  cuisine: string
  dietary: string
  description: string
  match_score: number
  missing_ingredients: string[]
  ingredients: RecipeIngredient[]
  steps: CookStep[]
  nutrition: NutritionInfo
  time_minutes: number
  servings: number
  difficulty: string
  tips: string[]
}

export interface RecipeIngredient {
  name: string
  emoji: string
  quantity: string
  unit: string
  have: boolean
}

export interface CookStep {
  number: number
  title: string
  instruction: string
  tip?: string
  timer_seconds?: number
  ingredients_used?: string[]
}

export interface NutritionInfo {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}
