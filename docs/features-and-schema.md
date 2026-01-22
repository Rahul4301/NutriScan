# NutriScan AI - Features & Database Schema Summary

## Overview
NutriScan AI is a web-based tool that scans restaurant menus and provides instant nutritional information. This document outlines all features (existing and proposed) along with the complete database schema.

---

## 1. CURRENT FEATURES (Already Implemented)

### 1.1 Core Menu Scanning
- **Menu Image Upload**: Users can upload menu photos
- **AI-Powered Food Extraction**: Uses Google Gemini 2.5 Flash to extract food items from menu images
- **Restaurant Name Detection**: Automatically identifies restaurant name from menu
- **Direct Food Photo Analysis**: Fallback to analyze actual food photos when menu extraction fails

### 1.2 Nutritional Analysis
- **Macronutrient Estimation**: Calories, protein, carbs, fat
- **Extended Nutrition Data**: Saturated fat, trans fat, cholesterol, sodium, sugar, fiber
- **Health Rating**: 1-10 scale rating for each food item
- **Vegan Detection**: Automatic identification of vegan-friendly items
- **Allergen Detection**: Identifies potential allergens in food items
- **Ingredients List**: Extracts or infers ingredient lists

### 1.3 User Personalization (Basic)
- **User Profiles**: Basic profile information (name, email, phone)
- **Dietary Restrictions**: Array-based storage (e.g., vegan, vegetarian, gluten-free, keto)
- **Allergen Tracking**: Array-based storage of allergens to avoid
- **Dietary Violation Detection**: Real-time checking against user restrictions/allergens

### 1.4 Authentication & Security
- **Supabase Authentication**: Secure user authentication
- **Row Level Security (RLS)**: All tables protected with user-specific access policies
- **Data Privacy**: Users can only access their own scans and data

---

## 2. PROPOSED FEATURES (To Implement)

### 2.1 Enhanced User Personalization
- **Nutritional Goals**: Daily calorie, protein, carb, fat targets
- **Activity Level**: Sedentary, lightly active, moderately active, very active
- **Fitness Goals**: Weight loss, muscle gain, maintenance, general health
- **Meal Preferences**: Preferred meal times, portion sizes
- **Favorite Restaurants**: Quick access to frequently visited restaurants
- **Custom Food Items**: Save custom food items with nutritional data

### 2.2 Meal Logging & Tracking
- **Daily Meal Log**: Log breakfast, lunch, dinner, snacks
- **Meal Timestamps**: Track when meals were consumed
- **Portion Size Adjustment**: Adjust nutritional values based on portion size
- **Quick Add**: Quick-add previously scanned items
- **Meal Notes**: Add notes/observations to logged meals

### 2.3 Progress Tracking
- **Daily Summary**: Total calories and macros consumed per day
- **Weekly Summary**: Weekly averages and trends
- **Monthly Summary**: Monthly progress reports
- **Goal Progress**: Visual progress indicators toward daily/weekly goals
- **Streak Tracking**: Track consecutive days of logging
- **Weight Tracking**: Optional weight entry and tracking (if user wants)

### 2.4 Meal Prep Planning
- **Weekly Meal Plans**: Plan meals for the week ahead
- **Recipe Integration**: Save and plan custom recipes
- **Shopping Lists**: Generate shopping lists from meal plans
- **Prep Time Estimates**: Estimated prep time for meal plans
- **Nutritional Preview**: Preview total nutrition for planned meals

### 2.5 Analytics & Insights
- **Nutrition Charts**: Visual charts for macro trends over time
- **Restaurant Analytics**: Most visited restaurants, average calories per restaurant
- **Food Pattern Analysis**: Identify eating patterns (e.g., high-carb days)
- **Goal Achievement Rate**: Percentage of days meeting goals
- **Health Score**: Overall health score based on food choices

### 2.6 Social & Sharing (Future)
- **Share Meals**: Share meal choices with friends
- **Community Recipes**: Browse community-submitted recipes
- **Challenges**: Participate in nutrition challenges

---

## 3. DATABASE SCHEMA

### 3.1 Existing Tables

#### `menu_scans`
Stores each menu scan session.
```sql
- id: UUID (PK)
- user_id: UUID (FK → auth.users)
- restaurant_name: TEXT
- menu_image_url: TEXT
- menu_image_base64: TEXT
- menu_content: TEXT
- food_options: TEXT[]
- scanned_at: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `food_items`
Stores individual food items from menu scans.
```sql
- id: UUID (PK)
- menu_scan_id: UUID (FK → menu_scans)
- food_name: TEXT
- name: TEXT (alternative)
- is_vegan: BOOLEAN
- restaurant_name: TEXT
- nutrition_facts: JSONB
- allergens: TEXT[]
- dietary_restrictions: TEXT[]
- healthiness_rating: INTEGER (1-10)
- health_rating: INTEGER (1-10)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `nutrition_data`
Stores detailed nutritional information.
```sql
- id: UUID (PK)
- food_item_id: UUID (FK → food_items, UNIQUE)
- calories: TEXT
- protein: TEXT
- carbs: TEXT
- fat: TEXT
- saturated_fat: TEXT
- trans_fat: TEXT
- cholesterol: TEXT
- sodium: TEXT
- sugar: TEXT
- fiber: TEXT
- ingredients: TEXT
- health_rating: INTEGER (1-10)
- is_vegan: BOOLEAN
- allergens: TEXT[]
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `user_profiles`
Stores user profile information.
```sql
- id: UUID (PK)
- user_id: UUID (FK → auth.users, UNIQUE)
- first_name: TEXT
- last_name: TEXT
- email: TEXT
- phone: TEXT
- dietary_restrictions: TEXT[]
- allergens: TEXT[]
- dietary_preferences: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

