"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import UserHeader from "@/components/UserHeader"

async function deleteIngredientFromDB(item: string) {
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return

  const { error } = await supabase
    .from("fridge_items")
    .delete()
    .eq("item_name", item)
    .eq("user_id", user.id)

  if (error) {
    console.error("Delete failed:", error)
  }
}

async function saveIngredientToDB(item: string) {
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return

  await supabase.from("fridge_items").insert({
    item_name: item,
    user_id: user.id,
  })
}

export default function Home() {

  const [email, setEmail] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [ingredient, setIngredient] = useState("")
  const [fridge, setFridge] = useState<string[]>([])
  const handleDelete = async (item: string) => {
    setFridge((prev) => prev.filter((i) => i !== item))
    await deleteIngredientFromDB(item)
  }
  const [language, setLanguage] = useState("")

  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      const email = user?.email || null

      setEmail(email)
      setCheckingAuth(false)

      if (user) {
        const { data, error } = await supabase
          .from("fridge_items")
          .select("item_name")
          .eq("user_id", user.id)

        if (data) {
          const names = data.map((row) => row.item_name)
          setFridge(names)
        }
      }
    }

    checkSession()

  }, [])

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
        onSubmit={async (e) => {
          e.preventDefault()

          const cleaned = ingredient.trim().toLowerCase()
          const isValidFormat = /^[\p{L}\p{N}\s\-]+$/u.test(cleaned)

          if (!cleaned) {
            setError("Ingredient cannot be empty.")
            return
          }

          if (cleaned.length > 30) {
            setError("Ingredient must be 30 characters or less.")
            return
          }

          if (!isValidFormat) {
            setError("Only letters, numbers, spaces, and dashses are allowed.")
            return
          }

          if (fridge.includes(cleaned)) {
            setError("You already added that ingredient.")
            return
          }

          if (fridge.length >= 5) {
            setError("You can only add up to 5 ingredients.")
            return
          }

          setError(null)
          setFridge((prev) => [...prev, cleaned])
          setIngredient("")
          await saveIngredientToDB(cleaned)
        }}
        className="flex gap-2 mb-2"
      >

        <input
          className="flex-1 border p-2 rounded"
          type="text"
          value={ingredient}
          onChange={(e) => setIngredient(e.target.value)}
          placeholder="e.g., lettuce, egg..."
          disabled={fridge.length >= 5}
        />
        <button
          type="submit"
          disabled={fridge.length >= 5}
          className={`px-4 py-2 rounded text-white ${fridge.length >= 5 ? "bg-gray-400 cursor-not-allowed" : "bg-green-600"
            }`}
        >
          Add
        </button>
      </form>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <ul className="list-disc ml-6">
        {fridge.map((item, idx) => (
          <li key={idx} className="flex justify-between items-center mb-2">
            <span className="text-gray-300">{item}</span>
            <button
              onClick={() => handleDelete(item)}
              className="text-sm text-red-500 hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      <div className="mb-4">
        <label htmlFor="language" className="block text-sm font-medium text-gray-200 mb-1">
          Preferred Response Language
        </label>
        <input
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          placeholder="e.g., English, Español, 한국어, ..."
          className="w-full border p-2 rounded text-white"
        />
      </div>
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