-- Create recommendation_analytics table
CREATE TABLE IF NOT EXISTS recommendation_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('interest_based', 'trending', 'view_history')),
  category TEXT NOT NULL,
  source TEXT NOT NULL,
  was_viewed BOOLEAN DEFAULT false,
  was_bookmarked BOOLEAN DEFAULT false,
  was_marked_not_interested BOOLEAN DEFAULT false,
  view_duration INTEGER, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_recommendation_analytics_user_id ON recommendation_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_analytics_article_id ON recommendation_analytics(article_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_analytics_category ON recommendation_analytics(category);
CREATE INDEX IF NOT EXISTS idx_recommendation_analytics_created_at ON recommendation_analytics(created_at);

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON recommendation_analytics TO authenticated;

-- Create function to track recommendation interaction
CREATE OR REPLACE FUNCTION track_recommendation_interaction(
  p_user_id UUID,
  p_article_id UUID,
  p_recommendation_type TEXT,
  p_category TEXT,
  p_source TEXT,
  p_interaction_type TEXT,
  p_value BOOLEAN
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO recommendation_analytics (
    user_id,
    article_id,
    recommendation_type,
    category,
    source,
    was_viewed,
    was_bookmarked,
    was_marked_not_interested
  )
  VALUES (
    p_user_id,
    p_article_id,
    p_recommendation_type,
    p_category,
    p_source,
    CASE WHEN p_interaction_type = 'view' THEN p_value ELSE false END,
    CASE WHEN p_interaction_type = 'bookmark' THEN p_value ELSE false END,
    CASE WHEN p_interaction_type = 'not_interested' THEN p_value ELSE false END
  )
  ON CONFLICT (user_id, article_id)
  DO UPDATE SET
    was_viewed = CASE WHEN p_interaction_type = 'view' THEN p_value ELSE recommendation_analytics.was_viewed END,
    was_bookmarked = CASE WHEN p_interaction_type = 'bookmark' THEN p_value ELSE recommendation_analytics.was_bookmarked END,
    was_marked_not_interested = CASE WHEN p_interaction_type = 'not_interested' THEN p_value ELSE recommendation_analytics.was_marked_not_interested END,
    updated_at = NOW();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION track_recommendation_interaction(UUID, UUID, TEXT, TEXT, TEXT, TEXT, BOOLEAN) TO authenticated; 