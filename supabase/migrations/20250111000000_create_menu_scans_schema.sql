-- Create/Update schema for storing scanned menus and their nutritional data
-- This migration updates existing tables to match the application's data structure

-- Drop existing tables if they need to be recreated (commented out to preserve data)
-- DROP TABLE IF EXISTS nutrition_data CASCADE;
-- DROP TABLE IF EXISTS food_items CASCADE;
-- DROP TABLE IF EXISTS menu_scans CASCADE;
-- DROP TABLE IF EXISTS nutrition_analyses CASCADE;

-- Menu Scans table: Stores each menu scan session
CREATE TABLE IF NOT EXISTS public.menu_scans (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NULL,
  restaurant_name TEXT NULL,
  menu_image_url TEXT NULL, -- Store in Supabase Storage or external URL
  menu_image_base64 TEXT NULL, -- Or store base64 (alternative storage)
  menu_content TEXT NULL, -- Optional: store menu text if extracted
  food_options TEXT[] NULL, -- Array of food item names (legacy/quick reference)
  scanned_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  CONSTRAINT menu_scans_pkey PRIMARY KEY (id),
  CONSTRAINT menu_scans_user_id_fkey FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Food Items table: Stores individual food items found in each menu scan
CREATE TABLE IF NOT EXISTS public.food_items (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  menu_scan_id UUID NULL,
  food_name TEXT NOT NULL, -- Primary name field (matching current schema)
  name TEXT NULL, -- Alternative name field (for consistency with app code)
  is_vegan BOOLEAN NULL DEFAULT FALSE,
  restaurant_name TEXT NULL,
  nutrition_facts JSONB NULL, -- Store structured nutrition data as JSON
  allergens TEXT[] NULL,
  dietary_restrictions TEXT[] NULL, -- Additional dietary info
  healthiness_rating INTEGER NULL CHECK (healthiness_rating >= 1 AND healthiness_rating <= 10),
  health_rating INTEGER NULL CHECK (health_rating >= 1 AND health_rating <= 10), -- Alternative name
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  CONSTRAINT food_items_pkey PRIMARY KEY (id),
  CONSTRAINT food_items_menu_scan_id_fkey FOREIGN KEY (menu_scan_id) 
    REFERENCES public.menu_scans(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Nutrition Data table: Stores detailed nutritional information for each food item
-- This provides structured access to nutrition data (alternative/complement to JSONB in food_items)
CREATE TABLE IF NOT EXISTS public.nutrition_data (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  food_item_id UUID NULL,
  -- Core macros
  calories TEXT NULL,
  protein TEXT NOT NULL,
  carbs TEXT NOT NULL,
  fat TEXT NOT NULL,
  -- Optional macros
  saturated_fat TEXT NULL,
  trans_fat TEXT NULL,
  cholesterol TEXT NULL,
  sodium TEXT NULL,
  sugar TEXT NULL,
  fiber TEXT NULL,
  -- Additional info
  ingredients TEXT NULL,
  health_rating INTEGER NULL CHECK (health_rating >= 1 AND health_rating <= 10),
  is_vegan BOOLEAN NULL,
  allergens TEXT[] NULL, -- Array of allergen strings
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  CONSTRAINT nutrition_data_pkey PRIMARY KEY (id),
  CONSTRAINT nutrition_data_food_item_id_fkey FOREIGN KEY (food_item_id) 
    REFERENCES public.food_items(id) ON DELETE CASCADE,
  UNIQUE(food_item_id) -- One nutrition record per food item
) TABLESPACE pg_default;

-- Legacy table: Keep for backward compatibility (used by old Supabase function)
CREATE TABLE IF NOT EXISTS public.nutrition_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  menu_txt TEXT NULL,
  analysis TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT nutrition_analyses_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Add missing columns to existing tables (safe to run multiple times)
DO $$ 
BEGIN
  -- Add columns to menu_scans if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'menu_scans' AND column_name = 'restaurant_name') THEN
    ALTER TABLE public.menu_scans ADD COLUMN restaurant_name TEXT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'menu_scans' AND column_name = 'menu_image_url') THEN
    ALTER TABLE public.menu_scans ADD COLUMN menu_image_url TEXT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'menu_scans' AND column_name = 'menu_image_base64') THEN
    ALTER TABLE public.menu_scans ADD COLUMN menu_image_base64 TEXT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'menu_scans' AND column_name = 'scanned_at') THEN
    ALTER TABLE public.menu_scans ADD COLUMN scanned_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'menu_scans' AND column_name = 'updated_at') THEN
    ALTER TABLE public.menu_scans ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW();
  END IF;
  
  -- Add columns to food_items if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'food_items' AND column_name = 'name') THEN
    ALTER TABLE public.food_items ADD COLUMN name TEXT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'food_items' AND column_name = 'is_vegan') THEN
    ALTER TABLE public.food_items ADD COLUMN is_vegan BOOLEAN NULL DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'food_items' AND column_name = 'restaurant_name') THEN
    ALTER TABLE public.food_items ADD COLUMN restaurant_name TEXT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'food_items' AND column_name = 'nutrition_facts') THEN
    ALTER TABLE public.food_items ADD COLUMN nutrition_facts JSONB NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'food_items' AND column_name = 'health_rating') THEN
    ALTER TABLE public.food_items ADD COLUMN health_rating INTEGER NULL CHECK (health_rating >= 1 AND health_rating <= 10);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'food_items' AND column_name = 'updated_at') THEN
    ALTER TABLE public.food_items ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW();
  END IF;
  
  -- Sync name and food_name if needed
  UPDATE public.food_items SET name = food_name WHERE name IS NULL AND food_name IS NOT NULL;
  UPDATE public.food_items SET food_name = name WHERE food_name IS NULL AND name IS NOT NULL;
  
  -- Sync healthiness_rating and health_rating if needed
  UPDATE public.food_items SET health_rating = healthiness_rating WHERE health_rating IS NULL AND healthiness_rating IS NOT NULL;
  UPDATE public.food_items SET healthiness_rating = health_rating WHERE healthiness_rating IS NULL AND health_rating IS NOT NULL;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_menu_scans_user_id ON public.menu_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_menu_scans_scanned_at ON public.menu_scans(scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_menu_scans_created_at ON public.menu_scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_food_items_menu_scan_id ON public.food_items(menu_scan_id);
CREATE INDEX IF NOT EXISTS idx_food_items_name ON public.food_items(food_name);
CREATE INDEX IF NOT EXISTS idx_food_items_created_at ON public.food_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_nutrition_data_food_item_id ON public.nutrition_data(food_item_id);

-- Row Level Security (RLS) policies
ALTER TABLE public.menu_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_data ENABLE ROW LEVEL SECURITY;
-- Note: nutrition_analyses can remain without RLS if it's for legacy/internal use

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own menu scans" ON public.menu_scans;
DROP POLICY IF EXISTS "Users can insert their own menu scans" ON public.menu_scans;
DROP POLICY IF EXISTS "Users can update their own menu scans" ON public.menu_scans;
DROP POLICY IF EXISTS "Users can delete their own menu scans" ON public.menu_scans;
DROP POLICY IF EXISTS "Users can view food items from their menu scans" ON public.food_items;
DROP POLICY IF EXISTS "Users can insert food items for their menu scans" ON public.food_items;
DROP POLICY IF EXISTS "Users can update food items from their menu scans" ON public.food_items;
DROP POLICY IF EXISTS "Users can delete food items from their menu scans" ON public.food_items;
DROP POLICY IF EXISTS "Users can view nutrition data for their food items" ON public.nutrition_data;
DROP POLICY IF EXISTS "Users can insert nutrition data for their food items" ON public.nutrition_data;
DROP POLICY IF EXISTS "Users can update nutrition data for their food items" ON public.nutrition_data;
DROP POLICY IF EXISTS "Users can delete nutrition data for their food items" ON public.nutrition_data;

-- Policy: Users can only see their own menu scans
CREATE POLICY "Users can view their own menu scans"
  ON public.menu_scans FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own menu scans
CREATE POLICY "Users can insert their own menu scans"
  ON public.menu_scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own menu scans
CREATE POLICY "Users can update their own menu scans"
  ON public.menu_scans FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own menu scans
CREATE POLICY "Users can delete their own menu scans"
  ON public.menu_scans FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Users can view food items from their own menu scans
CREATE POLICY "Users can view food items from their menu scans"
  ON public.food_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.menu_scans
      WHERE menu_scans.id = food_items.menu_scan_id
      AND menu_scans.user_id = auth.uid()
    )
  );

