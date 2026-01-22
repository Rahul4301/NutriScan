/**
 * Manual nutrition analysis helpers to reduce AI API calls
 */

// Common non-vegan ingredients
const NON_VEGAN_INGREDIENTS = [
  'meat', 'beef', 'pork', 'chicken', 'turkey', 'lamb', 'veal', 'duck', 'goose',
  'fish', 'salmon', 'tuna', 'shrimp', 'crab', 'lobster', 'oyster', 'mussel', 'clam',
  'egg', 'eggs', 'milk', 'cheese', 'butter', 'cream', 'yogurt', 'whey', 'casein',
  'gelatin', 'lard', 'bacon', 'ham', 'sausage', 'pepperoni', 'anchovy', 'caviar',
  'honey', 'beeswax', 'shellac', 'carmine', 'cochineal'
];

// Common allergens
const ALLERGEN_KEYWORDS: Record<string, string[]> = {
  'Dairy': ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'whey', 'casein', 'lactose'],
  'Gluten': ['wheat', 'flour', 'bread', 'pasta', 'barley', 'rye', 'oats', 'gluten'],
  'Nuts': ['almond', 'walnut', 'pecan', 'hazelnut', 'cashew', 'pistachio', 'macadamia', 'nut'],
  'Peanuts': ['peanut', 'peanuts'],
  'Soy': ['soy', 'soya', 'tofu', 'tempeh', 'edamame'],
  'Eggs': ['egg', 'eggs', 'mayonnaise', 'mayo'],
  'Fish': ['fish', 'salmon', 'tuna', 'cod', 'sardine', 'anchovy'],
  'Shellfish': ['shrimp', 'crab', 'lobster', 'oyster', 'mussel', 'clam', 'scallop'],
  'Sesame': ['sesame', 'tahini'],
};

/**
 * Check if ingredients contain non-vegan items
 */
export function checkIsVegan(ingredients: string | undefined): boolean {
  if (!ingredients) return false;
  
  const lowerIngredients = ingredients.toLowerCase();
  return !NON_VEGAN_INGREDIENTS.some(ingredient => 
    lowerIngredients.includes(ingredient.toLowerCase())
  );
}

/**
 * Detect allergens from ingredients
 */
export function detectAllergens(ingredients: string | undefined): string[] {
  if (!ingredients) return [];
  
  const lowerIngredients = ingredients.toLowerCase();
  const detected: string[] = [];
  
  for (const [allergen, keywords] of Object.entries(ALLERGEN_KEYWORDS)) {
    if (keywords.some(keyword => lowerIngredients.includes(keyword.toLowerCase()))) {
      detected.push(allergen);
    }
  }
  
  return detected;
}

/**
 * Check for dietary violations by matching ingredients against user restrictions/allergens
 */
export function checkDietaryViolations(
  ingredients: string | undefined,
  dietaryRestrictions?: string[],
  allergens?: string[]
): string[] {
  if (!ingredients) return [];
  
  const violations: string[] = [];
  const lowerIngredients = ingredients.toLowerCase();
  
  // Check dietary restrictions
  if (dietaryRestrictions && dietaryRestrictions.length > 0) {
    for (const restriction of dietaryRestrictions) {
      const lowerRestriction = restriction.toLowerCase();
      // Remove "no " prefix if present
      const cleanRestriction = lowerRestriction.replace(/^no\s+/, '');
      
      // Check if ingredient contains the restriction
      if (lowerIngredients.includes(cleanRestriction)) {
        violations.push(restriction);
      }
      
      // Special cases for common restrictions
      if (cleanRestriction.includes('pork') && 
          (lowerIngredients.includes('pork') || lowerIngredients.includes('ham') || lowerIngredients.includes('bacon'))) {
        if (!violations.includes(restriction)) {
          violations.push(restriction);
        }
      }
      if (cleanRestriction.includes('beef') && 
          (lowerIngredients.includes('beef') || lowerIngredients.includes('steak') || lowerIngredients.includes('burger'))) {
        if (!violations.includes(restriction)) {
          violations.push(restriction);
        }
      }
    }
  }
  
  // Check allergens
  if (allergens && allergens.length > 0) {
    const detectedAllergens = detectAllergens(ingredients);
    for (const allergen of allergens) {
      if (detectedAllergens.some(detected => 
        detected.toLowerCase() === allergen.toLowerCase() ||
        allergen.toLowerCase().includes(detected.toLowerCase())
      )) {
        if (!violations.includes(allergen)) {
          violations.push(allergen);
        }
      }
    }
  }
  
  return violations;
}

/**
 * Calculate health rating (1-10) based on nutritional values
 * Higher score = healthier
 */
