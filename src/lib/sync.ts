import { supabase } from "./supabase"
import { useStore } from "@/store"

export async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

// PUSH local store → Supabase
export async function syncToCloud(userId: string) {
  const { pantry, savedRecipes, preferences, ratedRecipes, cookHistory } = useStore.getState()

  // Pantry — upsert all items
  if (pantry.length > 0) {
    await supabase.from("pantry_items").upsert(
      pantry.map(i => ({
        user_id: userId,
        item_id: i.id,
        name: i.name,
        emoji: i.emoji,
        quantity: i.quantity,
        unit: i.unit,
        category: i.category,
        updated_at: new Date().toISOString()
      })),
      { onConflict: "user_id,item_id" }
    )
  }

  // Saved recipes — upsert all
  if (savedRecipes.length > 0) {
    await supabase.from("saved_recipes").upsert(
      savedRecipes.map(r => ({
        user_id: userId,
        recipe_id: r.id,
        recipe: r,
        saved_at: new Date().toISOString()
      })),
      { onConflict: "user_id,recipe_id" }
    )
  }

  // Preferences — upsert single row
  await supabase.from("user_preferences").upsert({
    user_id: userId,
    cuisines: preferences.cuisines,
    dietary: preferences.dietary,
    spice: preferences.spice,
    servings: preferences.servings,
    rated_recipes: ratedRecipes,
    cook_history: cookHistory,
    updated_at: new Date().toISOString()
  }, { onConflict: "user_id" })
}

// PULL Supabase → local store
export async function syncFromCloud(userId: string) {
  const { addPantryItems, saveRecipe, setPreferences } = useStore.getState()

  // Pantry
  const { data: pantryData } = await supabase
    .from("pantry_items")
    .select("*")
    .eq("user_id", userId)

  if (pantryData && pantryData.length > 0) {
    addPantryItems(pantryData.map((r: any) => ({
      id: r.item_id,
      name: r.name,
      emoji: r.emoji,
      quantity: r.quantity,
      unit: r.unit,
      category: r.category
    })))
  }

  // Saved recipes
  const { data: recipeData } = await supabase
    .from("saved_recipes")
    .select("recipe")
    .eq("user_id", userId)

  if (recipeData && recipeData.length > 0) {
    recipeData.forEach((r: any) => saveRecipe(r.recipe))
  }

  // Preferences
  const { data: prefData } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (prefData) {
    setPreferences({
      cuisines: prefData.cuisines,
      dietary: prefData.dietary,
      spice: prefData.spice,
      servings: prefData.servings
    })
    useStore.setState({
      ratedRecipes: prefData.rated_recipes || {},
      cookHistory: prefData.cook_history || []
    })
  }
}

// Delete pantry item from cloud
export async function deletePantryFromCloud(userId: string, itemId: string) {
  await supabase.from("pantry_items").delete().eq("user_id", userId).eq("item_id", itemId)
}

// Delete saved recipe from cloud
export async function deleteRecipeFromCloud(userId: string, recipeId: string) {
  await supabase.from("saved_recipes").delete().eq("user_id", userId).eq("recipe_id", recipeId)
}
