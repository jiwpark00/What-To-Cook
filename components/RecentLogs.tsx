import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export default async function RecentLogs() {

    const cookieStore = cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name) {
                    return cookieStore.get(name)?.value;
                },
                set(name, value, options) {
                    cookieStore.set(name, value, options);
                },
                remove(name, options) {
                    cookieStore.set(name, "", { ...options, maxAge: 0 });
                },
            },
        }
    )

    const { data: logs, error } = await supabase
        .from("llm_logs")
        .select("ingredients, response, created_at")
        .order("created_at", { ascending: false })
        .limit(20);

    if (error) return <p className="text-red-500">Failed to load logs</p>

    if (!logs || logs.length === 0) {
        return <p className="text-gray-500">No logs available yet</p>;
    }

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