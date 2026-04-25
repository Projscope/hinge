-- Template system: add template_type, tasks (jsonb), and day_intention to daily_goals
-- Existing rows default to 'focus' and continue using task1_text / task2_text columns.
-- Non-focus templates store their structured data in the tasks jsonb column.

ALTER TABLE daily_goals
  ADD COLUMN IF NOT EXISTS template_type text NOT NULL DEFAULT 'focus',
  ADD COLUMN IF NOT EXISTS tasks        jsonb,
  ADD COLUMN IF NOT EXISTS day_intention text;

-- Index for future per-template analytics queries
CREATE INDEX IF NOT EXISTS daily_goals_template_type_idx
  ON daily_goals (user_id, template_type);
