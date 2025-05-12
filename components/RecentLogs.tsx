import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export default async function RecentLogs() {

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { 
            cookies: () => cookies(),
         }
    )

    const { data: logs, error } = await supabase
        .from("llm_logs")
        .select("ingredients, response, created_at")
        .order("created_at", { ascending: false })
        .limit(20)

    if (error) return <p className="text-red-500">Failed to load logs</p>

    return (
        <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Recent Public AI Cooking Ideas</h2>
            <ul className="space-y-4">
                {logs.map((log, idx) => (
                    <li key={idx} className="bg-white p-4 rounded shadow text-black">
                        <p className="text-sm text-gray-500">
                            {new Date(log.created_at).toLocaleString()}
                        </p>
                        <p className="font-medium mt-1">
                            🧂 {log.ingredients.join(", ")}
                        </p>
                        <p className="text-sm mt-2">
                            {log.response.slice(0, 200)}...
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    )
}