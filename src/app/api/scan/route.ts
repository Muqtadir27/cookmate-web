import { NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"
import { checkRateLimit } from "@/lib/rateLimit"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown"
  const { allowed } = checkRateLimit(ip, 20, 60000)
  if (!allowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 })

  try {
    const { base64, mimeType } = await req.json()
    if (!base64) return NextResponse.json({ error: "No image provided" }, { status: 400 })

    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [{
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${base64}` },
          },
          {
            type: "text",
            text: `You are a kitchen ingredient detector. Analyze this image and identify all visible food ingredients.
Return ONLY a valid JSON array. No markdown, no explanation, nothing else.
Format: [{"name":"Onion","quantity":"3","unit":"pcs","emoji":"🧅"}]
If no ingredients are visible, return: []`,
          },
        ],
      }],
      max_tokens: 1000,
    })

    const text = response.choices[0]?.message?.content ?? "[]"
    const clean = text.replace(/```json|```/g, "").trim()
    const start = clean.indexOf("[")
    const end = clean.lastIndexOf("]")
    if (start === -1 || end === -1) return NextResponse.json({ ingredients: [] })
    const ingredients = JSON.parse(clean.slice(start, end + 1))
    return NextResponse.json({ ingredients })
  } catch (e: any) {
    console.error("Scan API error:", e.message)
    return NextResponse.json({ error: e.message || "Scan failed" }, { status: 500 })
  }
}