-- Policy: Users can insert food items for their menu scans
CREATE POLICY "Users can insert food items for their menu scans"
  ON public.food_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.menu_scans
      WHERE menu_scans.id = food_items.menu_scan_id
      AND menu_scans.user_id = auth.uid()
    )
  );

-- Policy: Users can update food items from their menu scans
CREATE POLICY "Users can update food items from their menu scans"
  ON public.food_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.menu_scans
      WHERE menu_scans.id = food_items.menu_scan_id
      AND menu_scans.user_id = auth.uid()
    )
  );

-- Policy: Users can delete food items from their menu scans
CREATE POLICY "Users can delete food items from their menu scans"
  ON public.food_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.menu_scans
      WHERE menu_scans.id = food_items.menu_scan_id
      AND menu_scans.user_id = auth.uid()
    )
  );

-- Policy: Users can view nutrition data for their food items
CREATE POLICY "Users can view nutrition data for their food items"
  ON public.nutrition_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.food_items
      JOIN public.menu_scans ON menu_scans.id = food_items.menu_scan_id
      WHERE food_items.id = nutrition_data.food_item_id
      AND menu_scans.user_id = auth.uid()
    )
  );

-- Policy: Users can insert nutrition data for their food items
CREATE POLICY "Users can insert nutrition data for their food items"
  ON public.nutrition_data FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.food_items
      JOIN public.menu_scans ON menu_scans.id = food_items.menu_scan_id
      WHERE food_items.id = nutrition_data.food_item_id
      AND menu_scans.user_id = auth.uid()
    )
  );

-- Policy: Users can update nutrition data for their food items
CREATE POLICY "Users can update nutrition data for their food items"
  ON public.nutrition_data FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.food_items
      JOIN public.menu_scans ON menu_scans.id = food_items.menu_scan_id
      WHERE food_items.id = nutrition_data.food_item_id
      AND menu_scans.user_id = auth.uid()
    )
  );

-- Policy: Users can delete nutrition data for their food items
CREATE POLICY "Users can delete nutrition data for their food items"
  ON public.nutrition_data FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.food_items
      JOIN public.menu_scans ON menu_scans.id = food_items.menu_scan_id
      WHERE food_items.id = nutrition_data.food_item_id
      AND menu_scans.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_menu_scans_updated_at ON public.menu_scans;
DROP TRIGGER IF EXISTS update_food_items_updated_at ON public.food_items;
DROP TRIGGER IF EXISTS update_nutrition_data_updated_at ON public.nutrition_data;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_menu_scans_updated_at
  BEFORE UPDATE ON public.menu_scans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_food_items_updated_at
  BEFORE UPDATE ON public.food_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutrition_data_updated_at
  BEFORE UPDATE ON public.nutrition_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
