// utils/dietaryPreferences.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface UserPreferences {
  dietary_restrictions: string[];
  allergies: string[];
  cuisine_preferences: string[];
  preferred_cooking_time?: number;
  spice_level?: 'mild' | 'medium' | 'spicy';
}

export interface EnhancedRecipeRequest {
  ingredients: string[];
  language: string;
  preferences?: UserPreferences;
}

/**
 * Fetch user's dietary preferences from the database
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  const supabase = createClientComponentClient();
  
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;

    return {
      dietary_restrictions: data.dietary_restrictions || [],
      allergies: data.allergies || [],
      cuisine_preferences: data.cuisine_preferences || [],
      preferred_cooking_time: data.preferred_cooking_time || 30,
      spice_level: data.spice_level || 'medium'
    };
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return null;
  }
}

/**
 * Generate enhanced prompt for AI that includes dietary preferences
 */
export function buildEnhancedPrompt(request: EnhancedRecipeRequest): string {
  const { ingredients, language, preferences } = request;
  
  let basePrompt = `Create a creative recipe using these ingredients: ${ingredients.join(', ')}.`;
  
  // Add dietary restrictions
  if (preferences?.dietary_restrictions && preferences.dietary_restrictions.length > 0) {
    const restrictions = preferences.dietary_restrictions.map(restriction => {
      const restrictionMap: Record<string, string> = {
        'vegetarian': 'vegetarian (no meat or fish)',
        'vegan': 'vegan (no animal products)',
        'gluten-free': 'gluten-free (no wheat, barley, rye)',
        'keto': 'ketogenic (low carb, high fat)',
        'paleo': 'paleo (no grains, legumes, dairy)',
        'low-sodium': 'low sodium',
        'diabetic': 'diabetic-friendly (low sugar, controlled carbs)'
      };
      return restrictionMap[restriction] || restriction;
    });
    
    basePrompt += ` The recipe must be ${restrictions.join(' and ')}.`;
  }
  
  // Add allergy restrictions
  if (preferences?.allergies && preferences.allergies.length > 0) {
    const allergies = preferences.allergies.map(allergy => {
      const allergyMap: Record<string, string> = {
        'nuts': 'tree nuts',
        'peanuts': 'peanuts',
        'dairy': 'dairy products',
        'eggs': 'eggs',
        'shellfish': 'shellfish',
        'fish': 'fish',
        'soy': 'soy products'
      };
      return allergyMap[allergy] || allergy;
    });
    
    basePrompt += ` IMPORTANT: This recipe must NOT contain ${allergies.join(', ')} as the person is allergic.`;
  }
  
  // Add cuisine preferences
  if (preferences?.cuisine_preferences && preferences.cuisine_preferences.length > 0) {
    const cuisines = preferences.cuisine_preferences.map(cuisine => {
      const cuisineMap: Record<string, string> = {
        'italian': 'Italian',
        'asian': 'Asian (Chinese, Japanese, Thai, Korean)',
        'mexican': 'Mexican',
        'indian': 'Indian',
        'mediterranean': 'Mediterranean',
        'american': 'American'
      };
      return cuisineMap[cuisine] || cuisine;
    });
    
    basePrompt += ` Try to incorporate flavors and cooking techniques from these cuisines: ${cuisines.join(', ')}.`;
  }
  
  // Add cooking time preference
  if (preferences?.preferred_cooking_time) {
    const timeMap: Record<number, string> = {
      15: 'quick (15 minutes or less)',
      30: 'moderate (around 30 minutes)',
      45: 'standard (45 minutes)',
      60: 'elaborate (about 1 hour)',
      90: 'complex (1.5+ hours)'
    };
    
    const timeDescription = timeMap[preferences.preferred_cooking_time] || `about ${preferences.preferred_cooking_time} minutes`;
    basePrompt += ` The recipe should take ${timeDescription} to prepare and cook.`;
  }
  
  // Add spice level preference
  if (preferences?.spice_level) {
    const spiceMap: Record<string, string> = {
      'mild': 'mild (minimal spice)',
      'medium': 'medium spice level',
      'spicy': 'spicy (high heat level)'
    };
    
    basePrompt += ` Make the recipe ${spiceMap[preferences.spice_level]}.`;
  }
  
  // Add language instruction
  basePrompt += ` Please provide the recipe in ${language}.`;
  
  // Add formatting instructions
  basePrompt += ` 

Format your response with:
- Recipe name
- Brief description
- Ingredients list with quantities
- Step-by-step instructions
- Estimated cooking time
- Difficulty level (Easy/Medium/Hard)
- Any dietary notes or substitution suggestions`;

  return basePrompt;
}

/**
 * Filter ingredients based on allergies
 */
