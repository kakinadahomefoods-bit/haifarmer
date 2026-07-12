-- Universal E-Commerce Admin Panel - Complete Schema
-- Run once in Supabase SQL editor to set up all tables

-- ========================
-- 1. CORE CONFIG
-- ========================

CREATE TABLE IF NOT EXISTS business_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT DEFAULT 'My Store',
  business_tagline TEXT DEFAULT 'Fresh & Natural',
  business_email TEXT,
  business_phone TEXT,
  business_address TEXT,
  currency TEXT DEFAULT 'INR',
  currency_symbol TEXT DEFAULT '₹',
  weight_unit TEXT DEFAULT 'kg',
  logo_url TEXT,
  favicon_url TEXT,
  theme_color TEXT DEFAULT '#16a34a',
  footer_text TEXT,
  contact_page TEXT,
  social_links JSONB DEFAULT '{}',
  terms_page TEXT,
  privacy_page TEXT,
  refund_page TEXT,
  delivery_page TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO business_settings (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;

-- ========================
-- 2. CATEGORIES
-- ========================

CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  icon_url TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========================
-- 3. PRODUCTS
-- ========================

CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  short_description TEXT,
  base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_percent INT DEFAULT 0,
  stock_quantity INT DEFAULT 0,
  low_stock_threshold INT DEFAULT 5,
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
  weight DECIMAL(10,2),
  dimensions TEXT,
  rating DECIMAL(2,1) DEFAULT 4.0,
  farmer_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========================
-- 4. PRODUCT VARIANTS
-- ========================

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

-- ========================
-- 5. PRODUCT IMAGES (multiple per product)
-- ========================

CREATE TABLE IF NOT EXISTS product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ========================
-- 6. BUNDLES / COMBOS
-- ========================

CREATE TABLE IF NOT EXISTS bundles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bundle_name TEXT NOT NULL,
  bundle_description TEXT,
  bundle_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  bundle_discount_percent INT DEFAULT 0,
  bundle_image_url TEXT,
  is_combo BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bundle_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bundle_id UUID REFERENCES bundles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INT DEFAULT 1
);

-- ========================
-- 7. COUPONS
-- ========================

CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage','fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_value DECIMAL(10,2) DEFAULT 0,
  max_discount DECIMAL(10,2),
  start_date TIMESTAMPTZ,
  expiry_date TIMESTAMPTZ,
  usage_limit INT DEFAULT 1,
  used_count INT DEFAULT 0,
  scope TEXT DEFAULT 'all' CHECK (scope IN ('all','products','combos')),
  applicable_products TEXT[],
  applicable_categories TEXT[],
  excluded_products TEXT[],
  first_order_only BOOLEAN DEFAULT false,
  free_shipping BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========================
-- 8. DELIVERY SETTINGS
-- ========================

