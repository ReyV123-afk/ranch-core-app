-- Create email_settings table
CREATE TABLE IF NOT EXISTS email_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_frequency TEXT NOT NULL CHECK (email_frequency IN ('daily', 'weekly', 'monthly', 'never')),
  categories TEXT[] NOT NULL DEFAULT '{}',
  keywords TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create email_logs table for tracking email delivery
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL CHECK (email_type IN ('newsletter', 'welcome', 'subscription')),
  subject TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'bounced')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_email_settings_user_id ON email_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at);

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON email_settings TO authenticated;
GRANT SELECT ON email_logs TO authenticated;

-- Create function to update email settings
CREATE OR REPLACE FUNCTION update_email_settings(
  p_user_id UUID,
  p_email_frequency TEXT,
  p_categories TEXT[],
  p_keywords TEXT[],
  p_is_active BOOLEAN
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_settings_id UUID;
BEGIN
  INSERT INTO email_settings (
    user_id,
    email_frequency,
    categories,
    keywords,
    is_active,
    updated_at
  )
  VALUES (
    p_user_id,
    p_email_frequency,
    p_categories,
    p_keywords,
    p_is_active,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    email_frequency = EXCLUDED.email_frequency,
    categories = EXCLUDED.categories,
    keywords = EXCLUDED.keywords,
    is_active = EXCLUDED.is_active,
    updated_at = NOW()
  RETURNING id INTO v_settings_id;

  RETURN v_settings_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_email_settings(UUID, TEXT, TEXT[], TEXT[], BOOLEAN) TO authenticated;

-- Create function to log email delivery
CREATE OR REPLACE FUNCTION log_email_delivery(
  p_user_id UUID,
  p_email_type TEXT,
  p_subject TEXT,
  p_status TEXT,
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO email_logs (
    user_id,
    email_type,
    subject,
    status,
    error_message
  )
  VALUES (
    p_user_id,
    p_email_type,
    p_subject,
    p_status,
    p_error_message
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION log_email_delivery(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated; 