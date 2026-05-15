-- Notifications table for admin panel
-- Stores in-app notifications for new orders, status changes, etc.
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  category TEXT DEFAULT 'info',
  created_at TIMESTAMPTZ DEFAULT now(),
  reference_id TEXT,
  reference_type TEXT
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read notifications (for admin panel)
CREATE POLICY "Anyone can read notifications" ON notifications
  FOR SELECT USING (true);

-- Allow anyone to insert notifications (from API routes)
CREATE POLICY "Anyone can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Allow anyone to update notifications (mark as read)
CREATE POLICY "Anyone can update notifications" ON notifications
  FOR UPDATE USING (true);

-- Allow anyone to delete notifications
CREATE POLICY "Anyone can delete notifications" ON notifications
  FOR DELETE USING (true);

-- Add index for quick lookup of unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications (is_read, created_at DESC) WHERE is_read = false;
