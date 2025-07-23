// pages/api/generate-recipe.ts (or app/api/generate-recipe/route.ts for App Router)
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  getUserPreferences, 
  buildEnhancedPrompt, 
  filterIngredientsForAllergies,
  validateRecipeAgainstPreferences,
  type EnhancedRecipeRequest 
} from '@/utils/dietaryPreferences';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { ingredients, language = 'English' } = body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: 'Ingredients array is required' },
        { status: 400 }
      );
    }

    if (ingredients.length < 3 || ingredients.length > 5) {
      return NextResponse.json(
        { error: 'Please provide 3-5 ingredients' },
        { status: 400 }
      );
    }

    // Get user's dietary preferences
    const preferences = await getUserPreferences(user.id);
    
    // Check for allergic ingredients if user has allergies
    let safeIngredients = ingredients;
    let warnings: string[] = [];
    
    if (preferences?.allergies && preferences.allergies.length > 0) {
      const { safe, flagged } = filterIngredientsForAllergies(ingredients, preferences.allergies);
      
      if (flagged.length > 0) {
        warnings.push(`Warning: Some ingredients may trigger allergies: ${flagged.join(', ')}`);
        
        // If too many ingredients are flagged, return error
        if (safe.length < 2) {
          return NextResponse.json({
            error: 'Too many ingredients conflict with your allergies. Please choose different ingredients.',
            flaggedIngredients: flagged,
            userAllergies: preferences.allergies
          }, { status: 400 });
        }
        
        safeIngredients = safe;
      }
    }

    // Create enhanced request object
    const enhancedRequest: EnhancedRecipeRequest = {
      ingredients: safeIngredients,
      language,
      preferences
    };

    // Build enhanced prompt with dietary preferences
    const prompt = buildEnhancedPrompt(enhancedRequest);

    // Generate recipe with Gemini AI
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const recipeText = response.text();

    // Validate the generated recipe against preferences
    let validationWarnings: string[] = [];
    if (preferences) {
      const validation = validateRecipeAgainstPreferences(recipeText, preferences);
      if (!validation.isValid) {
        validationWarnings = validation.warnings;
      }
    }

    // Log the request to Supabase (enhanced with preferences info)
    const logData = {
      user_id: user.id,
      ingredients: safeIngredients,
      original_ingredients: ingredients,
      language,
      response: recipeText,
      dietary_restrictions: preferences?.dietary_restrictions || [],
      allergies: preferences?.allergies || [],
      cuisine_preferences: preferences?.cuisine_preferences || [],
      cooking_time_preference: preferences?.preferred_cooking_time,
      spice_level: preferences?.spice_level,
      warnings: [...warnings, ...validationWarnings],
      created_at: new Date().toISOString()
    };

    // Save to enhanced recipe_requests table
    const { error: logError } = await supabase
      .from('recipe_requests')
      .insert(logData);

    if (logError) {
      console.error('Error logging recipe request:', logError);
      // Don't fail the request if logging fails
    }

    // Return enhanced response
    return NextResponse.json({
      recipe: recipeText,
      metadata: {
        ingredients_used: safeIngredients,
        preferences_applied: preferences ? {
          dietary_restrictions: preferences.dietary_restrictions,
          allergies: preferences.allergies,
          cuisine_preferences: preferences.cuisine_preferences,
          cooking_time: preferences.preferred_cooking_time,
          spice_level: preferences.spice_level
        } : null,
        warnings: [...warnings, ...validationWarnings],
        language
      }
    });

  } catch (error) {
    console.error('Error generating recipe:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// For Pages Router (pages/api/generate-recipe.ts)
// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   try {
//     const supabase = createServerSupabaseClient({ req, res });
    
//     // Get the current user
//     const { data: { user }, error: authError } = await supabase.auth.getUser();
    
//     if (authError || !user) {
//       return res.status(401).json({ error: 'Authentication required' });
//     }

//     // Rest of the logic remains the same...
//     // (Same implementation as the App Router version above)
    
//   } catch (error) {
//     console.error('Error generating recipe:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// }