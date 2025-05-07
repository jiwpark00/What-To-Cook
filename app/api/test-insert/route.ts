import { supabase } from "@/lib/supabase"

export async function GET() {
    try {
        console.log("Starting insert...")

        // For now, we mock the user_id (replace w/ real one later once auth is set up)
        const mockUserId = "00000000-0000-0000-0000-000000000000"

        const { data, error } = await supabase.from("fridge_items").insert([
            {
                user_id: mockUserId,
                item_name: "kimchi"
            },
        ])

        console.log("Insert result:", { data, error})

        return new Response(JSON.stringify({ data, error }))
    } catch (e) {
        console.error("API error:", e)
        return new Response("Internal server error", { status: 500 })
    }
}