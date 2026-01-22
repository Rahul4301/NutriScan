/**
 * RAG (Retrieval Augmented Generation) for product nutrition lookup
 * Uses Open Food Facts API to retrieve accurate nutritional data for branded products
 */

export type ProductInfo = {
  brand?: string;
  productName?: string;
  barcode?: string;
  visibleNutrition?: {
    calories?: string;
    protein?: string;
    carbs?: string;
    fat?: string;
    sugar?: string;
  };
};

export type ProductNutrition = {
  calories?: string;
  carbs?: string;
  protein?: string;
  fat?: string;
  saturatedFat?: string;
  sugar?: string;
  fiber?: string;
  sodium?: string;
  ingredients?: string;
  allergens?: string[];
};

/**
 * Search Open Food Facts API for product nutrition data
 */
async function searchOpenFoodFacts(brand: string, productName: string): Promise<ProductNutrition | null> {
  try {
    // Open Food Facts API endpoint
    const searchQuery = `${brand} ${productName}`.trim();
    const encodedQuery = encodeURIComponent(searchQuery);
    
    // Search API
    const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodedQuery}&search_simple=1&action=process&json=1&page_size=1`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'NutriScan/1.0 (https://nutriscan.app)',
      },
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (!data.products || data.products.length === 0) {
      return null;
    }
    
    const product = data.products[0];
    
    // Extract nutrition data
    const nutriments = product.nutriments || {};
    const nutrition: ProductNutrition = {};
    
    // Convert to strings with units (matching our format)
    if (nutriments['energy-kcal_100g']) {
      const calories = Math.round(nutriments['energy-kcal_100g'] * (product.serving_size ? parseFloat(product.serving_size) / 100 : 1));
      nutrition.calories = calories.toString();
    } else if (nutriments['energy-kcal']) {
      nutrition.calories = Math.round(nutriments['energy-kcal']).toString();
    }
    
    if (nutriments['proteins_100g']) {
      const protein = nutriments['proteins_100g'] * (product.serving_size ? parseFloat(product.serving_size) / 100 : 1);
      nutrition.protein = `${protein.toFixed(1)}g`;
    } else if (nutriments['proteins']) {
      nutrition.protein = `${nutriments['proteins'].toFixed(1)}g`;
    }
    
    if (nutriments['carbohydrates_100g']) {
      const carbs = nutriments['carbohydrates_100g'] * (product.serving_size ? parseFloat(product.serving_size) / 100 : 1);
      nutrition.carbs = `${carbs.toFixed(1)}g`;
    } else if (nutriments['carbohydrates']) {
      nutrition.carbs = `${nutriments['carbohydrates'].toFixed(1)}g`;
    }
    
    if (nutriments['fat_100g']) {
      const fat = nutriments['fat_100g'] * (product.serving_size ? parseFloat(product.serving_size) / 100 : 1);
      nutrition.fat = `${fat.toFixed(1)}g`;
    } else if (nutriments['fat']) {
      nutrition.fat = `${nutriments['fat'].toFixed(1)}g`;
    }
    
    if (nutriments['saturated-fat_100g']) {
      const satFat = nutriments['saturated-fat_100g'] * (product.serving_size ? parseFloat(product.serving_size) / 100 : 1);
      nutrition.saturatedFat = `${satFat.toFixed(1)}g`;
    } else if (nutriments['saturated-fat']) {
      nutrition.saturatedFat = `${nutriments['saturated-fat'].toFixed(1)}g`;
    }
    
    if (nutriments['sugars_100g']) {
      const sugar = nutriments['sugars_100g'] * (product.serving_size ? parseFloat(product.serving_size) / 100 : 1);
      nutrition.sugar = `${sugar.toFixed(1)}g`;
    } else if (nutriments['sugars']) {
      nutrition.sugar = `${nutriments['sugars'].toFixed(1)}g`;
    }
    
    if (nutriments['fiber_100g']) {
      const fiber = nutriments['fiber_100g'] * (product.serving_size ? parseFloat(product.serving_size) / 100 : 1);
      nutrition.fiber = `${fiber.toFixed(1)}g`;
    } else if (nutriments['fiber']) {
      nutrition.fiber = `${nutriments['fiber'].toFixed(1)}g`;
    }
    
    if (nutriments['sodium_100g']) {
      const sodium = nutriments['sodium_100g'] * (product.serving_size ? parseFloat(product.serving_size) / 100 : 1);
      nutrition.sodium = `${sodium.toFixed(0)}mg`;
    } else if (nutriments['sodium']) {
      nutrition.sodium = `${nutriments['sodium'].toFixed(0)}mg`;
    }
    
    // Ingredients
    if (product.ingredients_text) {
      nutrition.ingredients = product.ingredients_text;
    }
    
    // Allergens
    if (product.allergens_tags && product.allergens_tags.length > 0) {
      nutrition.allergens = product.allergens_tags
        .map((tag: string) => tag.replace('en:', '').replace(/-/g, ' '))
        .map((tag: string) => tag.charAt(0).toUpperCase() + tag.slice(1));
    }
    
    // Only return if we have at least calories or macros
    if (nutrition.calories || nutrition.protein || nutrition.carbs || nutrition.fat) {
      return nutrition;
    }
    
    return null;
  } catch (error) {
    console.error('Error searching Open Food Facts:', error);
    return null;
  }
}

/**
 * Detect brand and product from image using AI
 */
export async function detectBrandAndProduct(
  imageDataUri: string,
  apiKey: string
): Promise<ProductInfo | null> {
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Extract mime type + base64 payload from data URI
    const match = imageDataUri.match(/^data:([^;]+);base64,(.*)$/);
    if (!match) {
      return null;
    }
    const [, mimeType, base64Data] = match;
    
    const prompt = `Analyze this image and identify if there is a branded product visible.

CRITICAL: Look for:
1. Brand names (e.g., "Coca-Cola", "Kellogg's", "nurri", "Fairlife", "Muscle Milk")
2. Product names or labels
3. Barcodes (if visible)
4. Nutrition facts visible on the label (e.g., "30g protein", "1g sugar", calories, etc.)

If you see nutrition facts clearly displayed on the label, extract them accurately.

Return JSON only in this shape:
{
  "brand": "string | null (e.g., 'nurri', 'Coca-Cola')",
  "productName": "string | null (e.g., 'chocolate milk shake', 'Coca-Cola Classic')",
  "barcode": "string | null (if barcode is visible)",
  "visibleNutrition": {
    "calories": "string | null (if visible on label)",
    "protein": "string | null (if visible on label, e.g., '30g')",
    "carbs": "string | null (if visible on label)",
    "fat": "string | null (if visible on label)",
    "sugar": "string | null (if visible on label, e.g., '1g')"
  }
}

If no brand or product is visible, return:
{
  "brand": null,
  "productName": null,
  "barcode": null,
  "visibleNutrition": {}
}`;
    
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
    });
    
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return null;
    }
    
    const parsed = JSON.parse(jsonMatch[0]) as ProductInfo;
    
    // Only return if we found a brand or product
    if (parsed.brand || parsed.productName) {
      return parsed;
    }
    
    return null;
  } catch (error) {
    console.error('Error detecting brand/product:', error);
    return null;
  }
}

/**
 * Main RAG function: Detect product and retrieve nutrition data
 */
export async function getProductNutritionFromRAG(
  imageDataUri: string,
  apiKey: string
): Promise<ProductNutrition | null> {
  // Step 1: Detect brand/product from image
  const productInfo = await detectBrandAndProduct(imageDataUri, apiKey);
  
  if (!productInfo || (!productInfo.brand && !productInfo.productName)) {
    // Check if we have visible nutrition facts even without brand
    if (productInfo?.visibleNutrition && 
        (productInfo.visibleNutrition.calories || productInfo.visibleNutrition.protein || 
         productInfo.visibleNutrition.carbs || productInfo.visibleNutrition.fat)) {
      return {
        calories: productInfo.visibleNutrition.calories,
        protein: productInfo.visibleNutrition.protein,
        carbs: productInfo.visibleNutrition.carbs,
        fat: productInfo.visibleNutrition.fat,
        sugar: productInfo.visibleNutrition.sugar,
      };
    }
    return null;
  }
  
  // Step 2: If visible nutrition facts are available, use them (most accurate)
  if (productInfo.visibleNutrition && 
      (productInfo.visibleNutrition.calories || productInfo.visibleNutrition.protein || 
       productInfo.visibleNutrition.carbs || productInfo.visibleNutrition.fat)) {
    // Still try to get full data from API, but use visible facts as base
    let apiNutrition: ProductNutrition | null = null;
    
    if (productInfo.brand && productInfo.productName) {
      apiNutrition = await searchOpenFoodFacts(productInfo.brand, productInfo.productName);
    }
    
    if (!apiNutrition && productInfo.brand) {
      apiNutrition = await searchOpenFoodFacts(productInfo.brand, '');
    }
    
    // Merge: prefer visible facts (most accurate), fill in missing from API
    return {
      calories: productInfo.visibleNutrition.calories || apiNutrition?.calories,
      protein: productInfo.visibleNutrition.protein || apiNutrition?.protein,
      carbs: productInfo.visibleNutrition.carbs || apiNutrition?.carbs,
      fat: productInfo.visibleNutrition.fat || apiNutrition?.fat,
      sugar: productInfo.visibleNutrition.sugar || apiNutrition?.sugar,
      saturatedFat: apiNutrition?.saturatedFat,
      fiber: apiNutrition?.fiber,
      sodium: apiNutrition?.sodium,
      ingredients: apiNutrition?.ingredients,
      allergens: apiNutrition?.allergens,
    };
  }
  
  // Step 3: Search product database if no visible nutrition facts
  if (productInfo.brand && productInfo.productName) {
    const nutrition = await searchOpenFoodFacts(productInfo.brand, productInfo.productName);
    if (nutrition) {
      return nutrition;
    }
  }
  
  // Try with just brand if product name didn't work
  if (productInfo.brand) {
    const nutrition = await searchOpenFoodFacts(productInfo.brand, '');
    if (nutrition) {
      return nutrition;
    }
  }
  
  return null;
}
