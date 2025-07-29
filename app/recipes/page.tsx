"use client"

import { useState } from 'react';

interface Recipe {
  id: string;
  title: string;
  category: string;
  ingredients: string[];
  description: string;
  videoUrl: string;
  buyList: string[];
}

const sampleRecipes: Recipe[] = [
  {
    id: "1",
    title: "Creamy Pesto Pasta",
    category: "Vegetarian",
    ingredients: ["pasta", "basil", "garlic", "pine nuts", "olive oil", "parmesan"],
    description: "A classic Italian vegetarian pasta dish with fresh basil pesto sauce.",
    videoUrl: "https://www.youtube.com/embed/VYBA-M361gI",
    buyList: [
      "1. Pine nuts (for pesto)",
      "2. Garlic (for pesto)",
      "3. Olive oil (for pesto)",
      "4. Fresh basil",
      "5. Parmesan cheese",
      "6. Pasta of choice"
    ]
  },
  {
    id: "2",
    title: "Better Than Takeout Orange Chicken",
    category: "Nut-Free",
    ingredients: ["chicken breast", "rice", "mango", "orange juice", "olive oil", "vinegar"],
    description: "A delicious chicken dish with mango-orange vinaigrette, perfect for nut allergy considerations.",
    videoUrl: "https://www.youtube.com/embed/m7piVVJnyvY",
    buyList: [
      "1. Chicken breast",
      "2. Rice (any type)",
      "3. Olive oil"
    ]
  },
  {
    id: "3",
    title: "3-Ingredient Stuffed Avocados",
    category: "Gluten-Free",
    ingredients: ["avocado", "eggs", "cheese", "lime", "cilantro", "tomatoes"],
    description: "Simple 3-ingredient stuffed avocados with fresh herbs and eggs - a healthy, gluten-free meal.",
    videoUrl: "https://www.youtube.com/embed/O6YOaZ3PLt8",
    buyList: [
      "1. Avocados (ripe)",
      "2. Eggs (for stuffing)",
      "3. Cheese (your choice)",
      "4. Lime (for flavor)",
      "5. Cilantro (fresh herb)"
    ]
  },
  {
    id: "4",
    title: "Refreshing Watermelon & Apple Salad",
    category: "Vegan",
    ingredients: ["watermelon", "apple", "jalapeño", "lime", "red onion", "cilantro"],
    description: "A sweet and spicy summer salad with juicy watermelon, crisp apple, and a zesty lime dressing.",
    videoUrl: "https://www.youtube.com/embed/nMi1X3kiSR0",
    buyList: [
      "1. Watermelon (seedless)",
      "2. Apple (crisp variety)",
      "3. Lime (for zesty dressing)",
      "4. Red onion (thinly sliced)",
      "5. Cilantro (fresh)",
      "6. Jalapeño (for mild heat)"
    ]
  }
];

export default function RecipesPage() {
  const [recipes] = useState<Recipe[]>(sampleRecipes);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-4">Recipe Collection</h1>
          <p className="text-gray-300 text-lg mb-3">Discover amazing recipes with step-by-step video tutorials</p>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 max-w-4xl mx-auto">
            <h2 className="text-yellow-400 font-medium mb-2">📝 Recipe Modification Notice</h2>
            <p className="text-gray-300 text-lg mb-2">
              The recipes below are <span className="text-yellow-300">AI-inspired modifications</span> of the video tutorials. 
              We've adjusted ingredients and methods to better fit dietary preferences and simplify preparation.
            </p>
            <p className="text-gray-400 text-lg">
              💡 <span className="font-medium">Note:</span> The videos show the original recipes - our modifications are listed in the cards below.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
          {/* Extra spacing row for better separation */}
          <div className="col-span-full h-8"></div>
          {recipes.map((recipe) => (
            <div key={recipe.id} className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors mb-8">
              <div className="aspect-video relative">
                <iframe
                  src={recipe.videoUrl}
                  title={recipe.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="bg-green-600/90 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {recipe.category}
                  </span>
                  <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                    Modified Recipe
                  </span>
                </div>
                
                <h2 className="text-lg font-bold text-white mb-2 line-clamp-2" style={{minHeight: '2.75rem'}}>
                  {recipe.title}
                </h2>
                <p className="text-gray-300 mb-4">{recipe.description}</p>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Ingredients:</h3>
                    <div className="flex flex-wrap gap-2">
                      {recipe.ingredients.map((ingredient) => (
                        <span key={ingredient} className="bg-gray-700 text-gray-200 px-3 py-1 rounded-full text-sm">
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Buy List:</h3>
                    <ul className="space-y-1">
                      {recipe.buyList.map((item, index) => (
                        <li key={index} className="text-gray-300 text-sm">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {recipes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">More recipes coming soon!</p>
          </div>
        )}
      </div>
    </main>
  );
}
