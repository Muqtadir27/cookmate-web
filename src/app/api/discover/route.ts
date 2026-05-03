import { NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"
import { checkRateLimit } from "@/lib/rateLimit"
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown"
  const { allowed } = checkRateLimit(ip, 15, 60000)
  if (!allowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 })

  try {
    const { cuisine, category, dietary } = await req.json()
    const dietRule = !dietary || dietary === "All" ? "Any dietary type."
      : dietary === "Non-Veg" ? "Only non-vegetarian."
      : dietary === "Vegetarian" ? "Only vegetarian."
      : "Only vegan."

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `Return a JSON array of exactly 8 authentic ${cuisine} ${category} dishes. ${dietRule}
STRICT RULES:
- Max 5 ingredients per dish
- Max 3 steps per dish  
- Return ONLY the JSON array, no markdown, no explanation
- Every string must be properly closed with quotes

[{"id":"d1","name":"Dish","emoji":"🍜","cuisine":"${cuisine}","dietary":"Veg","description":"Short desc","match_score":0,"missing_ingredients":[],"ingredients":[{"name":"Item","emoji":"🥗","quantity":"1","unit":"cup","have":false}],"steps":[{"number":1,"title":"Cook","instruction":"Step detail."}],"nutrition":{"calories":350,"protein_g":15,"carbs_g":40,"fat_g":10},"time_minutes":25,"servings":2,"difficulty":"Easy","tips":["tip"]}]`
      }],
      max_tokens: 2800,
    })

    const text = response.choices[0]?.message?.content ?? "[]"
    const clean = text.replace(/```json|```/g, "").trim()
    const start = clean.indexOf("[")
    const end = clean.lastIndexOf("]")
    if (start === -1 || end === -1) return NextResponse.json({ recipes: [] })
    const recipes = JSON.parse(clean.slice(start, end + 1))
    return NextResponse.json({ recipes })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
