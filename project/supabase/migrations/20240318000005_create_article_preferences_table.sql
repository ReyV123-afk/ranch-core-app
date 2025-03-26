-- Create article_preferences table
CREATE TABLE IF NOT EXISTS article_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  preference_type TEXT NOT NULL CHECK (preference_type IN ('not_interested', 'bookmarked')),
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, article_id, preference_type)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_article_preferences_user_id ON article_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_article_preferences_article_id ON article_preferences(article_id);
CREATE INDEX IF NOT EXISTS idx_article_preferences_category ON article_preferences(category);

-- Grant access to authenticated users
GRANT SELECT, INSERT, DELETE ON article_preferences TO authenticated;

-- Create function to mark article as not interested
CREATE OR REPLACE FUNCTION mark_article_not_interested(
  p_user_id UUID,
  p_article_id UUID,
  p_category TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO article_preferences (user_id, article_id, preference_type, category)
  VALUES (p_user_id, p_article_id, 'not_interested', p_category)
  ON CONFLICT (user_id, article_id, preference_type)
  DO UPDATE SET created_at = NOW();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION mark_article_not_interested(UUID, UUID, TEXT) TO authenticated; 