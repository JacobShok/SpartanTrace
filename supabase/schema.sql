-- ============================================================================
-- SpartanTrace - Supabase PostgreSQL Database Schema
-- Designed for Supabase Free Tier
-- ============================================================================

-- 1. Profiles Table (SJSU verified users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL CHECK (email LIKE '%@sjsu.edu'),
  name TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  is_suspended BOOLEAN DEFAULT FALSE,
  failed_login_attempts INT DEFAULT 0,
  lockout_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Listings Table (Found Items)
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  finder_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  finder_name TEXT NOT NULL,
  finder_email TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  category TEXT NOT NULL,
  location_found TEXT NOT NULL,
  date_found DATE NOT NULL CHECK (date_found <= CURRENT_DATE),
  status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Pending', 'Claimed', 'Returned')),
  return_date TIMESTAMPTZ,
  is_removed BOOLEAN DEFAULT FALSE,
  moderation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Claims Table
CREATE TABLE IF NOT EXISTS claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  claimant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  claimant_name TEXT NOT NULL,
  claimant_email TEXT NOT NULL,
  proof_description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Conversations & Direct Messages
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  finder_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  claimant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_removed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Lost-Item Alerts (FR16, FR25)
CREATE TABLE IF NOT EXISTS lost_item_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  keywords TEXT NOT NULL,
  category TEXT,
  location TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Notifications (FR24)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_type TEXT NOT NULL,
  link_id TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Content Reports (FR26-FR28)
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reporter_name TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('listing', 'message')),
  content_id UUID NOT NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  owner_name TEXT NOT NULL,
  reason TEXT NOT NULL,
  content_snippet TEXT,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Dismissed', 'Confirmed')),
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Admin Audit Logs (FR32)
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES profiles(id),
  admin_name TEXT NOT NULL,
  action TEXT NOT NULL,
  target_id TEXT NOT NULL,
  target_type TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Full Text Search Index for listings
CREATE INDEX IF NOT EXISTS idx_listings_search 
ON listings USING GIN (to_tsvector('english', title || ' ' || description));

-- Enable Row Level Security (RLS) on Supabase
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_item_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Permissive policies for anon / authenticated access in client demo
CREATE POLICY "Public read active listings" ON listings FOR SELECT USING (is_removed = FALSE);
CREATE POLICY "Users can insert listings" ON listings FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update listings" ON listings FOR UPDATE USING (true);

CREATE POLICY "Allow public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow manage profiles" ON profiles FOR ALL USING (true);

CREATE POLICY "Allow claims" ON claims FOR ALL USING (true);
CREATE POLICY "Allow conversations" ON conversations FOR ALL USING (true);
CREATE POLICY "Allow messages" ON messages FOR ALL USING (true);
CREATE POLICY "Allow notifications" ON notifications FOR ALL USING (true);
CREATE POLICY "Allow alerts" ON alerts FOR ALL USING (true);
CREATE POLICY "Allow reports" ON reports FOR ALL USING (true);
CREATE POLICY "Allow audit logs" ON admin_audit_logs FOR ALL USING (true);
