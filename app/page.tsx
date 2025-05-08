"use client"

import { useState } from "react"

export default function Home() {
  const [ingredient, setIngredient] = useState("")
  const [fridge, setFridge] = useState<string[]>([])

  const addIngredient = () => {
    if (ingredient.trim()) {
      setFridge((prev) => [...prev, ingredient.trim()])
      setIngredient("")
    }
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">What's in your fridge?</h1>
      <div className="flex gap-2 mb-4">
        <input
          className="flex-1 border p-2 rounded"
          type="text"
          value={ingredient}
          onChange={(e) => setIngredient(e.target.value)}
          placeholder="e.g., kimchi, egg..."
        />
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={addIngredient}
        >
          Add
        </button>
      </div>
      <ul className="list-disc ml-6">
        {fridge.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </main>
  )
}