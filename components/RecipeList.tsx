'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { FiSearch, FiX } from 'react-icons/fi';
import DOMPurify from 'dompurify';

interface RecipeInstructions {
  [key: string]: string | string[] | number | boolean | null | undefined;
}

interface RecipeData {
  title?: string;
  ingredients?: string[] | string;
  instructions?: string | RecipeInstructions;
}

interface LogRow {
  public_id: string;
  created_at: string;
  language: string;
  ingredients: string[];
  response: string;
}

interface RecipeListProps {
  initialData: LogRow[];
  initialCount: number;
  page: number;
}

const RecipeList = ({ initialData, initialCount, page }: RecipeListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isClient, setIsClient] = useState(false);
  const PAGE_SIZE = 8;
  
  useEffect(() => {
    setIsClient(true);
  }, []); // Empty dependency array to run only once

  // Helper function to safely extract recipe data
  const getRecipeData = (row: LogRow): RecipeData => {
    try {
      // Try to parse as JSON first
      const response = typeof row.response === 'string' 
        ? JSON.parse(row.response) 
        : row.response;
      
      // Handle different response formats
      if (response && typeof response === 'object') {
        // Standard format with title, ingredients, instructions
        return {
          title: response.title || 'Recipe',
          ingredients: response.ingredients || [],
          instructions: response.instructions || ''
        };
      } else {
        // Fallback: treat the whole response as instructions
        return {
          title: 'Recipe',
          ingredients: [],
          instructions: String(response || '')
        };
      }
    } catch {
      // If JSON parsing fails, treat the whole response as instructions
      return {
        title: 'Recipe',
        ingredients: [],
        instructions: String(row.response || '')
      };
    }
  };

  // Process and filter recipes based on search query
  const { filteredRecipes } = useMemo(() => {
    if (!initialData) return { filteredRecipes: [] };

    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      return { filteredRecipes: initialData };
    }

    const filtered = initialData.filter(row => {
      const recipeData = getRecipeData(row);
      
      // Prepare searchable text
      const title = String(recipeData.title || '').toLowerCase();
      
      const ingredients = Array.isArray(recipeData.ingredients)
        ? recipeData.ingredients.join(' ').toLowerCase()
        : String(recipeData.ingredients || '').toLowerCase();
      
      const instructions = typeof recipeData.instructions === 'string'
        ? recipeData.instructions.toLowerCase()
        : JSON.stringify(recipeData.instructions || '').toLowerCase();
      
      // Check if query matches any field
      return title.includes(query) || 
             ingredients.includes(query) || 
             instructions.includes(query);
    });

    return { filteredRecipes: filtered };
  }, [initialData, searchQuery]);

  // Calculate pagination for filtered results
  const paginatedRecipes = useMemo(() => {
    // If searching, apply client-side pagination to filtered results
    if (searchQuery) {
      return filteredRecipes.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    }
    // If not searching, use the initial data as is (server-side paginated)
    return filteredRecipes;
  }, [filteredRecipes, searchQuery, page]);

  // Calculate total pages based on whether we're searching or not
  const totalPages = useMemo(() => {
    return searchQuery 
      ? Math.ceil(filteredRecipes.length / PAGE_SIZE)
      : Math.ceil(initialCount / PAGE_SIZE);
  }, [searchQuery, filteredRecipes.length, initialCount, PAGE_SIZE]);

  // Show pagination if we have more than one page of results
  const showPagination = searchQuery 
    ? filteredRecipes.length > PAGE_SIZE 
    : initialCount > PAGE_SIZE;
  const showSearchResultsInfo = searchQuery && isClient && filteredRecipes.length > 0;

  // RecipeCard component
  const RecipeCard: React.FC<{ row: LogRow; recipeData: RecipeData }> = ({ row, recipeData }) => {
    const ingredients = Array.isArray(recipeData.ingredients) 
      ? recipeData.ingredients 
      : typeof recipeData.ingredients === 'string' 
        ? recipeData.ingredients.split('\n').filter(Boolean)
        : [];

    return (
      <article className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden transition-all duration-300 hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-0.5">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                {recipeData.title || 'Delicious Recipe'}
              </h2>
              <div className="flex items-center text-sm text-gray-400 gap-4">
                <time dateTime={row.created_at} className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(row.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  {row.language || 'English'}
                </span>
              </div>
            </div>
          </div>

          {ingredients.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium text-gray-300 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Ingredients
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ingredients.map((ingredient, idx) => (
                  <li key={idx} className="flex items-center text-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2"></span>
                    {String(ingredient).trim()}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4">
            <h3 className="font-medium text-gray-300 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Instructions
            </h3>
            <div className="prose prose-invert max-w-none text-gray-300">
              {typeof recipeData.instructions === 'string' ? (
                <div 
                  className="space-y-3"
                  dangerouslySetInnerHTML={{ 
                    __html: DOMPurify.sanitize(
                      String(recipeData.instructions)
                        .replace(/\n\s*\n/g, '</p><p>')
                        .replace(/\n/g, '<br />')
                    )
                  }} 
                />
              ) : (
                <p className="whitespace-pre-wrap">{JSON.stringify(recipeData.instructions, null, 2)}</p>
              )}
            </div>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Latest AI-Generated Recipes</h1>
          <p className="text-gray-300 text-lg mb-3">Discover and explore recipes created by our community</p>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 max-w-4xl mx-auto">
            <p className="text-gray-300 text-lg mb-2">
              These recipes are <span className="text-yellow-300">AI-generated</span> based on community inputs and preferences.
            </p>
            <p className="text-gray-400 text-lg">
              💡 <span className="font-medium">Note:</span> Each recipe is uniquely created by our AI based on the ingredients and preferences provided.
            </p>
          </div>

          <br></br>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search recipes by title, ingredients, or instructions..."
                className="w-full pl-10 pr-10 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search recipes"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  aria-label="Clear search"
                >
                  <FiX size={20} />
                </button>
              )}
            </div>
            {showSearchResultsInfo && (
              <p className="mt-2 text-sm text-gray-400 text-left">
                Found {filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'} matching &quot;{searchQuery}&quot;
              </p>
            )}
          </div>
        </div>

        {paginatedRecipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No recipes found. Be the first to create one!</p>
            <Link href="/" className="mt-4 inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity">
              Create a Recipe
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {paginatedRecipes.map((row) => {
              // Try to parse the response as JSON, fallback to raw text
              let recipeData: RecipeData;
              try {
                recipeData = typeof row.response === 'string' ? JSON.parse(row.response) : row.response;
              } catch {
                recipeData = { 
                  title: 'Recipe', 
                  ingredients: [], 
                  instructions: String(row.response) 
                };
              }
              
              return <RecipeCard key={row.public_id} row={row} recipeData={recipeData} />;
            })}
          </div>
        )}

        {/* Enhanced Pagination */}
        {showPagination && (
          <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex-1 text-left">
              {page > 0 && (
                <Link 
                  href={`/recent?page=${searchQuery ? page - 1 : page - 1}`} 
                  className="inline-flex items-center px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all duration-200 transform hover:-translate-x-0.5 hover:shadow-lg"
                  aria-label="Go to newer posts"
                >
                  <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="font-medium">Newer Recipes</span>
                </Link>
              )}
            </div>
            
            <div className="flex items-center bg-gray-800/50 px-4 py-2 rounded-full border border-gray-700">
              <span className="text-sm font-medium text-gray-300">
                Page <span className="text-white">{page + 1}</span> of <span className="text-white">{Math.max(1, totalPages)}</span>
              </span>
              <span className="mx-2 text-gray-500">•</span>
              <span className="text-sm text-gray-400">
                Showing <span className="text-white">
                  {searchQuery 
                    ? `${Math.min(page * PAGE_SIZE + 1, filteredRecipes.length)}-${Math.min((page + 1) * PAGE_SIZE, filteredRecipes.length)}`
                    : `${page * PAGE_SIZE + 1}-${Math.min((page + 1) * PAGE_SIZE, initialCount)}`}
                  </span> of <span className="text-white">
                  {searchQuery ? filteredRecipes.length : initialCount}
                </span> recipes
              </span>
            </div>
            
            <div className="flex-1 text-right">
              {page + 1 < totalPages && (
                <Link 
                  href={`/recent?page=${searchQuery ? page + 1 : page + 1}`} 
                  className="inline-flex items-center px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all duration-200 transform hover:translate-x-0.5 hover:shadow-lg ml-auto"
                  aria-label="Go to older posts"
                >
                  <span className="font-medium">Older Recipes</span>
                  <svg className="w-5 h-5 ml-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeList;
