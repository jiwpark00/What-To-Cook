// hooks/useDietaryPreferences.ts
import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@supabase/auth-helpers-react';
import { 
  getUserPreferences, 
  getIngredientSuggestions,
  filterIngredientsForAllergies,
  type UserPreferences 
} from '@/utils/dietaryPreferences';

interface UseDietaryPreferencesReturn {
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;
  updatePreferences: (newPreferences: Partial<UserPreferences>) => Promise<boolean>;
  refreshPreferences: () => Promise<void>;
  getPersonalizedSuggestions: () => string[];
  checkIngredientSafety: (ingredients: string[]) => {
    safe: string[];
    flagged: string[];
    warnings: string[];
  };
  hasPreferences: boolean;
}

export function useDietaryPreferences(): UseDietaryPreferencesReturn {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const user = useUser();
  const supabase = createClientComponentClient();

  // Load preferences on mount or user change
  const loadPreferences = useCallback(async () => {
    if (!user?.id) {
      setPreferences(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const userPrefs = await getUserPreferences(user.id);
      setPreferences(userPrefs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preferences');
      console.error('Error loading dietary preferences:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // Update preferences
  const updatePreferences = useCallback(async (newPreferences: Partial<UserPreferences>): Promise<boolean> => {
    if (!user?.id) {
      setError('User not authenticated');
      return false;
    }

    try {
      setError(null);
      
      const updatedPrefs = preferences ? { ...preferences, ...newPreferences } : {
        dietary_restrictions: [],
        allergies: [],
        cuisine_preferences: [],
        preferred_cooking_time: 30,
        spice_level: 'medium' as const,
        ...newPreferences
      };

      const { error: updateError } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...updatedPrefs,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (updateError) throw updateError;
      
      setPreferences(updatedPrefs);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      console.error('Error updating dietary preferences:', err);
      return false;
    }
  }, [user?.id, preferences, supabase]);

  // Refresh preferences
  const refreshPreferences = useCallback(async () => {
    await loadPreferences();
  }, [loadPreferences]);

  // Get personalized ingredient suggestions
  const getPersonalizedSuggestions = useCallback(() => {
    if (!preferences) return [];
    return getIngredientSuggestions(preferences);
  }, [preferences]);

  // Check ingredient safety against allergies
  const checkIngredientSafety = useCallback((ingredients: string[]) => {
    if (!preferences?.allergies || preferences.allergies.length === 0) {
      return {
        safe: ingredients,
        flagged: [],
        warnings: []
      };
    }

    const { safe, flagged } = filterIngredientsForAllergies(ingredients, preferences.allergies);
    const warnings = flagged.length > 0 
      ? [`Warning: These ingredients may trigger allergies: ${flagged.join(', ')}`]
      : [];

    return { safe, flagged, warnings };
  }, [preferences]);

  // Check if user has set any preferences
  const hasPreferences = Boolean(
    preferences && (
      preferences.dietary_restrictions.length > 0 ||
      preferences.allergies.length > 0 ||
      preferences.cuisine_preferences.length > 0
    )
  );

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    refreshPreferences,
    getPersonalizedSuggestions,
    checkIngredientSafety,
    hasPreferences
  };
}

// Additional hook for recipe generation with preferences
export function useEnhancedRecipeGeneration() {
  const { preferences, checkIngredientSafety } = useDietaryPreferences();
  const [generating, setGenerating] = useState(false);
  const [lastRecipe, setLastRecipe] = useState<string | null>(null);
  const [lastWarnings, setLastWarnings] = useState<string[]>([]);

  const generateRecipe = useCallback(async (
    ingredients: string[], 
    language: string = 'English'
  ) => {
    try {
      setGenerating(true);
      
      // Check ingredient safety first
      const safety = checkIngredientSafety(ingredients);
      
      // If too many ingredients are unsafe, warn the user
      if (safety.flagged.length > 0 && safety.safe.length < 2) {
        throw new Error(`Too many ingredients conflict with your allergies: ${safety.flagged.join(', ')}`);
      }

      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients,
          language
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate recipe');
      }

      const data = await response.json();
      setLastRecipe(data.recipe);
      setLastWarnings(data.metadata.warnings || []);
      
      return {
        recipe: data.recipe,
        metadata: data.metadata,
        success: true
      };
    } catch (error) {
      console.error('Recipe generation error:', error);
      return {
        recipe: null,
        metadata: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      setGenerating(false);
    }
  }, [checkIngredientSafety]);

  return {
    generateRecipe,
    generating,
    lastRecipe,
    lastWarnings,
    preferences
  };
}

// Hook for managing ingredient input with preference awareness
export function useIngredientInput() {
  const { preferences, getPersonalizedSuggestions, checkIngredientSafety } = useDietaryPreferences();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Update suggestions when preferences change
  useEffect(() => {
    if (preferences) {
      setSuggestions(getPersonalizedSuggestions());
    }
  }, [preferences, getPersonalizedSuggestions]);

  const addIngredient = useCallback((ingredient: string) => {
    if (ingredients.length >= 5) {
      throw new Error('Maximum 5 ingredients allowed');
    }
    
    const newIngredients = [...ingredients, ingredient];
    const safety = checkIngredientSafety(newIngredients);
    
    if (safety.flagged.includes(ingredient)) {
      throw new Error(`${ingredient} conflicts with your allergy restrictions`);
    }
    
    setIngredients(newIngredients);
    return safety.warnings;
  }, [ingredients, checkIngredientSafety]);

  const removeIngredient = useCallback((index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearIngredients = useCallback(() => {
    setIngredients([]);
  }, []);

  const validateIngredients = useCallback(() => {
    if (ingredients.length < 3) {
      return { valid: false, message: 'Please add at least 3 ingredients' };
    }
    
    const safety = checkIngredientSafety(ingredients);
    if (safety.safe.length < 2) {
      return { 
        valid: false, 
        message: 'Too many ingredients conflict with your allergies. Please choose different ingredients.' 
      };
    }
    
    return { valid: true, warnings: safety.warnings };
  }, [ingredients, checkIngredientSafety]);

  return {
    ingredients,
    suggestions,
    addIngredient,
    removeIngredient,
    clearIngredients,
    validateIngredients,
    canAddMore: ingredients.length < 5,
    safety: checkIngredientSafety(ingredients)
  };
}