---

### 3.2 New Tables (To Be Created)

#### `user_nutritional_goals`
Stores user's daily nutritional targets.
```sql
- id: UUID (PK)
- user_id: UUID (FK → auth.users, UNIQUE)
- daily_calories: INTEGER
- daily_protein_g: INTEGER
- daily_carbs_g: INTEGER
- daily_fat_g: INTEGER
- activity_level: TEXT (sedentary, lightly_active, moderately_active, very_active)
- fitness_goal: TEXT (weight_loss, muscle_gain, maintenance, general_health)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `logged_meals`
Stores user's logged meals throughout the day.
```sql
- id: UUID (PK)
- user_id: UUID (FK → auth.users)
- food_item_id: UUID (FK → food_items, nullable - for custom items)
- meal_name: TEXT (e.g., "Breakfast", "Lunch", "Dinner", "Snack")
- food_name: TEXT (name of the food item)
- restaurant_name: TEXT (nullable)
- calories: INTEGER
- protein_g: DECIMAL(10,2)
- carbs_g: DECIMAL(10,2)
- fat_g: DECIMAL(10,2)
- portion_size: TEXT (e.g., "1 serving", "2 cups")
- portion_multiplier: DECIMAL(5,2) DEFAULT 1.0
- meal_date: DATE
- meal_time: TIME
- notes: TEXT
- is_custom: BOOLEAN DEFAULT FALSE
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `custom_food_items`
Stores user-created custom food items.
```sql
- id: UUID (PK)
- user_id: UUID (FK → auth.users)
- name: TEXT
- calories: INTEGER
- protein_g: DECIMAL(10,2)
- carbs_g: DECIMAL(10,2)
- fat_g: DECIMAL(10,2)
- saturated_fat_g: DECIMAL(10,2)
- fiber_g: DECIMAL(10,2)
- sugar_g: DECIMAL(10,2)
- sodium_mg: DECIMAL(10,2)
- ingredients: TEXT
- is_vegan: BOOLEAN
- allergens: TEXT[]
- serving_size: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `daily_summaries`
Stores daily nutritional summaries for quick access.
```sql
- id: UUID (PK)
- user_id: UUID (FK → auth.users)
- summary_date: DATE
- total_calories: INTEGER
- total_protein_g: DECIMAL(10,2)
- total_carbs_g: DECIMAL(10,2)
- total_fat_g: DECIMAL(10,2)
- meal_count: INTEGER
- goal_achieved: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- UNIQUE(user_id, summary_date)
```

#### `meal_plans`
Stores weekly meal plans.
```sql
- id: UUID (PK)
- user_id: UUID (FK → auth.users)
- plan_name: TEXT
- start_date: DATE
- end_date: DATE
- is_active: BOOLEAN DEFAULT TRUE
- notes: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `meal_plan_items`
Stores individual items in a meal plan.
```sql
- id: UUID (PK)
- meal_plan_id: UUID (FK → meal_plans)
- food_item_id: UUID (FK → food_items, nullable)
- custom_food_item_id: UUID (FK → custom_food_items, nullable)
- meal_name: TEXT (Breakfast, Lunch, Dinner, Snack)
- planned_date: DATE
- planned_time: TIME
- portion_size: TEXT
- portion_multiplier: DECIMAL(5,2) DEFAULT 1.0
- is_completed: BOOLEAN DEFAULT FALSE
- completed_at: TIMESTAMP (nullable)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `recipes`
Stores user-created recipes.
```sql
- id: UUID (PK)
- user_id: UUID (FK → auth.users)
- name: TEXT
- description: TEXT
- servings: INTEGER
- prep_time_minutes: INTEGER
- cook_time_minutes: INTEGER
- ingredients: JSONB (array of {name, amount, unit})
- instructions: TEXT[]
- total_calories: INTEGER
- total_protein_g: DECIMAL(10,2)
- total_carbs_g: DECIMAL(10,2)
- total_fat_g: DECIMAL(10,2)
- is_vegan: BOOLEAN
- allergens: TEXT[]
- image_url: TEXT (nullable)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `shopping_lists`
Stores shopping lists generated from meal plans.
```sql
- id: UUID (PK)
- user_id: UUID (FK → auth.users)
- meal_plan_id: UUID (FK → meal_plans, nullable)
- list_name: TEXT
- items: JSONB (array of {name, quantity, unit, category, is_checked})
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `user_weight_tracking`
Stores optional weight tracking data.
```sql
- id: UUID (PK)
- user_id: UUID (FK → auth.users)
- weight_kg: DECIMAL(5,2)
- weight_lb: DECIMAL(5,2)
- measurement_date: DATE
- notes: TEXT
- created_at: TIMESTAMP
- UNIQUE(user_id, measurement_date)
```

#### `favorite_restaurants`
Stores user's favorite restaurants for quick access.
```sql
- id: UUID (PK)
- user_id: UUID (FK → auth.users)
- restaurant_name: TEXT
- last_visited: DATE
- visit_count: INTEGER DEFAULT 1
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- UNIQUE(user_id, restaurant_name)
```

#### `user_streaks`
Stores user's logging streaks.
```sql
- id: UUID (PK)
- user_id: UUID (FK → auth.users)
- current_streak_days: INTEGER DEFAULT 0
- longest_streak_days: INTEGER DEFAULT 0
- last_logged_date: DATE
- updated_at: TIMESTAMP
- UNIQUE(user_id)
```

---

## 4. INDEXES & PERFORMANCE

### Existing Indexes
- `idx_menu_scans_user_id`
- `idx_menu_scans_scanned_at`
- `idx_food_items_menu_scan_id`
- `idx_user_profiles_user_id`

### New Indexes (To Be Created)
```sql
-- Daily summaries
CREATE INDEX idx_daily_summaries_user_date ON daily_summaries(user_id, summary_date DESC);