export function calculateHealthRating(nutrition: {
  calories?: string | number;
  fat?: string | number;
  saturatedFat?: string | number;
  sugar?: string | number;
  sodium?: string | number;
  fiber?: string | number;
  protein?: string | number;
}): number {
  let score = 5; // Start at middle
  
  // Extract numeric values
  const calories = typeof nutrition.calories === 'string' 
    ? parseFloat(nutrition.calories.replace(/[^0-9.]/g, '')) || 0
    : nutrition.calories || 0;
  const fat = typeof nutrition.fat === 'string'
    ? parseFloat(nutrition.fat.replace(/[^0-9.]/g, '')) || 0
    : nutrition.fat || 0;
  const saturatedFat = typeof nutrition.saturatedFat === 'string'
    ? parseFloat(nutrition.saturatedFat.replace(/[^0-9.]/g, '')) || 0
    : nutrition.saturatedFat || 0;
  const sugar = typeof nutrition.sugar === 'string'
    ? parseFloat(nutrition.sugar.replace(/[^0-9.]/g, '')) || 0
    : nutrition.sugar || 0;
  const sodium = typeof nutrition.sodium === 'string'
    ? parseFloat(nutrition.sodium.replace(/[^0-9.]/g, '')) || 0
    : nutrition.sodium || 0;
  const fiber = typeof nutrition.fiber === 'string'
    ? parseFloat(nutrition.fiber.replace(/[^0-9.]/g, '')) || 0
    : nutrition.fiber || 0;
  const protein = typeof nutrition.protein === 'string'
    ? parseFloat(nutrition.protein.replace(/[^0-9.]/g, '')) || 0
    : nutrition.protein || 0;
  
  // Calories scoring (500-800 is ideal for a meal)
  if (calories > 0) {
    if (calories < 300) score += 0.5; // Very low cal
    else if (calories <= 500) score += 1; // Low cal
    else if (calories <= 800) score += 0.5; // Moderate
    else if (calories > 1000) score -= 1.5; // Very high cal
    else if (calories > 800) score -= 0.5; // High cal
  }
  
  // Fat scoring (lower is better, but some fat is good)
  if (fat > 0) {
    if (fat < 10) score += 0.5; // Very low fat
    else if (fat <= 20) score += 0.5; // Low fat
    else if (fat > 40) score -= 1; // Very high fat
    else if (fat > 30) score -= 0.5; // High fat
  }
  
  // Saturated fat (lower is better)
  if (saturatedFat > 0) {
    if (saturatedFat <= 5) score += 0.5; // Low sat fat
    else if (saturatedFat > 15) score -= 1; // Very high sat fat
    else if (saturatedFat > 10) score -= 0.5; // High sat fat
  }
  
  // Sugar (lower is better)
  if (sugar > 0) {
    if (sugar <= 10) score += 0.5; // Low sugar
    else if (sugar > 30) score -= 1.5; // Very high sugar
    else if (sugar > 20) score -= 1; // High sugar
  }
  
  // Sodium (lower is better, but some is needed)
  if (sodium > 0) {
    if (sodium <= 500) score += 0.5; // Low sodium
    else if (sodium > 1500) score -= 1; // Very high sodium
    else if (sodium > 1000) score -= 0.5; // High sodium
  }
  
  // Fiber (higher is better)
  if (fiber > 0) {
    if (fiber >= 5) score += 1; // Good fiber
    else if (fiber >= 3) score += 0.5; // Some fiber
    else if (fiber < 1) score -= 0.5; // No fiber
  }
  
  // Protein (higher is better, but not excessive)
  if (protein > 0) {
    if (protein >= 20 && protein <= 40) score += 0.5; // Good protein range
    else if (protein > 40) score += 0.5; // High protein (good)
    else if (protein < 10) score -= 0.5; // Low protein
  }
  
  // Clamp to 1-10 range
  return Math.max(1, Math.min(10, Math.round(score * 10) / 10));
}

/**
 * Calculate diabetes warning based on net carbs
 */
export function calculateDiabetesWarning(
  carbs: string | number | undefined,
  fiber: string | number | undefined
): string | undefined {
  if (!carbs) return undefined;
  
  const carbsNum = typeof carbs === 'string'
    ? parseFloat(carbs.replace(/[^0-9.]/g, '')) || 0
    : carbs || 0;
  const fiberNum = typeof fiber === 'string'
    ? parseFloat(fiber.replace(/[^0-9.]/g, '')) || 0
    : fiber || 0;
  
  const netCarbs = carbsNum - fiberNum;
  
  // Ideal range for diabetics: 45-60g net carbs per meal
  if (netCarbs < 45 || netCarbs > 60) {
    return `Warning: Net carbs (${netCarbs.toFixed(1)}g) are outside the recommended 45-60g range per meal for diabetes management. This meal may cause blood sugar spikes or drops.`;
  }
  
  return undefined;
}
