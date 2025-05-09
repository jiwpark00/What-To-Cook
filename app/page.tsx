"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import UserHeader from "@/components/UserHeader"

export default function Home() {

  const [email, setEmail] = useState<string | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [ingredient, setIngredient] = useState("")
  const [fridge, setFridge] = useState<string[]>([])

  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      setEmail(data.session?.user.email || null)
      setCheckingAuth(false)
    }

    checkSession()
  }, [])

  const addIngredient = () => {
    if (ingredient.trim()) {
      setFridge((prev) => [...prev, ingredient.trim()])
      setIngredient("")
    }
  }

  if (checkingAuth) return <p className="p-4">Loading...</p>

  return (
    <main className="p-6 max-w-md mx-auto">
      <UserHeader />
      <p className="text-sm text-gray-400 mb-2">
        Add at least 3, and up to 5 ingredients.
      </p>

      {!email && (
        <button
          className="text-sm text-blue-600 border border-blue-600 px-3 py-1 rounded hover:bg-blue-100 mb-4"
          onClick={() => router.push("/login")}
        >
          Login
        </button>
      )}

      <h1 className="text-2xl font-bold mb-4">What&apos;s in your fridge?</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (ingredient.trim() && fridge.length < 5) {
            setFridge((prev) => [...prev, ingredient.trim()])
            setIngredient("")
          }
        }}
        className="flex gap-2 mb-4"
      >
        <input
          className="flex-1 border p-2 rounded"
          type="text"
          value={ingredient}
          onChange={(e) => setIngredient(e.target.value)}
          placeholder="e.g., kimchi, egg..."
          disabled={fridge.length >= 5}
        />
        <button
          type="submit"
          disabled={fridge.length >= 5}
          className={`px-4 py-2 rounded text-white ${
            fridge.length >= 5 ? "bg-gray-400 cursor-not-allowed" : "bg-green-600"
          }`}
        >
          Add
        </button>
      </form>
      <ul className="list-disc ml-6">
        {fridge.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
      {fridge.length >= 3 && (
        <button
          onClick={() => alert("This will call your AI API later")}
          className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            AI Cook Prediction!
          </button>
      )}
    </main >
  )
}