-- Logged meals
CREATE INDEX idx_logged_meals_user_date ON logged_meals(user_id, meal_date DESC);
CREATE INDEX idx_logged_meals_date ON logged_meals(meal_date DESC);

-- Meal plans
CREATE INDEX idx_meal_plans_user_active ON meal_plans(user_id, is_active);
CREATE INDEX idx_meal_plan_items_plan_date ON meal_plan_items(meal_plan_id, planned_date);

-- Custom food items
CREATE INDEX idx_custom_food_items_user ON custom_food_items(user_id);

-- Recipes
CREATE INDEX idx_recipes_user ON recipes(user_id);

-- Weight tracking
CREATE INDEX idx_weight_tracking_user_date ON user_weight_tracking(user_id, measurement_date DESC);
```

---

## 5. ROW LEVEL SECURITY (RLS) POLICIES

All new tables will follow the same RLS pattern:
- Users can only SELECT/INSERT/UPDATE/DELETE their own records
- Policies check `auth.uid() = user_id` or join through user_id relationships

---

## 6. IMPLEMENTATION PRIORITY

### Phase 1: Core Tracking (High Priority)
1. Enhanced user profiles with nutritional goals
2. Meal logging system (`logged_meals`, `daily_summaries`)
3. Progress tracking dashboard
4. Daily summary views

### Phase 2: Meal Planning (Medium Priority)
1. Meal plan creation (`meal_plans`, `meal_plan_items`)
2. Recipe management (`recipes`)
3. Shopping list generation (`shopping_lists`)

### Phase 3: Advanced Features (Lower Priority)
1. Custom food items (`custom_food_items`)
2. Weight tracking (`user_weight_tracking`)
3. Favorite restaurants (`favorite_restaurants`)
4. Streak tracking (`user_streaks`)
5. Analytics and insights dashboard

---

## 7. DATA FLOW EXAMPLES

### Logging a Meal
1. User scans menu → `menu_scans` created
2. Food items extracted → `food_items` created
3. User selects food item → `nutrition_data` fetched/generated
4. User logs meal → `logged_meals` created
5. Daily summary updated → `daily_summaries` updated (via trigger or scheduled job)

### Creating a Meal Plan
1. User creates meal plan → `meal_plans` created
2. User adds items to plan → `meal_plan_items` created
3. User generates shopping list → `shopping_lists` created from plan items
4. User completes meal → `meal_plan_items.is_completed` = true, `logged_meals` created

### Daily Summary Generation
1. Trigger on `logged_meals` INSERT/UPDATE
2. Calculate totals for the day
3. Upsert into `daily_summaries`
4. Check if goals achieved → update `goal_achieved` flag

---

## 8. NOTES

- All monetary/nutritional values use appropriate data types (INTEGER for calories, DECIMAL for grams)
- Timestamps use `TIMESTAMP WITH TIME ZONE` for timezone awareness
- All user-facing tables have RLS enabled
- Foreign keys use `ON DELETE CASCADE` where appropriate
- `updated_at` columns are auto-updated via triggers
- Consider adding soft deletes (deleted_at) for user data if needed
- Consider adding audit logging for sensitive operations

---

## 9. FUTURE CONSIDERATIONS

- **Export Functionality**: Export meal logs to CSV/PDF
- **Integration**: Integration with fitness trackers (Fitbit, Apple Health)
- **Barcode Scanning**: Scan barcodes for packaged foods
- **Nutrition Database**: Integration with USDA FoodData Central API
- **Meal Suggestions**: AI-powered meal suggestions based on goals
- **Social Features**: Share meals, follow friends, community challenges
