import { NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
export async function POST(req: NextRequest) {
  try {
    const { question, recipe, step } = await req.json()
    const res = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: `You are a helpful AI chef assistant. The user is cooking "${recipe}". Current step: "${step}". Answer cooking questions concisely in 1-2 sentences.` },
        { role: "user", content: question }
      ],
      max_tokens: 200,
    })
    const answer = res.choices[0]?.message?.content ?? "I'm not sure, try checking the recipe!"
    return NextResponse.json({ answer })
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
