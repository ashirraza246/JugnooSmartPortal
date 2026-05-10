-- Create user_credentials table for storing passwords
CREATE TABLE IF NOT EXISTS user_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_credentials ENABLE ROW LEVEL SECURITY;

-- Create policy - only service role can access
CREATE POLICY "Service role can do everything" ON user_credentials
  FOR ALL USING (true) WITH CHECK (true);

-- Insert admin credentials (password: jugnoo123)
-- First get the admin user's ID
INSERT INTO user_credentials (user_id, password_hash)
SELECT id, 'jugnoo123'
FROM users
WHERE email = 'admin@jugnoo.pk' AND role = 'admin'
ON CONFLICT DO NOTHING;

-- Also insert credentials for any existing users that don't have credentials yet
INSERT INTO user_credentials (user_id, password_hash)
SELECT u.id, 'jugnoo123'
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_credentials uc WHERE uc.user_id = u.id
);
