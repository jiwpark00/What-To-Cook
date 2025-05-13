"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import UserHeader from "@/components/UserHeader"

async function deleteIngredientFromDB(item: string) {
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  if (!user) return

  const { error: dbError } = await supabase
    .from("fridge_items")
    .delete()
    .eq("item_name", item)
    .eq("user_id", user.id)

  if (dbError) {
    console.error("Delete failed:", dbError)
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

  const INGREDIENTS = [
    "apple", "avocado", "bacon", "banana", "basil", "beef", "bell pepper", "broccoli",
    "butter", "cabbage", "carrot", "cauliflower", "celery", "cheese", "chicken",
    "cilantro", "cinnamon", "coconut", "corn", "cucumber", "egg", "eggplant", "eel",
    "garlic", "ginger", "grape", "green bean", "green onion", "honey", "jalapeño",
    "kale", "ketchup", "kimchi", "lemon", "lettuce", "lime", "mayo", "milk", "mushroom",
    "mustard", "noodle", "oat", "olive", "onion", "orange", "paprika", "parsley",
    "pasta", "peach", "peanut", "pear", "peas", "pepper", "pineapple", "pork",
    "potato", "pumpkin", "quinoa", "radish", "rice", "rosemary", "salmon", "salt",
    "sausage", "shrimp", "soy sauce", "spinach", "squash", "steak", "strawberry",
    "sugar", "sweet potato", "tofu", "tomato", "tuna", "turkey", "vinegar", "walnut",
    "watermelon", "wheat", "yam", "yogurt", "zucchini"
  ]

  const ALLOWED_LANGUAGES = ["English", "Korean", "Spanish"]

  const ALLOWED_EMAIL_DOMAINS = [
    "gmail.com", "outlook.com", "icloud.com", "protonmail.com", "yahoo.com"
  ]

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
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [aiResult, setAiResult] = useState<string | null>(null)
  const [emailToSend, setEmailToSend] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)

  const router = useRouter()

  const validateEmailDomain = (email: string): boolean => {
    if (!email || !email.includes('@')) return false

    const domain = email.split('@')[1]
    return ALLOWED_EMAIL_DOMAINS.includes(domain)
  }

  const handleEmailSend = () => {
    if (!emailToSend.trim()) {
      alert("Please enter your email first.")
      return
    }

    // Validate email domain
    if (!validateEmailDomain(emailToSend)) {
      setEmailError("Your email provider is not supported. Please use Gmail, Outlook, iCloud.com, Yahoo.com, or Protonmail.com")
    return
    }

    setEmailError(null)
    alert(`Eventually, we will have a feature to send to your email`)
  }

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      const email = user?.email || null

      setEmail(email)
      setCheckingAuth(false)

      if (!user) return

      if (user && !user.email_confirmed_at) {
        alert("Please verify your email to use this app.")
        await supabase.auth.signOut()
        return
      }

      if (user) {
        const { data } = await supabase
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

          if (!INGREDIENTS.includes(cleaned)) {
            setError("Please select a valid ingredient from the list.")
            return
          }

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
          onChange={(e) => {
            const value = e.target.value
            setIngredient(value)

            const cleaned = value.trim().toLowerCase()
            const matches = INGREDIENTS.filter((item) => item.toLowerCase().startsWith(cleaned)
            )
            setSuggestions(matches.slice(0, 5)) // Limit to 5 suggestions
          }}
          placeholder="e.g., lettuce, egg..."
          disabled={fridge.length >= 5}
        />
        {suggestions.length > 0 && (
          <ul className="bg-white text-black border rounded mt-1">
            {suggestions.map((item, idx) => (
              <li
                key={idx}
                className="px-2 py-1 hover:bg-gray-200 cursor-pointer"
                onClick={() => {
                  setIngredient(item)
                  setSuggestions([]) // clear suggestions after selection
                }}
              >
                {item}
              </li>
            ))}
          </ul>
        )}
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
          Preferred Response Language (Optional)
          <br />
          English, Korean, Spanish are currently tested and available.
          <br />
          *Default will be English
        </label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full border p-2 rounded text-white"
        >
          <option value="">English (default)</option>
          {ALLOWED_LANGUAGES.filter((lang) => lang !== "English").map((lang) => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>
      {fridge.length >= 3 && (
        <div className="mt-4">
          <button
            onClick={async () => {

              const selectedLanguage = language || "English"

              if (!ALLOWED_LANGUAGES.includes(selectedLanguage)) {
                alert("Please choose a supported language: English, Korean, or Spanish.")
                return
              }

              try {
                const res = await fetch("/api/ideate", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    ingredients: fridge,
                    language: selectedLanguage,
                    userId: (await supabase.auth.getSession()).data.session?.user.id,
                  }),
                })

                const data = await res.json()

                if (data.result) {
                  setAiResult(data.result)
                } else {
                  alert(data.error || "Something went wrong.")
                }
              } catch (err) {
                console.log(err)
                alert("Failed to research the server.")
              }
            }}
            className={`px-4 py-2 rounded text-white ${!email
              ? "bg-gray-400 hover:bg-gray-500 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700"
              }`}
          >
            AI Cook Prediction!
          </button>

          {!email && (
            <p className="mt-2 text-sm text-yellow-300">
              🔒 You must log in to use this feature.
            </p>
          )}

          {aiResult && (
            <div className="mt-4 bg-white text-black p-4 rounded shadow whitespace-pre-wrap">
              {aiResult}
              {/* email button below*/}
              <div className="mt-4">
                <label className="block mb-1 text-sm font-medium text-gray-800">Send to your email:</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="use your email"
                    className="flex-1 border p-2 rounded"
                    value={emailToSend}
                    onChange={(e) => setEmailToSend(e.currentTarget.value)}
                  />
                  <button
                    onClick={handleEmailSend}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Send
                  </button>
                </div>
                {emailError && (
                  <p className="text-red-500 text-sm mt-1">{emailError}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </main >
  )
}