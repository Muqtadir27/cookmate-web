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

    const imageUrl = `data:${mimeType || "image/jpeg"};base64,${base64}`

    const response = await groq.chat.completions.create({
      model: "llama-3.2-11b-vision-preview",
      messages: [{
        role: "user",
        content: [
          { type: "image_url", image_url: { url: imageUrl } },
          {
            type: "text",
            text: `List all visible food ingredients in this image.
Return ONLY a valid JSON array, nothing else, no markdown.
Format: [{"name":"Onion","quantity":"3","unit":"pcs","emoji":"🧅"}]
If no food visible, return: []`
          }
        ]
      }],
      max_tokens: 800,
    })

    const text = response.choices[0]?.message?.content ?? "[]"
    const clean = text.replace(/```json|```/g, "").trim()
    const start = clean.indexOf("[")
    const end = clean.lastIndexOf("]")
    if (start === -1 || end === -1) return NextResponse.json({ ingredients: [] })
    const ingredients = JSON.parse(clean.slice(start, end + 1))
    return NextResponse.json({ ingredients })
  } catch (e: any) {
    console.error("Scan error:", e?.message || e)
    return NextResponse.json({ error: e?.message || "Scan failed" }, { status: 500 })
  }
}
