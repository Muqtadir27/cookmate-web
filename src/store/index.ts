"use client"
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

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
  ingredients: { name: string; emoji: string; quantity: string; unit: string; have: boolean }[]
  steps: { number: number; title: string; instruction: string; tip?: string; timer_seconds?: number }[]
  nutrition: { calories: number; protein_g: number; carbs_g: number; fat_g: number }
  time_minutes: number
  servings: number
  difficulty: string
  tips: string[]
}

interface Store {
  pantry: PantryItem[]
  recipes: Recipe[]
  activeRecipe: Recipe | null
  cookStep: number
  loading: boolean
  servings: number
  preferences: {cuisines:string[],dietary:string,spice:string,servings:number}
  cookHistory: {id:string,name:string,emoji:string,cuisine:string,cookedAt:string}[]
  savedRecipes: Recipe[]
  setLoading: (v: boolean) => void
  setServings: (n: number) => void
  setPreferences: (p: any) => void
  addPantryItem: (item: PantryItem) => void
  addPantryItems: (items: PantryItem[]) => void
  updatePantryItem: (id: string, qty: string, unit: string) => void
  deductPantryIngredients: (ingredientNames: string[]) => void
  removePantryItem: (id: string) => void
  clearPantry: () => void
  addCookHistory: (r: Recipe) => void
  saveRecipe: (r: Recipe) => void
  unsaveRecipe: (id: string) => void
  setRecipes: (r: Recipe[]) => void
  setActiveRecipe: (r: Recipe | null) => void
  setCookStep: (n: number) => void
  resetStore: () => void
}

const defaultState = {
  pantry: [],
  cookHistory: [],
  savedRecipes: [],
  recipes: [],
  activeRecipe: null,
  cookStep: 0,
  loading: false,
  servings: 2,
  preferences: {cuisines:["Indian","Asian"],dietary:"All",spice:"Medium",servings:2},
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      ...defaultState,
      setLoading: (v) => set({ loading: v }),
      setServings: (n) => set({ servings: n }),
      setPreferences: (p) => set({ preferences: p }),
      resetStore: () => set(defaultState),
      addPantryItem: (item) => set((s) => ({
        pantry: s.pantry.find(i => i.name.toLowerCase() === item.name.toLowerCase())
          ? s.pantry.map(i => i.name.toLowerCase() === item.name.toLowerCase() ? {...i, quantity: item.quantity, unit: item.unit} : i)
          : [...s.pantry, item]
      })),
      addPantryItems: (items) => set((s) => {
        let pantry = [...s.pantry]
        for (const item of items) {
          const idx = pantry.findIndex(i => i.name.toLowerCase() === item.name.toLowerCase())
          if (idx >= 0) pantry[idx] = {...pantry[idx], quantity: item.quantity, unit: item.unit}
          else pantry.push(item)
        }
        return { pantry }
      }),
      updatePantryItem: (id, qty, unit) => set((s) => ({
        pantry: s.pantry.map(i => i.id === id ? {...i, quantity: qty, unit} : i)
      })),
      deductPantryIngredients: (ingredientNames) => set((s) => ({
        pantry: s.pantry.map(i => {
          if (ingredientNames.map((n: string) => n.toLowerCase()).includes(i.name.toLowerCase())) {
            const qty = parseFloat(i.quantity)
            if (!isNaN(qty) && qty > 1) return {...i, quantity: String(qty - 1)}
            return null
          }
          return i
        }).filter(Boolean) as any
      })),
      removePantryItem: (id) => set((s) => ({ pantry: s.pantry.filter(i => i.id !== id) })),
      clearPantry: () => set({ pantry: [] }),
      addCookHistory: (r) => set((s) => ({ cookHistory: [{id:r.id,name:r.name,emoji:r.emoji,cuisine:r.cuisine,cookedAt:new Date().toISOString()},...s.cookHistory].slice(0,50) })),
      saveRecipe: (r) => set((s) => ({ savedRecipes: s.savedRecipes.find(x=>x.id===r.id) ? s.savedRecipes : [...s.savedRecipes, r] })),
      unsaveRecipe: (id) => set((s) => ({ savedRecipes: s.savedRecipes.filter(x=>x.id!==id) })),
      setRecipes: (recipes) => set({ recipes }),
      setActiveRecipe: (r) => set({ activeRecipe: r, cookStep: 0 }),
      setCookStep: (n) => set({ cookStep: n }),
    }),
    {
      name: "cookmate-v2",
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// Per-user storage key — call this after auth state is known
export function switchUserStore(userId: string | null) {
  if (typeof window === "undefined") return
  const key = userId ? `cookmate-v2-${userId}` : "cookmate-v2-guest"
  const stored = localStorage.getItem(key)
  useStore.persist.setOptions({ name: key })
  useStore.persist.clearStorage()
  if (stored) {
    useStore.persist.rehydrate()
  } else {
    useStore.getState().resetStore()
  }
  useStore.persist.setOptions({ name: key })
  useStore.persist.rehydrate()
}
