// components/DietaryPreferences.tsx
"use client";          // ⬅️  NEW LINE (must be first)
import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface DietaryPreference {
  id: string;
  name: string;
  description: string;
  category: 'dietary' | 'allergy' | 'cuisine';
  icon: string;
}

interface UserPreferences {
  dietary_restrictions: string[];
  allergies: string[];
  cuisine_preferences: string[];
  preferred_cooking_time?: number;
  spice_level?: 'mild' | 'medium' | 'spicy';
}

const DIETARY_OPTIONS: DietaryPreference[] = [
  // Dietary Restrictions
  { id: 'vegetarian', name: 'Vegetarian', description: 'No meat or fish', category: 'dietary', icon: '🥬' },
  { id: 'vegan', name: 'Vegan', description: 'No animal products', category: 'dietary', icon: '🌱' },
  { id: 'gluten-free', name: 'Gluten-Free', description: 'No wheat, barley, rye', category: 'dietary', icon: '🌾' },
  { id: 'keto', name: 'Keto', description: 'Low carb, high fat', category: 'dietary', icon: '🥑' },
  { id: 'paleo', name: 'Paleo', description: 'No grains, legumes, dairy', category: 'dietary', icon: '🥩' },
  { id: 'low-sodium', name: 'Low Sodium', description: 'Reduced salt content', category: 'dietary', icon: '🧂' },
  { id: 'diabetic', name: 'Diabetic-Friendly', description: 'Low sugar, controlled carbs', category: 'dietary', icon: '🩺' },
  
  // Common Allergies
  { id: 'nuts', name: 'Tree Nuts', description: 'No almonds, walnuts, etc.', category: 'allergy', icon: '🥜' },
  { id: 'peanuts', name: 'Peanuts', description: 'No peanuts or peanut oil', category: 'allergy', icon: '🥜' },
  { id: 'dairy', name: 'Dairy', description: 'No milk, cheese, butter', category: 'allergy', icon: '🥛' },
  { id: 'eggs', name: 'Eggs', description: 'No eggs or egg products', category: 'allergy', icon: '🥚' },
  { id: 'shellfish', name: 'Shellfish', description: 'No shrimp, crab, lobster', category: 'allergy', icon: '🦐' },
  { id: 'fish', name: 'Fish', description: 'No fish or fish sauce', category: 'allergy', icon: '🐟' },
  { id: 'soy', name: 'Soy', description: 'No soy sauce, tofu, etc.', category: 'allergy', icon: '🫘' },
  
  // Cuisine Preferences
  { id: 'italian', name: 'Italian', description: 'Pizza, pasta, Mediterranean', category: 'cuisine', icon: '🍝' },
  { id: 'asian', name: 'Asian', description: 'Chinese, Japanese, Thai, Korean', category: 'cuisine', icon: '🥢' },
  { id: 'mexican', name: 'Mexican', description: 'Tacos, burritos, spicy dishes', category: 'cuisine', icon: '🌮' },
  { id: 'indian', name: 'Indian', description: 'Curry, spices, rice dishes', category: 'cuisine', icon: '🍛' },
  { id: 'mediterranean', name: 'Mediterranean', description: 'Olive oil, herbs, fresh vegetables', category: 'cuisine', icon: '🫒' },
  { id: 'american', name: 'American', description: 'Comfort food, BBQ, classics', category: 'cuisine', icon: '🍔' },
];

interface DietaryPreferencesProps {
  userId: string;
  onPreferencesChange?: (preferences: UserPreferences) => void;
}

