# NutriScan AI - Database Schema Diagram

## Entity Relationship Overview

```
┌─────────────────┐
│   auth.users    │
└────────┬────────┘
         │
         ├─────────────────────────────────────────────────────────────┐
         │                                                             │
         ▼                                                             ▼
┌──────────────────┐                                        ┌─────────────────────┐
│  user_profiles   │                                        │  menu_scans         │
├──────────────────┤                                        ├─────────────────────┤
│ id (PK)          │                                        │ id (PK)             │
│ user_id (FK,UK)  │                                        │ user_id (FK)        │
│ first_name       │                                        │ restaurant_name     │
│ last_name        │                                        │ menu_image_url      │
│ email            │                                        │ scanned_at          │
│ dietary_restrict │                                        └──────────┬──────────┘
│ allergens        │                                                   │
└──────────────────┘                                                   │
                                                                       │
         ┌────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────┐
│  food_items      │
├──────────────────┤
│ id (PK)          │
│ menu_scan_id(FK) │
│ food_name        │
│ is_vegan         │
│ health_rating    │
└────────┬─────────┘
         │
         ├─────────────────────────────────────────────────────────────┐
         │                                                             │
         ▼                                                             │
┌──────────────────┐                                                  │
│ nutrition_data   │                                                  │
├──────────────────┤                                                  │
│ id (PK)          │                                                  │
│ food_item_id(FK) │                                                  │
│ calories         │                                                  │
│ protein          │                                                  │
│ carbs            │                                                  │
│ fat              │                                                  │
└──────────────────┘                                                  │
                                                                      │
         ┌───────────────────────────────────────────────────────────┘
         │
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    NEW TABLES (To Be Created)                       │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│ user_nutritional_goals│
├──────────────────────┤
│ id (PK)              │
│ user_id (FK, UK)     │
│ daily_calories       │
│ daily_protein_g      │
│ daily_carbs_g        │
│ daily_fat_g          │
│ activity_level       │
│ fitness_goal         │
└──────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│   logged_meals       │         │  custom_food_items   │
├──────────────────────┤         ├──────────────────────┤
│ id (PK)              │         │ id (PK)              │
│ user_id (FK)         │         │ user_id (FK)         │
│ food_item_id (FK)    │─────────│ name                 │
│ meal_name            │         │ calories             │
│ calories             │         │ protein_g            │
│ protein_g            │         │ carbs_g              │
│ carbs_g              │         │ fat_g                │
│ fat_g                │         └──────────────────────┘
│ meal_date            │
│ meal_time            │
│ portion_multiplier   │
└──────────────────────┘

┌──────────────────────┐
│  daily_summaries     │
├──────────────────────┤
│ id (PK)              │
│ user_id (FK)         │
│ summary_date (UK)    │
│ total_calories       │
│ total_protein_g      │
│ total_carbs_g        │
│ total_fat_g          │
│ goal_achieved        │
└──────────────────────┘

┌──────────────────────┐
│    meal_plans        │
├──────────────────────┤
│ id (PK)              │
│ user_id (FK)         │
│ plan_name            │
│ start_date           │
│ end_date             │
│ is_active            │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  meal_plan_items     │
├──────────────────────┤
│ id (PK)              │
│ meal_plan_id (FK)    │
│ food_item_id (FK)    │
│ custom_food_item_id  │
│ planned_date         │
│ is_completed         │
└──────────────────────┘

┌──────────────────────┐
│      recipes         │
├──────────────────────┤
│ id (PK)              │
│ user_id (FK)         │
│ name                 │
│ servings             │
│ ingredients (JSONB)  │
│ instructions         │
│ total_calories       │
└──────────────────────┘

┌──────────────────────┐
│   shopping_lists     │
├──────────────────────┤
│ id (PK)              │
│ user_id (FK)         │
│ meal_plan_id (FK)    │
│ items (JSONB)        │
└──────────────────────┘

┌──────────────────────┐
│ user_weight_tracking │
├──────────────────────┤
│ id (PK)              │
│ user_id (FK)         │
│ weight_kg            │
│ measurement_date (UK)│
└──────────────────────┘

┌──────────────────────┐
│ favorite_restaurants │
├──────────────────────┤
│ id (PK)              │
│ user_id (FK)         │
│ restaurant_name (UK) │
│ visit_count          │
└──────────────────────┘

┌──────────────────────┐
│   user_streaks       │
├──────────────────────┤
│ id (PK)              │
│ user_id (FK, UK)     │
│ current_streak_days  │
│ longest_streak_days  │
│ last_logged_date     │
└──────────────────────┘
```

## Key Relationships

1. **User → Profile**: One-to-One (user_profiles.user_id UNIQUE)
2. **User → Menu Scans**: One-to-Many
3. **Menu Scan → Food Items**: One-to-Many
4. **Food Item → Nutrition Data**: One-to-One (nutrition_data.food_item_id UNIQUE)
5. **User → Logged Meals**: One-to-Many
6. **User → Meal Plans**: One-to-Many
7. **Meal Plan → Meal Plan Items**: One-to-Many
8. **User → Daily Summaries**: One-to-Many (one per day per user)
9. **User → Custom Food Items**: One-to-Many
10. **User → Recipes**: One-to-Many
11. **User → Weight Tracking**: One-to-Many (one per date per user)
12. **User → Favorite Restaurants**: One-to-Many
13. **User → Streaks**: One-to-One (user_streaks.user_id UNIQUE)

## Data Flow Examples

### Meal Logging Flow
```
User scans menu
  → menu_scans (created)
  → food_items (created)
  → nutrition_data (created)
  → User logs meal
  → logged_meals (created)
  → daily_summaries (updated via trigger/function)
```

### Meal Planning Flow
```
User creates meal plan
  → meal_plans (created)
  → User adds items
  → meal_plan_items (created)
  → User generates shopping list
  → shopping_lists (created)
  → User completes meal
  → meal_plan_items.is_completed = true
  → logged_meals (created)
```
