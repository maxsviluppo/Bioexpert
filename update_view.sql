-- Run this SQL command in your Supabase/Neon SQL Editor or via psql
-- This fixes the 'active_care_programs' view to correctly link care programs to plants using UUIDs.

CREATE OR REPLACE VIEW active_care_programs AS
SELECT 
  p.id,
  p.plant_id,
  p.username,
  p.status,
  p.current_phase,
  p.total_phases,
  p.health_score_initial,
  p.health_score_current,
  (p.health_score_current - p.health_score_initial) as health_improvement,
  ROUND((p.current_phase::numeric / p.total_phases::numeric) * 100) as completion_percentage,
  up.plant_name,
  up.scientific_name,
  up.image_url,
  (SELECT COUNT(*) FROM care_checkpoints WHERE program_id = p.id AND is_completed = TRUE) as completed_checkpoints,
  (SELECT COUNT(*) FROM care_checkpoints WHERE program_id = p.id) as total_checkpoints,
  p.start_date,
  p.estimated_completion_date
FROM plant_care_programs p
JOIN user_plants up ON p.plant_id::text = up.id::text
WHERE p.status = 'active';