export default function DietaryPreferences({ userId, onPreferencesChange }: DietaryPreferencesProps) {
  const [preferences, setPreferences] = useState<UserPreferences>({
    dietary_restrictions: [],
    allergies: [],
    cuisine_preferences: [],
    preferred_cooking_time: 30,
    spice_level: 'medium'
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'dietary' | 'allergy' | 'cuisine'>('dietary');
  
  const supabase = createClientComponentClient();

  // Load user preferences on component mount
  useEffect(() => {
    loadUserPreferences();
  }, [userId]);

  const loadUserPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data && !error) {
        setPreferences({
          dietary_restrictions: data.dietary_restrictions || [],
          allergies: data.allergies || [],
          cuisine_preferences: data.cuisine_preferences || [],
          preferred_cooking_time: data.preferred_cooking_time || 30,
          spice_level: data.spice_level || 'medium'
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      
      onPreferencesChange?.(preferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const togglePreference = (optionId: string, category: keyof Pick<UserPreferences, 'dietary_restrictions' | 'allergies' | 'cuisine_preferences'>) => {
    setPreferences(prev => {
      const currentList = prev[category] as string[];
      const newList = currentList.includes(optionId)
        ? currentList.filter(id => id !== optionId)
        : [...currentList, optionId];
      
      return { ...prev, [category]: newList };
    });
  };

  const getOptionsForCategory = (category: 'dietary' | 'allergy' | 'cuisine') => {
    return DIETARY_OPTIONS.filter(option => option.category === category);
  };

  const getSelectedForCategory = (category: 'dietary' | 'allergy' | 'cuisine'): string[] => {
    switch (category) {
      case 'dietary': return preferences.dietary_restrictions;
      case 'allergy': return preferences.allergies;
      case 'cuisine': return preferences.cuisine_preferences;
    }
  };

  const getCategoryKey = (category: 'dietary' | 'allergy' | 'cuisine'): keyof Pick<UserPreferences, 'dietary_restrictions' | 'allergies' | 'cuisine_preferences'> => {
    switch (category) {
      case 'dietary': return 'dietary_restrictions';
      case 'allergy': return 'allergies';
      case 'cuisine': return 'cuisine_preferences';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Dietary Preferences</h2>
        <p className="text-gray-600">
          Help us personalize your recipe suggestions by sharing your dietary needs and preferences.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'dietary', label: 'Dietary Restrictions', icon: '🥗' },
          { id: 'allergy', label: 'Allergies', icon: '⚠️' },
          { id: 'cuisine', label: 'Cuisine Preferences', icon: '🍽️' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {getOptionsForCategory(activeTab).map(option => {
          const isSelected = getSelectedForCategory(activeTab).includes(option.id);
          return (
            <button
              key={option.id}
              onClick={() => togglePreference(option.id, getCategoryKey(activeTab))}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 text-blue-800'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{option.icon}</span>
                <div>
                  <h3 className="font-semibold">{option.name}</h3>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
                {isSelected && (
                  <div className="ml-auto">
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Additional Preferences */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-4">Additional Preferences</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cooking Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Cooking Time (minutes)
            </label>
            <select
              value={preferences.preferred_cooking_time}
              onChange={(e) => setPreferences(prev => ({ 
                ...prev, 
                preferred_cooking_time: parseInt(e.target.value) 
              }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={15}>15 minutes (Quick)</option>
              <option value={30}>30 minutes (Normal)</option>
              <option value={45}>45 minutes (Moderate)</option>
              <option value={60}>1 hour (Elaborate)</option>
              <option value={90}>1.5+ hours (Complex)</option>
            </select>
          </div>

          {/* Spice Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Spice Level
            </label>
            <select
              value={preferences.spice_level}
              onChange={(e) => setPreferences(prev => ({ 
                ...prev, 
                spice_level: e.target.value as 'mild' | 'medium' | 'spicy'
              }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="mild">🌶️ Mild</option>
              <option value="medium">🌶️🌶️ Medium</option>
              <option value="spicy">🌶️🌶️🌶️ Spicy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={savePreferences}
          disabled={isSaving}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            isSaving
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isSaving ? (
            <>
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
              Saving...
            </>
          ) : (
            'Save Preferences'
          )}
        </button>
      </div>

      {/* Current Selections Summary */}
      {(preferences.dietary_restrictions.length > 0 || 
        preferences.allergies.length > 0 || 
        preferences.cuisine_preferences.length > 0) && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">Your Current Preferences:</h4>
          <div className="text-sm text-green-700">
            {preferences.dietary_restrictions.length > 0 && (
              <p><strong>Dietary:</strong> {preferences.dietary_restrictions.map(id => 
                DIETARY_OPTIONS.find(opt => opt.id === id)?.name
              ).join(', ')}</p>
            )}
            {preferences.allergies.length > 0 && (
              <p><strong>Allergies:</strong> {preferences.allergies.map(id => 
                DIETARY_OPTIONS.find(opt => opt.id === id)?.name
              ).join(', ')}</p>
            )}
            {preferences.cuisine_preferences.length > 0 && (
              <p><strong>Cuisines:</strong> {preferences.cuisine_preferences.map(id => 
                DIETARY_OPTIONS.find(opt => opt.id === id)?.name
              ).join(', ')}</p>
            )}
            <p><strong>Cooking Time:</strong> {preferences.preferred_cooking_time} minutes</p>
            <p><strong>Spice Level:</strong> {preferences.spice_level}</p>
          </div>
        </div>
      )}
    </div>
  );
}