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
    category: "Nut Allergy",
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
    category: "No Restrictions",
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredRecipes = selectedCategory 
    ? recipes.filter(recipe => recipe.category === selectedCategory)
    : recipes;

  const categories = [
    { name: 'All', value: null },
    { name: 'No Restrictions', value: 'No Restrictions' },
    { name: 'Vegetarian', value: 'Vegetarian' },
    { name: 'Gluten-Free', value: 'Gluten-Free' },
    { name: 'Nut Allergy', value: 'Nut Allergy' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6 sm:mb-10 px-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">Recipe Collection</h1>
          <p className="text-gray-300 text-base sm:text-lg mb-3">Discover amazing recipes with step-by-step video tutorials</p>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 sm:p-4 max-w-4xl mx-auto text-left">
            <h2 className="text-yellow-400 font-medium text-base sm:text-lg mb-2">📝 Recipe Modification Notice</h2>
            <p className="text-gray-300 text-sm sm:text-base mb-2">
              The recipes below are <span className="text-yellow-300">AI-inspired modifications</span> of the video tutorials. 
              We&apos;ve adjusted ingredients and methods to better fit dietary preferences and simplify preparation.
            </p>
            <p className="text-gray-400 text-xs sm:text-sm">
              💡 <span className="font-medium">Note:</span> The videos show the original recipes - our modifications are listed in the cards below.
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="w-full max-w-full overflow-x-auto pb-3 mb-6 scrollbar-hide">
          <div className="flex gap-2 sm:gap-3 px-4 w-max mx-auto">
            {categories.map((category) => (
              <button
                key={category.value || 'all'}
                onClick={() => setSelectedCategory(category.value)}
                className={`shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  selectedCategory === category.value
                    ? 'bg-blue-500 text-white shadow-md scale-105'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/70'
                } ${
                  category.value === 'Vegetarian' ? 'hover:bg-green-600/70' :
                  category.value === 'Nut Allergy' ? 'hover:bg-red-600/70' :
                  category.value === 'Gluten-Free' ? 'hover:bg-blue-600/70' :
                  category.value === 'No Restrictions' ? 'hover:bg-purple-600/70' :
                  'hover:bg-gray-600/70'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
          
          <div className="col-span-full h-2 sm:h-4"></div>
          {filteredRecipes.map((recipe) => (
            <div key={recipe.id} className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors mb-4 sm:mb-8">
              <div className="aspect-video relative w-full">
                <iframe
                  src={recipe.videoUrl}
                  title={recipe.title}
                  className="absolute top-0 left-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
              
              <div className="p-3 sm:p-4">
                <div className="flex flex-wrap justify-between items-center gap-2 mb-2 sm:mb-3">
                  <span className={
                    `text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] xs:text-xs font-medium whitespace-nowrap ${
                      recipe.category === 'Vegetarian' ? 'bg-green-600/90' :
                      recipe.category === 'Nut Allergy' ? 'bg-red-500/90' :
                      recipe.category === 'Gluten-Free' ? 'bg-blue-500/90' :
                      'bg-purple-500/90' // Default for No Restrictions
                    }`
                  }>
                    {recipe.category}
                  </span>
                  <span className="text-[10px] xs:text-xs text-gray-400 bg-gray-700/50 px-2 py-0.5 sm:py-1 rounded whitespace-nowrap">
                    Modified Recipe
                  </span>
                </div>
                
                <h2 className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2 line-clamp-2 h-[2.8em]">
                  {recipe.title}
                </h2>
                
                <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 h-[2.8em]">
                  {recipe.description}
                </p>
                
                <div className="mb-3 sm:mb-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-white mb-1 sm:mb-2">Ingredients:</h3>
                  <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2">
                    {recipe.ingredients.map((ingredient, i) => (
                      <span 
                        key={i}
                        className="bg-gray-700/50 text-gray-200 text-[10px] xs:text-xs px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap overflow-hidden text-ellipsis max-w-full"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gray-700/30 rounded-lg p-2 sm:p-3 text-xs sm:text-sm">
                  <h3 className="font-semibold text-white mb-1 sm:mb-2 text-sm">🛒 Buy List:</h3>
                  <ul className="space-y-0.5 sm:space-y-1 text-gray-300">
                    {recipe.buyList.map((item, i) => (
                      <li key={i} className="flex items-start">
                        <span className="mr-1 sm:mr-2 text-xs">•</span>
                        <span className="text-xs sm:text-sm leading-tight">{item}</span>
                      </li>
                    ))}
                  </ul>
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
