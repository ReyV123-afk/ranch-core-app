-- Create premium_subscriptions table
CREATE TABLE IF NOT EXISTS premium_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired')),
  plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create newsletters table
CREATE TABLE IF NOT EXISTS newsletters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  schedule TEXT NOT NULL CHECK (schedule IN ('daily', 'weekly', 'monthly')),
  categories TEXT[] NOT NULL,
  keywords TEXT[],
  subscriber_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  newsletter_id UUID REFERENCES newsletters(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(newsletter_id, email)
);

-- Create newsletter_issues table
CREATE TABLE IF NOT EXISTS newsletter_issues (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  newsletter_id UUID REFERENCES newsletters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_user_id ON premium_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_newsletters_user_id ON newsletters(user_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_newsletter_id ON newsletter_subscribers(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_issues_newsletter_id ON newsletter_issues(newsletter_id);

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON premium_subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON newsletters TO authenticated;
GRANT SELECT, INSERT, UPDATE ON newsletter_subscribers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON newsletter_issues TO authenticated;

-- Create function to check premium status
CREATE OR REPLACE FUNCTION is_premium_user(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM premium_subscriptions
    WHERE user_id = p_user_id
    AND status = 'active'
    AND end_date > NOW()
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_premium_user(UUID) TO authenticated;

-- Create function to create newsletter
CREATE OR REPLACE FUNCTION create_newsletter(
  p_user_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_schedule TEXT,
  p_categories TEXT[],
  p_keywords TEXT[]
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_newsletter_id UUID;
BEGIN
  -- Check if user is premium
  IF NOT is_premium_user(p_user_id) THEN
    RAISE EXCEPTION 'User must have an active premium subscription to create newsletters';
  END IF;

  -- Create newsletter
  INSERT INTO newsletters (
    user_id,
    title,
    description,
    schedule,
    categories,
    keywords
  )
  VALUES (
    p_user_id,
    p_title,
    p_description,
    p_schedule,
    p_categories,
    p_keywords
  )
  RETURNING id INTO v_newsletter_id;

  RETURN v_newsletter_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_newsletter(UUID, TEXT, TEXT, TEXT, TEXT[], TEXT[]) TO authenticated; 