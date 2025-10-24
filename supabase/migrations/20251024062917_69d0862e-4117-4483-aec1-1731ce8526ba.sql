-- Create enum types for Ayurvedic attributes
CREATE TYPE prakriti_type AS ENUM ('vata', 'pitta', 'kapha', 'vata_pitta', 'pitta_kapha', 'vata_kapha', 'tridoshic');
CREATE TYPE dosha_impact AS ENUM ('increases_vata', 'decreases_vata', 'increases_pitta', 'decreases_pitta', 'increases_kapha', 'decreases_kapha', 'neutral');
CREATE TYPE rasa_type AS ENUM ('sweet', 'sour', 'salty', 'pungent', 'bitter', 'astringent');
CREATE TYPE guna_type AS ENUM ('heavy', 'light', 'oily', 'dry', 'hot', 'cold', 'stable', 'mobile', 'soft', 'hard', 'smooth', 'rough', 'dense', 'liquid', 'gross', 'subtle', 'cloudy', 'clear');
CREATE TYPE virya_type AS ENUM ('heating', 'cooling');
CREATE TYPE vipaka_type AS ENUM ('sweet', 'sour', 'pungent');
CREATE TYPE meal_type AS ENUM ('breakfast', 'mid_morning', 'lunch', 'evening', 'dinner');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high');

-- Patients table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age > 0 AND age < 150),
  gender TEXT NOT NULL,
  prakriti prakriti_type NOT NULL,
  health_conditions TEXT[] DEFAULT '{}',
  dietary_habits TEXT,
  digestion_quality TEXT,
  bowel_pattern TEXT,
  water_intake_liters DECIMAL(3,1),
  meal_preferences TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  lifestyle_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Foods table with comprehensive attributes
CREATE TABLE foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  calories DECIMAL(8,2) NOT NULL CHECK (calories >= 0),
  protein_g DECIMAL(6,2) DEFAULT 0 CHECK (protein_g >= 0),
  carbs_g DECIMAL(6,2) DEFAULT 0 CHECK (carbs_g >= 0),
  fat_g DECIMAL(6,2) DEFAULT 0 CHECK (fat_g >= 0),
  fiber_g DECIMAL(6,2) DEFAULT 0 CHECK (fiber_g >= 0),
  vitamins JSONB DEFAULT '{}',
  minerals JSONB DEFAULT '{}',
  rasa rasa_type[] DEFAULT '{}',
  guna guna_type[] DEFAULT '{}',
  virya virya_type,
  vipaka vipaka_type,
  dosha_effects dosha_impact[] DEFAULT '{}',
  serving_size TEXT,
  ayurvedic_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Diet charts table
CREATE TABLE diet_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_calories DECIMAL(8,2),
  dosha_balance JSONB DEFAULT '{"vata": 0, "pitta": 0, "kapha": 0}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meal plans within diet charts
CREATE TABLE meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diet_chart_id UUID NOT NULL REFERENCES diet_charts(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number > 0),
  meal_type meal_type NOT NULL,
  food_items JSONB NOT NULL,
  total_calories DECIMAL(8,2),
  instructions TEXT,
  timing TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Recommendations log
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL,
  content JSONB NOT NULL,
  priority priority_level DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patients
CREATE POLICY "Users can view their own patients"
  ON patients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own patients"
  ON patients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own patients"
  ON patients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own patients"
  ON patients FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for foods (public read, authenticated write)
CREATE POLICY "Anyone can view foods"
  ON foods FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create foods"
  ON foods FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update foods"
  ON foods FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- RLS Policies for diet_charts
CREATE POLICY "Users can view their own diet charts"
  ON diet_charts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own diet charts"
  ON diet_charts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diet charts"
  ON diet_charts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diet charts"
  ON diet_charts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for meal_plans (inherit from diet_charts)
CREATE POLICY "Users can view meal plans for their diet charts"
  ON meal_plans FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM diet_charts
    WHERE diet_charts.id = meal_plans.diet_chart_id
    AND diet_charts.user_id = auth.uid()
  ));

CREATE POLICY "Users can create meal plans for their diet charts"
  ON meal_plans FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM diet_charts
    WHERE diet_charts.id = meal_plans.diet_chart_id
    AND diet_charts.user_id = auth.uid()
  ));

CREATE POLICY "Users can update meal plans for their diet charts"
  ON meal_plans FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM diet_charts
    WHERE diet_charts.id = meal_plans.diet_chart_id
    AND diet_charts.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete meal plans for their diet charts"
  ON meal_plans FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM diet_charts
    WHERE diet_charts.id = meal_plans.diet_chart_id
    AND diet_charts.user_id = auth.uid()
  ));