export function filterIngredientsForAllergies(ingredients: string[], allergies: string[]): {
  safe: string[];
  flagged: string[];
} {
  const allergenKeywords: Record<string, string[]> = {
    'nuts': ['almond', 'walnut', 'pecan', 'cashew', 'pistachio', 'hazelnut', 'macadamia'],
    'peanuts': ['peanut', 'groundnut'],
    'dairy': ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'whey', 'casein'],
    'eggs': ['egg', 'mayonnaise', 'meringue'],
    'shellfish': ['shrimp', 'crab', 'lobster', 'oyster', 'mussel', 'clam', 'scallop'],
    'fish': ['salmon', 'tuna', 'cod', 'bass', 'trout', 'mackerel', 'anchovy'],
    'soy': ['soy', 'tofu', 'tempeh', 'miso', 'edamame']
  };
  
  const safe: string[] = [];
  const flagged: string[] = [];
  
  ingredients.forEach(ingredient => {
    const lowerIngredient = ingredient.toLowerCase();
    let isFlagged = false;
    
    for (const allergy of allergies) {
      const keywords = allergenKeywords[allergy] || [allergy];
      if (keywords.some(keyword => lowerIngredient.includes(keyword))) {
        flagged.push(ingredient);
        isFlagged = true;
        break;
      }
    }
    
    if (!isFlagged) {
      safe.push(ingredient);
    }
  });
  
  return { safe, flagged };
}

/**
 * Get ingredient suggestions based on dietary preferences
 */
export function getIngredientSuggestions(preferences: UserPreferences): string[] {
  let suggestions: string[] = [];
  
  // Base suggestions for dietary restrictions
  if (preferences.dietary_restrictions.includes('vegetarian') || preferences.dietary_restrictions.includes('vegan')) {
    suggestions.push('tofu', 'lentils', 'chickpeas', 'quinoa', 'mushrooms', 'spinach');
  }
  
  if (preferences.dietary_restrictions.includes('keto')) {
    suggestions.push('avocado', 'olive oil', 'salmon', 'eggs', 'broccoli', 'cauliflower');
  }
  
  if (preferences.dietary_restrictions.includes('gluten-free')) {
    suggestions.push('rice', 'potatoes', 'corn', 'gluten-free oats');
  }
  
  // Cuisine-based suggestions
  if (preferences.cuisine_preferences.includes('italian')) {
    suggestions.push('basil', 'tomatoes', 'mozzarella', 'olive oil', 'garlic');
  }
  
  if (preferences.cuisine_preferences.includes('asian')) {
    suggestions.push('ginger', 'soy sauce', 'sesame oil', 'rice', 'green onions');
  }
  
  if (preferences.cuisine_preferences.includes('mexican')) {
    suggestions.push('cilantro', 'lime', 'cumin', 'peppers', 'beans');
  }
  
  // Remove duplicates and return
  return [...new Set(suggestions)];
}

/**
 * Validate recipe against user preferences (for future AI response validation)
 */
export function validateRecipeAgainstPreferences(
  recipeText: string, 
  preferences: UserPreferences
): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  const lowerRecipe = recipeText.toLowerCase();
  
  // Check for allergies
  const allergenKeywords: Record<string, string[]> = {
    'nuts': ['almond', 'walnut', 'pecan', 'cashew', 'pistachio', 'hazelnut'],
    'peanuts': ['peanut'],
    'dairy': ['milk', 'cheese', 'butter', 'cream', 'yogurt'],
    'eggs': ['egg'],
    'shellfish': ['shrimp', 'crab', 'lobster', 'oyster'],
    'fish': ['salmon', 'tuna', 'cod', 'fish'],
    'soy': ['soy', 'tofu']
  };
  
  preferences.allergies.forEach(allergy => {
    const keywords = allergenKeywords[allergy] || [allergy];
    const foundKeywords = keywords.filter(keyword => lowerRecipe.includes(keyword));
    if (foundKeywords.length > 0) {
      warnings.push(`Recipe may contain ${allergy} allergen: ${foundKeywords.join(', ')}`);
    }
  });
  
  // Check dietary restrictions
  if (preferences.dietary_restrictions.includes('vegetarian')) {
    const meatKeywords = ['chicken', 'beef', 'pork', 'lamb', 'fish', 'meat'];
    const foundMeat = meatKeywords.filter(keyword => lowerRecipe.includes(keyword));
    if (foundMeat.length > 0) {
      warnings.push(`Recipe may not be vegetarian: contains ${foundMeat.join(', ')}`);
    }
  }
  
  if (preferences.dietary_restrictions.includes('vegan')) {
    const animalKeywords = ['chicken', 'beef', 'pork', 'fish', 'milk', 'cheese', 'butter', 'egg', 'honey'];
    const foundAnimal = animalKeywords.filter(keyword => lowerRecipe.includes(keyword));
    if (foundAnimal.length > 0) {
      warnings.push(`Recipe may not be vegan: contains ${foundAnimal.join(', ')}`);
    }
  }
  
  return {
    isValid: warnings.length === 0,
    warnings
  };
}