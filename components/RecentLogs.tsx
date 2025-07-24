"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

interface Log {
  id: number
  ingredients: string[]
  response: string
  created_at: string
  rating?: number | null
}

export default function RecentLogs() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { persistSession: false }
      }
    )

    async function fetchLogs() {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from("llm_logs")
        .select("id, ingredients, response, created_at, rating")
        .order("created_at", { ascending: false })
        .limit(20)
      if (error) setError("Failed to load logs")
      else setLogs(data || [])
      setLoading(false)
    }
    fetchLogs()
  }, [])

  if (loading) return <p className="p-4">Loading recent logs...</p>
  if (error) return <p className="text-red-500">{error}</p>
  if (!logs || logs.length === 0) {
    return <p className="text-gray-500">No logs available yet</p>
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Recent Public AI Cooking Ideas</h2>
      <ul className="space-y-4">
        {logs.map((log) => (
          <li key={log.id} className="bg-white p-4 rounded shadow text-black">
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
