"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import UserHeader from "@/components/UserHeader"
import { INGREDIENTS } from "../lib/ingredients";

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
  
  const handleDownload = () => {
    if (!aiResult) return
    
    const element = document.createElement('a')
    const file = new Blob([aiResult], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `recipe-${new Date().toISOString().slice(0, 10)}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }
  const [dietaryRestriction, setDietaryRestriction] = useState("none");

  const router = useRouter()


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
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="p-6 md:p-8">
          <UserHeader />
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">What's in your fridge?</h1>
            <p className="text-gray-300">Add at least 3, and up to 5 ingredients to get recipe suggestions</p>
          </div>

      {!email && (
        <div className="flex justify-center mb-6">
          <button
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full font-medium hover:opacity-90 transition-opacity shadow-lg"
            onClick={() => router.push("/login")}
          >
            <span>Login to Save Your Ingredients</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
      <div className="mb-6">
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
              setError("Only letters, numbers, spaces, and dashes are allowed.")
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
        >
          <div className="relative">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  type="text"
                  value={ingredient}
                  onChange={(e) => {
                    const value = e.target.value
                    setIngredient(value)

                    const cleaned = value.trim().toLowerCase()
                    const matches = INGREDIENTS.filter((item) => 
                      item.toLowerCase().startsWith(cleaned)
                    )
                    setSuggestions(matches.slice(0, 5))
                  }}
                  placeholder="Start typing an ingredient (e.g., chicken, rice, tomatoes)..."
                  disabled={fridge.length >= 5}
                />
                {ingredient && (
                  <button
                    type="button"
                    onClick={() => setIngredient("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
                {suggestions.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg overflow-hidden">
                    {suggestions.map((item, idx) => (
                      <li
                        key={idx}
                        className="px-4 py-2 text-white hover:bg-gray-600 cursor-pointer flex items-center gap-2"
                        onClick={() => {
                          setIngredient(item)
                          setSuggestions([])
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                type="submit"
                disabled={fridge.length >= 5}
                className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all ${
                  fridge.length >= 5 
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed" 
                    : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90 shadow-lg"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="mt-2 text-red-400 text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
      </div>

      {fridge.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385V4.804z" />
              <path d="M10 4.804A7.968 7.968 0 0114.5 4c1.255 0 2.443.29 3.5.804v10A7.969 7.969 0 0014.5 14c-1.67 0-3.218.51-4.5 1.385V4.804z" />
              <path d="M10 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 005.5 14c1.669 0 3.218.51 4.5 1.385V4.804z" />
            </svg>
            Your Ingredients ({fridge.length}/5)
          </h2>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex flex-wrap gap-2">
              {fridge.map((item, idx) => (
                <div key={idx} className="bg-gray-600 text-white px-3 py-2 rounded-full flex items-center gap-2 group">
                  <span>{item}</span>
                  <button
                    onClick={() => handleDelete(item)}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                    aria-label={`Remove ${item}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7 2a1 1 0 00-.707.293l-4 4a1 1 0 000 1.414l8 8a1 1 0 001.414 0l4-4a1 1 0 000-1.414l-8-8A1 1 0 007 2zm0 2.414L9.586 8 7 10.586 4.414 8 7 5.414zM11 11a1 1 0 10-2 0v1a1 1 0 102 0v-1z" clipRule="evenodd" />
          </svg>
          Language Preferences
        </h2>
        <div className="space-y-2">
          <label htmlFor="language" className="block text-sm font-medium text-gray-300">
            Preferred Response Language
          </label>
          <p className="text-sm text-gray-400 mb-3">
            English, Korean, and Spanish are currently supported. Default is English.
          </p>
          <div className="relative">
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">English (default)</option>
              {ALLOWED_LANGUAGES.filter((lang) => lang !== "English").map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Dietary Preferences
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Let us know about any dietary restrictions or preferences
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className={`flex items-center p-3 rounded-lg border-2 transition-colors ${
            dietaryRestriction === "none" 
              ? "border-purple-500 bg-purple-500/10" 
              : "border-gray-700 hover:border-gray-600"
          }`}>
            <input
              type="radio"
              name="dietaryRestriction"
              value="none"
              checked={dietaryRestriction === "none"}
              onChange={() => setDietaryRestriction("none")}
              className="hidden"
            />
            <div className={`w-5 h-5 rounded-full border-2 mr-3 flex-shrink-0 flex items-center justify-center ${
              dietaryRestriction === "none" 
                ? "border-purple-500 bg-purple-500" 
                : "border-gray-500"
            }`}>
              {dietaryRestriction === "none" && (
                <div className="w-2 h-2 rounded-full bg-white"></div>
              )}
            </div>
            <span className="text-white">No Restrictions</span>
          </label>

          <label className={`flex items-center p-3 rounded-lg border-2 transition-colors ${
            dietaryRestriction === "vegetarian" 
              ? "border-green-500 bg-green-500/10" 
              : "border-gray-700 hover:border-gray-600"
          }`}>
            <input
              type="radio"
              name="dietaryRestriction"
              value="vegetarian"
              checked={dietaryRestriction === "vegetarian"}
              onChange={() => setDietaryRestriction("vegetarian")}
              className="hidden"
            />
            <div className={`w-5 h-5 rounded-full border-2 mr-3 flex-shrink-0 flex items-center justify-center ${
              dietaryRestriction === "vegetarian" 
                ? "border-green-500 bg-green-500" 
                : "border-gray-500"
            }`}>
              {dietaryRestriction === "vegetarian" && (
                <div className="w-2 h-2 rounded-full bg-white"></div>
              )}
            </div>
            <span className="text-white">Vegetarian</span>
          </label>

          <label className={`flex items-center p-3 rounded-lg border-2 transition-colors ${
            dietaryRestriction === "gluten" 
              ? "border-yellow-500 bg-yellow-500/10" 
              : "border-gray-700 hover:border-gray-600"
          }`}>
            <input
              type="radio"
              name="dietaryRestriction"
              value="gluten"
              checked={dietaryRestriction === "gluten"}
              onChange={() => setDietaryRestriction("gluten")}
              className="hidden"
            />
            <div className={`w-5 h-5 rounded-full border-2 mr-3 flex-shrink-0 flex items-center justify-center ${
              dietaryRestriction === "gluten" 
                ? "border-yellow-500 bg-yellow-500" 
                : "border-gray-500"
            }`}>
              {dietaryRestriction === "gluten" && (
                <div className="w-2 h-2 rounded-full bg-white"></div>
              )}
            </div>
            <span className="text-white">Gluten-Free</span>
          </label>

          <label className={`flex items-center p-3 rounded-lg border-2 transition-colors ${
            dietaryRestriction === "nut_allergy" 
              ? "border-red-500 bg-red-500/10" 
              : "border-gray-700 hover:border-gray-600"
          }`}>
            <input
              type="radio"
              name="dietaryRestriction"
              value="nut_allergy"
              checked={dietaryRestriction === "nut_allergy"}
              onChange={() => setDietaryRestriction("nut_allergy")}
              className="hidden"
            />
            <div className={`w-5 h-5 rounded-full border-2 mr-3 flex-shrink-0 flex items-center justify-center ${
              dietaryRestriction === "nut_allergy" 
                ? "border-red-500 bg-red-500" 
                : "border-gray-500"
            }`}>
              {dietaryRestriction === "nut_allergy" && (
                <div className="w-2 h-2 rounded-full bg-white"></div>
              )}
            </div>
            <span className="text-white">Nut Allergy</span>
          </label>
        </div>
      </div>
      <div className="sticky bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 -mx-6 -mb-6 p-6">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
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
                    dietaryRestriction,
                  }),
                })

                const data = await res.json()

                if (data.result) {
                  setAiResult(data.result)
                  // Scroll to results
                  setTimeout(() => {
                    const resultsElement = document.getElementById('ai-results');
                    if (resultsElement) {
                      resultsElement.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 100);
                } else {
                  alert(data.error || "Something went wrong.")
                }
              } catch (err) {
                console.error(err)
                alert("Failed to connect to the server. Please try again later.")
              }
            }}
            className={`w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
              !email
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : ""
            }`}
            disabled={!email}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate Recipe Ideas
          </button>

          {!email && (
            <p className="mt-3 text-sm text-center text-yellow-400 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              You must be logged in to generate recipes
            </p>
          )}
        </div>
      </div>
      {aiResult && (
        <div className="px-6 pb-6">
          <div id="ai-results" className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Recipe Ideas
            </h2>
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-gray-200">
                {aiResult}
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-700">
              <button
                onClick={handleDownload}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download Recipe
              </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
</main>
  )
}