-- RLS Policies for recommendations
CREATE POLICY "Users can view recommendations for their patients"
  ON recommendations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM patients
    WHERE patients.id = recommendations.patient_id
    AND patients.user_id = auth.uid()
  ));

CREATE POLICY "Users can create recommendations for their patients"
  ON recommendations FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM patients
    WHERE patients.id = recommendations.patient_id
    AND patients.user_id = auth.uid()
  ));

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diet_charts_updated_at
  BEFORE UPDATE ON diet_charts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample foods with Ayurvedic properties
INSERT INTO foods (name, category, calories, protein_g, carbs_g, fat_g, fiber_g, rasa, guna, virya, vipaka, dosha_effects, serving_size, ayurvedic_notes) VALUES
('Basmati Rice', 'Grains', 200, 4.3, 44, 0.4, 0.6, ARRAY['sweet']::rasa_type[], ARRAY['light', 'dry']::guna_type[], 'cooling', 'sweet', ARRAY['decreases_pitta']::dosha_impact[], '1 cup cooked', 'Excellent for pitta dosha, cooling and easy to digest'),
('Moong Dal', 'Legumes', 212, 14.2, 38.7, 0.8, 15.6, ARRAY['sweet']::rasa_type[], ARRAY['light', 'dry']::guna_type[], 'cooling', 'sweet', ARRAY['decreases_pitta', 'decreases_kapha']::dosha_impact[], '1 cup cooked', 'Tridoshic, easily digestible protein source'),
('Ghee', 'Fats', 112, 0, 0, 12.7, 0, ARRAY['sweet']::rasa_type[], ARRAY['oily', 'soft']::guna_type[], 'heating', 'sweet', ARRAY['decreases_vata', 'increases_pitta']::dosha_impact[], '1 tbsp', 'Sacred food in Ayurveda, enhances agni (digestive fire)'),
('Ginger', 'Spices', 80, 1.8, 17.8, 0.8, 2, ARRAY['pungent']::rasa_type[], ARRAY['hot', 'dry']::guna_type[], 'heating', 'sweet', ARRAY['decreases_vata', 'decreases_kapha']::dosha_impact[], '100g', 'Universal medicine, enhances digestion and reduces inflammation'),
('Turmeric', 'Spices', 312, 9.7, 67.1, 3.3, 22.7, ARRAY['bitter', 'pungent']::rasa_type[], ARRAY['hot', 'dry', 'light']::guna_type[], 'heating', 'pungent', ARRAY['decreases_kapha']::dosha_impact[], '100g', 'Powerful anti-inflammatory, blood purifier'),
('Cucumber', 'Vegetables', 16, 0.7, 3.6, 0.1, 0.5, ARRAY['sweet']::rasa_type[], ARRAY['cold', 'light']::guna_type[], 'cooling', 'sweet', ARRAY['decreases_pitta']::dosha_impact[], '1 cup sliced', 'Very cooling, hydrating, reduces heat'),
('Almonds', 'Nuts', 579, 21.2, 21.7, 49.9, 12.5, ARRAY['sweet']::rasa_type[], ARRAY['oily', 'heavy']::guna_type[], 'heating', 'sweet', ARRAY['decreases_vata', 'increases_kapha']::dosha_impact[], '100g', 'Nourishing, strengthening, best soaked overnight'),
('Honey', 'Sweeteners', 304, 0.3, 82.4, 0, 0.2, ARRAY['sweet']::rasa_type[], ARRAY['heavy', 'dry']::guna_type[], 'heating', 'pungent', ARRAY['decreases_kapha']::dosha_impact[], '100g', 'Natural sweetener, never heat above 40°C'),
('Cumin', 'Spices', 375, 17.8, 44.2, 22.3, 10.5, ARRAY['pungent', 'bitter']::rasa_type[], ARRAY['light', 'dry']::guna_type[], 'cooling', 'pungent', ARRAY['decreases_vata', 'decreases_kapha']::dosha_impact[], '100g', 'Digestive, carminative, cooling despite pungent taste'),
('Spinach', 'Vegetables', 23, 2.9, 3.6, 0.4, 2.2, ARRAY['sweet', 'astringent']::rasa_type[], ARRAY['cold', 'light']::guna_type[], 'cooling', 'pungent', ARRAY['decreases_pitta']::dosha_impact[], '1 cup cooked', 'Iron-rich, cooling, slightly astringent');

-- Create index for faster queries
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_diet_charts_user_id ON diet_charts(user_id);
CREATE INDEX idx_diet_charts_patient_id ON diet_charts(patient_id);
CREATE INDEX idx_meal_plans_diet_chart_id ON meal_plans(diet_chart_id);
CREATE INDEX idx_recommendations_patient_id ON recommendations(patient_id);
CREATE INDEX idx_foods_category ON foods(category);