CREATE TABLE IF NOT EXISTS delivery_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  free_delivery_enabled BOOLEAN DEFAULT true,
  free_delivery_min_amount DECIMAL(10,2) DEFAULT 1499,
  default_delivery_charge DECIMAL(10,2) DEFAULT 0,
  same_day_delivery BOOLEAN DEFAULT false,
  express_delivery BOOLEAN DEFAULT false,
  pickup_enabled BOOLEAN DEFAULT false,
  pickup_address TEXT,
  cod_enabled BOOLEAN DEFAULT true,
  estimated_delivery_days INT DEFAULT 3,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO delivery_settings (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS location_delivery_fees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  location TEXT NOT NULL,
  pincode TEXT,
  delivery_charge DECIMAL(10,2) DEFAULT 0,
  estimated_days INT DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ========================
-- 9. PAYMENT SETTINGS
-- ========================

CREATE TABLE IF NOT EXISTS payment_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  active_gateway TEXT DEFAULT 'whatsapp' CHECK (active_gateway IN ('razorpay','whatsapp')),
  razorpay_key TEXT,
  razorpay_secret TEXT,
  razorpay_enabled BOOLEAN DEFAULT false,
  whatsapp_number TEXT DEFAULT '919909904563',
  whatsapp_message_template TEXT DEFAULT 'New Order from {customer_name}:\n\nProducts: {items}\nTotal: {total}\nAddress: {address}\nPhone: {phone}\nPayment: {payment_method}',
  whatsapp_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO payment_settings (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;

-- ========================
-- 10. ORDERS
-- ========================

CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  shipping_address JSONB,
  billing_address JSONB,
  delivery_notes TEXT,
  items JSONB,
  subtotal DECIMAL(10,2) DEFAULT 0,
  discount_total DECIMAL(10,2) DEFAULT 0,
  coupon_code TEXT,
  coupon_discount DECIMAL(10,2) DEFAULT 0,
  delivery_charge DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','packed','shipped','out_for_delivery','delivered','cancelled','returned','refunded')),
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded')),
  payment_id TEXT,
  tracking_number TEXT,
  delivery_partner TEXT,
  estimated_delivery_date TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_timeline (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ========================
-- 11. BANNERS
-- ========================

CREATE TABLE IF NOT EXISTS banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  subtitle TEXT,
  button_text TEXT,
  button_url TEXT,
  desktop_image_url TEXT,
  mobile_image_url TEXT,
  link_url TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========================
-- 12. ANNOUNCEMENTS
-- ========================

CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  link_url TEXT,
  background_color TEXT DEFAULT '#16a34a',
  text_color TEXT DEFAULT '#ffffff',
  font_size TEXT DEFAULT '0.75rem',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_static BOOLEAN DEFAULT false,
  auto_rotate BOOLEAN DEFAULT false,
  scroll_speed INT DEFAULT 30,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========================
-- 13. FARMERS / VENDORS
-- ========================

CREATE TABLE IF NOT EXISTS farmers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  crop TEXT,
  image_url TEXT,
  address TEXT,
  description TEXT,
  farm_images TEXT[],
  harvest_details JSONB,
  is_approved BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========================
-- 14. FARMER REQUESTS
-- ========================

CREATE TABLE IF NOT EXISTS farmer_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
  request_type TEXT CHECK (request_type IN ('product','bulk','harvest','other')),
  subject TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ========================
-- 15. QR CODES
-- ========================

CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT DEFAULT 'Farmer Page QR',
  target_url TEXT,
  is_active BOOLEAN DEFAULT true,
  scan_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========================
-- 16. ADMIN USERS & AUTH
-- ========================

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin','admin','manager','support')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ========================
-- 17. AUDIT LOGS
-- ========================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES admin_users(id),
  admin_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  changes JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ========================
-- 18. CART ITEMS
-- ========================

CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  bundle_id UUID,
  quantity INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ========================
-- 19. SITE ASSETS (homepage config)
-- ========================

CREATE TABLE IF NOT EXISTS site_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  logo_url TEXT,
  favicon_url TEXT,
  header_text_1 TEXT DEFAULT 'Free delivery',
  header_text_2 TEXT DEFAULT 'Farm fresh',
  home_main_banner_1_url TEXT,
  home_main_banner_2_url TEXT,
  home_main_banner_3_url TEXT,
  home_main_banner_4_url TEXT,
  home_middle_top_banner_url TEXT,
  home_middle_bottom_banner_url TEXT,
  home_right_story_banner_url TEXT,
  ad_banner_left_url TEXT,
  ad_banner_right_url TEXT,
  about_heading TEXT,
  about_description TEXT,
  about_image_url TEXT,
  free_delivery_threshold DECIMAL(10,2) DEFAULT 1499,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO site_assets (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;

-- ========================
-- 20. USERS PROFILE
-- ========================

CREATE TABLE IF NOT EXISTS users_profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  address JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ========================
-- INDEXES
-- ========================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_bundles_active ON bundles(is_active);
CREATE INDEX IF NOT EXISTS idx_bundle_items_bundle ON bundle_items(bundle_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(coupon_code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_order_timeline_order ON order_timeline(order_id);
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active);
CREATE INDEX IF NOT EXISTS idx_banners_sort ON banners(sort_order);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_farmers_active ON farmers(is_active);
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

-- ========================
-- RLS POLICIES
-- ========================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_delivery_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;

-- Public read for active content
CREATE POLICY "Public read active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active bundles" ON bundles FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active banners" ON banners FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active announcements" ON announcements FOR SELECT USING (is_active = true);
CREATE POLICY "Public read delivery settings" ON delivery_settings FOR SELECT USING (true);
CREATE POLICY "Public read active farmers" ON farmers FOR SELECT USING (is_active = true);
CREATE POLICY "Public read site assets" ON site_assets FOR SELECT USING (true);
CREATE POLICY "Public read business settings" ON business_settings FOR SELECT USING (true);
