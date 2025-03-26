-- Create article_views table
CREATE TABLE IF NOT EXISTS article_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_article_views_user_id ON article_views(user_id);
CREATE INDEX IF NOT EXISTS idx_article_views_article_id ON article_views(article_id);
CREATE INDEX IF NOT EXISTS idx_article_views_viewed_at ON article_views(viewed_at);

-- Grant access to authenticated users
GRANT SELECT, INSERT ON article_views TO authenticated;

-- Create function to track article views
CREATE OR REPLACE FUNCTION track_article_view(
  p_user_id UUID,
  p_article_id UUID,
  p_category TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO article_views (user_id, article_id, category)
  VALUES (p_user_id, p_article_id, p_category)
  ON CONFLICT (user_id, article_id)
  DO UPDATE SET viewed_at = NOW();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION track_article_view(UUID, UUID, TEXT) TO authenticated; 