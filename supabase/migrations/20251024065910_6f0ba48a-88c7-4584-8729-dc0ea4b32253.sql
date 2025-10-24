-- Trigger types regeneration by adding a helpful comment
-- This is a no-op migration to trigger Supabase types regeneration
-- All tables (patients, foods, recommendations, diet_charts, meal_plans) are properly configured

-- Verify all tables exist and have proper structure
COMMENT ON TABLE public.patients IS 'Patient records with Ayurvedic constitution and health data';
COMMENT ON TABLE public.foods IS 'Ayurvedic food database with nutritional and dosha information';
COMMENT ON TABLE public.recommendations IS 'AI-generated dietary recommendations for patients';
COMMENT ON TABLE public.diet_charts IS 'Personalized diet chart plans for patients';
COMMENT ON TABLE public.meal_plans IS 'Individual meal entries within diet charts';