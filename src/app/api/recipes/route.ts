import { NextRequest, NextResponse } from "next/server"
import { checkRateLimit } from "@/lib/rateLimit"
import Groq from "groq-sdk"
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown"
  const { allowed, remaining } = checkRateLimit(ip, 15, 60000)
  if (!allowed) return NextResponse.json({ error: "Too many requests. Please wait a minute." }, { status: 429 })
  try {
    const { pantry, preferences } = await req.json()
    const ingredientList = pantry.map((i: any) => `${i.name} (${i.quantity} ${i.unit})`).join(", ")
    const dietary = preferences?.dietary || "all"
    const cuisines = preferences?.cuisines?.join(", ") || "any"
    const spice = preferences?.spice || "medium"
    const servings = preferences?.servings || 2

    const dietRule = dietary === "all" || dietary === "All"
      ? "Include any type of recipes including meat, chicken, eggs, and vegan."
      : dietary === "Non-Veg"
        ? "ONLY generate non-vegetarian recipes that include meat, chicken, fish, or eggs. Do NOT generate any vegetarian or vegan dishes."
        : dietary === "Vegetarian"
          ? "ONLY generate vegetarian recipes. No meat or fish. Eggs are allowed."
          : "ONLY generate fully vegan recipes. No meat, fish, eggs, or dairy."

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `You are a professional chef AI. Generate between 6 and 12 recipes depending on how many ingredients are available. More ingredients = more recipes.

INGREDIENTS AVAILABLE: ${ingredientList}
CUISINE PREFERENCE: ${cuisines}
SPICE LEVEL: ${spice}
SERVINGS: ${servings}
DIETARY RULE: ${dietRule}

STRICT RULES:
- Follow the dietary rule EXACTLY
- Use the available ingredients as much as possible
- match_score = percentage of recipe ingredients already in pantry
- steps must be an array of objects with number, title, instruction fields
- Return ONLY valid JSON, no markdown, no explanation

Return a JSON array of exactly 6 recipes in this format:
[{
  "id": "r1",
  "name": "Recipe Name",
  "emoji": "🍛",
  "cuisine": "Indian",
  "dietary": "Non-Veg",
  "description": "one line description",
  "match_score": 85,
  "missing_ingredients": ["ingredient"],
  "ingredients": [{"name":"Chicken","emoji":"🍗","quantity":"400","unit":"g","have":true}],
  "steps": [
    {"number":1,"title":"Step title","instruction":"Detailed instruction here","timer_seconds":300},
    {"number":2,"title":"Step title","instruction":"Detailed instruction here"}
  ],
  "nutrition": {"calories":420,"protein_g":32,"carbs_g":18,"fat_g":14},
  "time_minutes": 35,
  "servings": ${servings},
  "difficulty": "Medium",
  "tips": ["tip1"]
}]`
        }
      ],
      max_tokens: 4000,
    })

    const text = response.choices[0]?.message?.content ?? "[]"
    const clean = text.replace(/```json|```/g, "").trim()
    const start = clean.indexOf("[")
    const end = clean.lastIndexOf("]")
    const recipes = JSON.parse(clean.slice(start, end + 1))
    return NextResponse.json({ recipes })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
