-- Create user_interests table
CREATE TABLE IF NOT EXISTS user_interests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  interests JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_interests_user_id ON user_interests(user_id);

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON user_interests TO authenticated;

-- Create function to update user interests
CREATE OR REPLACE FUNCTION update_user_interests(
  p_user_id UUID,
  p_interests JSONB
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_interests (user_id, interests, updated_at)
  VALUES (p_user_id, p_interests, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    interests = p_interests,
    updated_at = NOW();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_user_interests(UUID, JSONB) TO authenticated; 