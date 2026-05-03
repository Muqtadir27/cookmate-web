import { NextRequest, NextResponse } from "next/server"
import { checkRateLimit } from "@/lib/rateLimit"
import Groq from "groq-sdk"
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown"
  const { allowed, remaining } = checkRateLimit(ip, 15, 60000)
  if (!allowed) return NextResponse.json({ error: "Too many requests. Please wait a minute." }, { status: 429 })
  try {
    const { cuisine, category, dietary } = await req.json()
    const dietRule = !dietary || dietary === "All"
      ? "Include any type of recipes."
      : dietary === "Non-Veg"
        ? "ONLY non-vegetarian recipes with meat, chicken, fish, or eggs."
        : dietary === "Vegetarian"
          ? "ONLY vegetarian recipes. No meat or fish. Eggs allowed."
          : "ONLY fully vegan recipes. No meat, fish, eggs, or dairy."

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `You are a world-class chef. Generate 6 authentic, popular ${cuisine} ${category} dishes from around the world.
DIETARY RULE: ${dietRule}
RULES:
- Real, well-known dishes from ${cuisine} cuisine
- Category: ${category} dishes
- Each recipe must have realistic ingredients with quantities
- Steps must be detailed and practical
- match_score should be 0 (user has none of these ingredients yet)
- Return ONLY valid JSON array, no markdown

[{
  "id": "d_unique_id",
  "name": "Dish Name",
  "emoji": "🍜",
  "cuisine": "${cuisine}",
  "dietary": "Veg or Non-Veg or Vegan",
  "description": "one line authentic description",
  "match_score": 0,
  "missing_ingredients": [],
  "ingredients": [{"name":"Ingredient","emoji":"🧄","quantity":"2","unit":"cloves","have":false}],
  "steps": [
    {"number":1,"title":"Step title","instruction":"Detailed step instruction","timer_seconds":300}
  ],
  "nutrition": {"calories":400,"protein_g":20,"carbs_g":45,"fat_g":12},
  "time_minutes": 30,
  "servings": 2,
  "difficulty": "Medium",
  "tips": ["authentic tip"]
}]`
      }],
      max_tokens: 2500,
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
