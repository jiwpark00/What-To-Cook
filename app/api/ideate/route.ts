import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { GoogleGenerativeAI } from "@google/generative-ai"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ALLOWED_LANGUAGES = ["English", "Korean", "Spanish"]

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
    const { ingredients, language, userId } = await req.json()

    // 🔐 (Step 1) Check if user is allowed (from Supabase)
    // ⏳ (Step 2) Check rate limit (last 1 hour)
    // 💬 (Step 3) If OK, call Gemini 2.0 API

    if (!userId || !Array.isArray(ingredients) || !ALLOWED_LANGUAGES.includes(language)) {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const { data: userSetting } = await supabase
        .from("user_settings")
        .select("llm_allowed")
        .eq("user_id", userId)
        .single()

    if (!userSetting?.llm_allowed) {
        return NextResponse.json({ error: "LLM access not permitted" }, { status: 403 })
    }

    const { count } = await supabase
        .from("llm_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", new Date(Date.now() - 1000 * 60 * 60).toISOString())

    if ((count ?? 0) >= 5) {
        return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    // LLM begins
    const prompt = `I have these ingredients: ${ingredients.join(", ")}.
    Suggest a dish and up to 3 things I could buy easily at local grocery store to make this dish.
    Respond in ${language}. If no language is given, respond in English.
    Keep it short and practical.`

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    let aiResponse: string

    try {
        const result = await model.generateContent(prompt)
        const text = result.response.text()
        aiResponse = text
    } catch (err) {
        console.log(err)
        return NextResponse.json({ error: "Gemini failed to respond." }, { status: 500 })
    }

    // Log usage
    await supabase.from("llm_logs").insert({
        user_id: userId,
        ingredients,
        language,
        response: aiResponse,
    })

    return NextResponse.json({ result: aiResponse })
}