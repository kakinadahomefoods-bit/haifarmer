-- HAiFarmer Full Database Schema
-- Run this in your Supabase SQL editor

-- 1. CATEGORIES (existing)
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PRODUCTS (enhanced)
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  short_description TEXT,
  base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  offer_price DECIMAL(10,2),
  discount_percent INT DEFAULT 0,
  stock_quantity INT DEFAULT 0,
  sku TEXT,
  barcode TEXT,
  category TEXT,
  tags TEXT[],
  brand TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_best_seller BOOLEAN DEFAULT false,
  is_new_arrival BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  image_url TEXT,
  images TEXT[],
  video_url TEXT,
  seo_title TEXT,
  seo_description TEXT,
  weight TEXT,
  dimensions TEXT,
  rating DECIMAL(2,1) DEFAULT 4.0,
  avg_rating DECIMAL(2,1) DEFAULT 4.0,
  farmer_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PRODUCT VARIANTS
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  weight_label TEXT,
  color TEXT,
  size TEXT,
  stock INT DEFAULT 0,
  sku TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. BANNERS
CREATE TABLE IF NOT EXISTS banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  subtitle TEXT,
  button_text TEXT,
  button_url TEXT,
  desktop_image_url TEXT,
  mobile_image_url TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  cta_link TEXT,
  background_color TEXT DEFAULT '#16a34a',
  text_color TEXT DEFAULT '#ffffff',
  font_size TEXT DEFAULT '0.75rem',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_static BOOLEAN DEFAULT false,
  enable_auto_rotation BOOLEAN DEFAULT false,
  scroll_speed INT DEFAULT 30,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. BATCH COUPONS
CREATE TABLE IF NOT EXISTS batch_coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_name TEXT NOT NULL,
  prefix TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage','fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_value DECIMAL(10,2) DEFAULT 0,
  max_discount DECIMAL(10,2),
  expiry_date TIMESTAMPTZ,
  usage_limit INT DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  total_generated INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. GENERATED COUPONS (for batch)
CREATE TABLE IF NOT EXISTS generated_coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID REFERENCES batch_coupons(id) ON DELETE CASCADE,
  coupon_code TEXT UNIQUE NOT NULL,
  is_used BOOLEAN DEFAULT false,
  used_by TEXT,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. INDIVIDUAL COUPONS
CREATE TABLE IF NOT EXISTS individual_coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage','fixed')),
  discount_amount DECIMAL(10,2) NOT NULL,
  min_purchase DECIMAL(10,2) DEFAULT 0,
  max_discount DECIMAL(10,2),
  expiry_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  usage_limit INT DEFAULT 1,
  used_count INT DEFAULT 0,
  applicable_products TEXT[],
  applicable_categories TEXT[],
  excluded_products TEXT[],
  first_order_only BOOLEAN DEFAULT false,
  free_shipping BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. SHIPPING SETTINGS
CREATE TABLE IF NOT EXISTS shipping_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  free_delivery_threshold DECIMAL(10,2) DEFAULT 2599,
  enable_free_delivery BOOLEAN DEFAULT true,
  delivery_charges DECIMAL(10,2) DEFAULT 0,
  same_day_delivery BOOLEAN DEFAULT false,
  express_delivery BOOLEAN DEFAULT false,
  cash_on_delivery BOOLEAN DEFAULT true,
  estimated_delivery_days INT DEFAULT 3,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. LOCATION DELIVERY FEES
CREATE TABLE IF NOT EXISTS location_delivery_fees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  location TEXT NOT NULL,
  pincode TEXT,
  delivery_charge DECIMAL(10,2) DEFAULT 0,
  estimated_days INT DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  shipping_address JSONB,
  billing_address JSONB,
  items JSONB,
  subtotal DECIMAL(10,2) DEFAULT 0,
  discount_total DECIMAL(10,2) DEFAULT 0,
  coupon_discount DECIMAL(10,2) DEFAULT 0,
  delivery_charge DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','packed','shipped','out_for_delivery','delivered','cancelled','returned')),
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded')),
  tracking_number TEXT,
  delivery_partner TEXT,
  estimated_delivery_date TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 12. ORDER TIMELINE
CREATE TABLE IF NOT EXISTS order_timeline (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 13. ADMIN USERS
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('super_admin','admin','manager','support')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 14. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES admin_users(id),
  admin_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 15. SITE ASSETS (existing, enhanced)
CREATE TABLE IF NOT EXISTS site_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  logo_url TEXT,
  favicon_url TEXT,
  header_text_1 TEXT DEFAULT 'Free delivery over ₹1,499',
  about_heading TEXT DEFAULT 'Tribal & Natural Farm Fresh',
  about_description TEXT,
  about_image_url TEXT,
  free_delivery_threshold DECIMAL(10,2) DEFAULT 2599,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 16. CART ITEMS (existing)
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  bundle_id UUID,
  quantity INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 17. BUNDLES (existing)
CREATE TABLE IF NOT EXISTS bundles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bundle_name TEXT NOT NULL,
  bundle_description TEXT,
  bundle_price DECIMAL(10,2) NOT NULL,
  bundle_discount_percent INT DEFAULT 0,
  bundle_image_url TEXT,
  is_combo BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 18. BUNDLE ITEMS
CREATE TABLE IF NOT EXISTS bundle_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bundle_id UUID REFERENCES bundles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INT DEFAULT 1
);

-- 19. FARMERS (existing)
CREATE TABLE IF NOT EXISTS farmers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  crop TEXT,
  image_url TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 20. PRODUCT IMAGES (for multiple images)
CREATE TABLE IF NOT EXISTS product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default shipping settings
INSERT INTO shipping_settings (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;

-- Insert default site asset
INSERT INTO site_assets (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_delivery_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Allow public read for active content
CREATE POLICY "Public can read active banners" ON banners FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read active announcements" ON announcements FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read shipping settings" ON shipping_settings FOR SELECT USING (true);
