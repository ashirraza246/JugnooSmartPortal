-- Jugnoo Smart Portal V2 - 2-in-1 App Schema Update
-- Run this SQL in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Service Applications (for customer portal)
CREATE TABLE IF NOT EXISTS service_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  service_type TEXT NOT NULL,
  service_name TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  applicant_cnic TEXT,
  applicant_phone TEXT,
  applicant_whatsapp TEXT,
  description TEXT,
  documents JSONB,
  fee_amount DECIMAL(10,2) DEFAULT 0,
  payment_status TEXT DEFAULT 'unpaid',
  status TEXT DEFAULT 'submitted',
  notes TEXT,
  assigned_to_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Service Listings (available services for customer portal)
CREATE TABLE IF NOT EXISTS service_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  base_price DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  features JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS for new tables
ALTER TABLE service_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies for new tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_applications' AND policyname = 'Allow all on service_applications') THEN
    CREATE POLICY "Allow all on service_applications" ON service_applications FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_listings' AND policyname = 'Allow all on service_listings') THEN
    CREATE POLICY "Allow all on service_listings" ON service_listings FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Allow all on notifications') THEN
    CREATE POLICY "Allow all on notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);
  END IF;
END
$$;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_service_applications_updated_at ON service_applications;
CREATE TRIGGER update_service_applications_updated_at BEFORE UPDATE ON service_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_service_listings_updated_at ON service_listings;
CREATE TRIGGER update_service_listings_updated_at BEFORE UPDATE ON service_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_service_applications_user ON service_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_service_applications_status ON service_applications(status);
CREATE INDEX IF NOT EXISTS idx_service_applications_type ON service_applications(service_type);
CREATE INDEX IF NOT EXISTS idx_service_listings_category ON service_listings(category);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- Seed service listings
INSERT INTO service_listings (name, category, description, icon, base_price, sort_order, features) VALUES
-- Government Schemes
('Ehsaas Program', 'govt_scheme', 'Ehsaas emergency cash aur ration program ke liye apply karein', 'Heart', 500, 1, '["Online Application", "Status Tracking", "Document Assistance"]'),
('Benazir Income Support (BISP)', 'govt_scheme', 'BISP quarterly payment registration aur tracking', 'Wallet', 500, 2, '["New Registration", "Payment Tracking", "Complaint Filing"]'),
('NADRA Services', 'govt_scheme', 'CNIC banwana, renewal, ya correction ke liye apply', 'CreditCard', 300, 3, '["New CNIC", "CNIC Renewal", "CNIC Correction", "Family Tree Certificate"]'),
('Ehsaas Kafalat', 'govt_scheme', 'Ehsaas Kafalat program mein registration', 'Users', 400, 4, '["Registration", "Biometric Verification", "Payment Setup"]'),
('Sehat Sahulat Program', 'govt_scheme', 'Health insurance card ke liye apply karein', 'Shield', 300, 5, '["Registration", "Card Issuance", "Hospital Coverage"]'),

-- Scholarships
('PEEF Scholarship', 'scholarship', 'Punjab Educational Endowment Fund scholarship apply', 'GraduationCap', 500, 10, '["Application Form", "Document Preparation", "Submission Tracking"]'),
('HEC Scholarship', 'scholarship', 'Higher Education Commission scholarship applications', 'GraduationCap', 600, 11, '["Undergraduate", "Graduate", "PhD Programs"]'),
('Ehsaas Undergraduate Scholarship', 'scholarship', 'Ehsaas undergraduate scholarship program', 'GraduationCap', 400, 12, '["Need Based", "Merit Based", "Tuition Coverage"]'),
('Punjab Zawar Scheme', 'scholarship', 'Punjab Zawar scheme for girls education', 'GraduationCap', 300, 13, '["Girls Only", "Monthly Stipend", "Bank Account Setup"]'),

-- Loans
('Ehsaas Interest Free Loan', 'loan', 'Ehsaas interest-free loan for small business', 'Banknote', 1000, 20, '["Up to 75,000 PKR", "No Interest", "Business Plan Assistance"]'),
('PM Kamyab Jawan Loan', 'loan', 'Prime Minister Kamyab Jawan youth loan program', 'Banknote', 1500, 21, '["Up to 5 Million PKR", "Low Interest", "Business Startup"]'),
('Akhuwat Loan', 'loan', 'Akhuwat interest-free microfinance loan', 'Banknote', 800, 22, '["Interest Free", "Easy Installments", "Small Business"]'),

-- Printing Services
('Document Printing', 'printing', 'Black & White aur Color printing services', 'Printer', 10, 30, '["A4 Size", "Legal Size", "Color/B&W", "Bulk Orders"]'),
('Photo Printing', 'printing', 'Passport size aur photo printing', 'Camera', 50, 31, '["Passport Size", "4x6", "5x7", "8x10"]'),
('Banner Printing', 'printing', 'Flex banner aur vinyl printing', 'Image', 500, 32, '["Flex Banner", "Vinyl Sticker", "Standee", "Rollup Banner"]'),
('Business Card Printing', 'printing', 'Professional business cards', 'CreditCard', 500, 33, '["Standard", "Premium", "Transparent", "Metallic"]'),

-- Scanning & Copying
('Document Scanning', 'scanning', 'High quality document scanning', 'Scan', 20, 40, '["Single Page", "Multi Page", "PDF Conversion", "OCR"]'),
('Photocopy', 'scanning', 'Black & White aur Color photocopy', 'Copy', 5, 41, '["A4 Size", "Legal Size", "Color/B&W", "Certified Copy"]'),

-- Notarisation
('Affidavit', 'notarisation', 'Affidavit preparation aur notarisation', 'FileText', 500, 50, '["Draft Preparation", "Stamp Paper", "Notary Attestation"]'),
('Power of Attorney', 'notarisation', 'Power of Attorney document preparation', 'Scale', 1000, 51, '["General POA", "Special POA", "Attestation"]'),
('Agreement Drafting', 'notarisation', 'Legal agreements aur contracts', 'FileText', 800, 52, '["Rent Agreement", "Sale Agreement", "Partnership Deed"]'),
('Attestation', 'notarisation', 'Document attestation aur verification', 'CheckCircle', 200, 53, '["Copy Attestation", "Photo Attestation", "Signature Verification"]'),

-- Other Services
('Form Filling', 'other', 'Online aur offline form filling service', 'ClipboardList', 200, 60, '["Government Forms", "Bank Forms", "Admission Forms"]'),
('Typing Service', 'other', 'Urdu aur English typing service', 'Type', 100, 61, '["Urdu Typing", "English Typing", "Legal Documents"]'),
('Email/Online Account', 'other', 'Email account aur online services setup', 'Globe', 200, 62, '["Email Setup", "Social Media", "Online Banking"]'),
('Lamination', 'other', 'Document aur photo lamination', 'Layers', 100, 63, '["A4 Size", "Legal Size", "ID Card Size", "Photo Size"]')
ON CONFLICT DO NOTHING;
