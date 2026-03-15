-- ================================================================
-- MarketNa - Complete Database Schema
-- Description: Full database schema with multi-vendor marketplace support
-- Date: 2026-03-15
-- Version: 4.0 - Complete with Advanced Features
-- Copyright (c) 2026 Mohammed Kher Ali
-- ================================================================
-- 
-- This is a COMPLETE FRESH INSTALLATION script.
-- Run this on an empty database or after dropping all tables.
-- ================================================================

-- ================================================================
-- 1. EXTENSIONS
-- ================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- 2. AUTH & USERS
-- ================================================================

-- ----------------------------------------------------------------
-- Table: profiles
-- Purpose: Extends auth.users with additional user information
-- Description: Stores user profile data like names, avatar, phone number
--              and vendor status. Each authenticated user has one profile.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL,
  first_name text,
  last_name text,
  avatar_url text,
  updated_at timestamp with time zone DEFAULT now(),
  email text,
  phone text,
  is_vendor boolean NOT NULL DEFAULT false,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------
-- Table: roles
-- Purpose: Defines system roles for access control
-- Description: Stores available roles like admin, vendor, customer, support
--              Used with user_roles for role-based permissions
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  CONSTRAINT roles_pkey PRIMARY KEY (id)
);

-- ----------------------------------------------------------------
-- Table: user_roles
-- Purpose: Many-to-many relationship between users and roles
-- Description: Assigns multiple roles to users for flexible permissions
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid NOT NULL,
  role_id uuid NOT NULL,
  CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------
-- Table: password_reset_tokens
-- Purpose: Secure password reset functionality
-- Description: Stores temporary tokens for password reset emails
--              Tokens expire and can only be used once
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  used boolean DEFAULT false,
  used_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ================================================================
-- 3. VENDORS & SUBSCRIPTIONS
-- ================================================================

-- ----------------------------------------------------------------
-- Table: vendors
-- Purpose: Store/seller information for multi-vendor marketplace
-- Description: Contains all vendor/seller data including store details,
--              contact info, ratings, and subscription tier. Each vendor
--              is linked to a user account.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vendors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  store_name text NOT NULL UNIQUE,
  store_slug text NOT NULL UNIQUE,
  description text,
  description_ar text,
  logo_url text,
  banner_url text,
  phone text,
  email text,
  website text,
  country text,
  city text,
  address text,
  is_verified boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  rating_avg numeric NOT NULL DEFAULT 0,
  rating_count integer NOT NULL DEFAULT 0,
  total_sales integer NOT NULL DEFAULT 0,
  total_products integer NOT NULL DEFAULT 0,
  social_links jsonb DEFAULT '{}'::jsonb,
  subscription_tier_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT vendors_pkey PRIMARY KEY (id),
  CONSTRAINT vendors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT vendors_subscription_tier_id_fkey FOREIGN KEY (subscription_tier_id) REFERENCES public.subscription_plans(id),
  CONSTRAINT vendors_store_name_check CHECK (char_length(store_name) >= 3),
  CONSTRAINT vendors_store_slug_check CHECK (char_length(store_slug) >= 3)
);

-- ----------------------------------------------------------------
-- Table: subscription_plans
-- Purpose: Defines vendor subscription tiers and features
-- Description: Stores subscription plans (Free, Basic, Pro, Enterprise)
--              with pricing, limits, and feature flags. Controls what
--              vendors can access based on their subscription.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  name_ar text,
  slug text NOT NULL UNIQUE,
  description text,
  description_ar text,
  price_monthly numeric NOT NULL DEFAULT 0,
  price_yearly numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  trial_period_days integer NOT NULL DEFAULT 0,
  max_products integer NOT NULL DEFAULT 10,
  max_images_per_product integer NOT NULL DEFAULT 3,
  max_variants_per_product integer NOT NULL DEFAULT 5,
  storage_limit_mb integer NOT NULL DEFAULT 100,
  commission_rate numeric NOT NULL DEFAULT 15.0,
  has_analytics boolean NOT NULL DEFAULT false,
  has_priority_support boolean NOT NULL DEFAULT false,
  has_custom_domain boolean NOT NULL DEFAULT false,
  has_discount_codes boolean NOT NULL DEFAULT false,
  has_bulk_upload boolean NOT NULL DEFAULT false,
  has_api_access boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  is_popular boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT subscription_plans_pkey PRIMARY KEY (id)
);

-- ----------------------------------------------------------------
-- Table: vendor_subscriptions
-- Purpose: Tracks active vendor subscriptions and billing
-- Description: Links vendors to subscription plans, tracks billing cycles,
--              payment info, usage stats, and subscription status.
--              One subscription per vendor.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vendor_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL UNIQUE,
  plan_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'active',
  billing_cycle text NOT NULL DEFAULT 'monthly',
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  current_period_start timestamp with time zone NOT NULL DEFAULT now(),
  current_period_end timestamp with time zone NOT NULL,
  trial_ends_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  ends_at timestamp with time zone,
  payment_method_id text,
  stripe_subscription_id text,
  stripe_customer_id text,
  products_count integer NOT NULL DEFAULT 0,
  storage_used_mb integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT vendor_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT vendor_subscriptions_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE,
  CONSTRAINT vendor_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id),
  CONSTRAINT vendor_subscriptions_status_check CHECK (status IN ('active', 'cancelled', 'expired', 'trial', 'past_due')),
  CONSTRAINT vendor_subscriptions_billing_cycle_check CHECK (billing_cycle IN ('monthly', 'yearly'))
);

-- ================================================================
-- 4. CATALOG
-- ================================================================

-- ----------------------------------------------------------------
-- Table: categories
-- Purpose: Product categorization hierarchy
-- Description: Stores product categories with support for nested
--              subcategories (parent_id). Includes translations
--              and display ordering.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  name_ar text,
  slug text NOT NULL UNIQUE,
  description text,
  description_ar text,
  image_url text,
  parent_id uuid,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE SET NULL
);

-- ----------------------------------------------------------------
-- Table: brands
-- Purpose: Product brand information
-- Description: Stores brand/manufacturer data for products.
--              Helps customers filter and find products by brand.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.brands (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  name_ar text,
  slug text NOT NULL UNIQUE,
  description text,
  description_ar text,
  logo_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT brands_pkey PRIMARY KEY (id)
);

-- ----------------------------------------------------------------
-- Table: product_attributes
-- Purpose: Global product attributes for filtering
-- Description: Defines reusable attributes (color, size, material)
--              that can be used across products. Supports different
--              types (text, number, color, image, boolean, select).
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_attributes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_ar text,
  slug text NOT NULL UNIQUE,
  type text NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'number', 'color', 'image', 'boolean', 'select')),
  values text[] DEFAULT '{}',
  is_visible boolean NOT NULL DEFAULT true,
  is_filterable boolean NOT NULL DEFAULT false,
  is_variant boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT product_attributes_pkey PRIMARY KEY (id)
);

-- ----------------------------------------------------------------
-- Table: products
-- Purpose: Core product information
-- Description: Main product table storing all product data including
--              names, descriptions, pricing, inventory, shipping info,
--              SEO metadata, and JSONB attributes for flexibility.
--              Supports simple, variable, digital, and service products.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  
  -- Basic Info
  name text NOT NULL,
  name_ar text,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
  description_ar text,
  short_description text,
  short_description_ar text,
  
  -- Categorization
  category_id uuid,
  brand_id uuid,
  vendor_id uuid,
  tags text[] DEFAULT '{}',
  
  -- Product Type
  product_type text NOT NULL DEFAULT 'simple' CHECK (product_type IN ('simple', 'variable', 'digital', 'service')),
  
  -- Attributes (JSONB) - For filtering and display
  attributes jsonb DEFAULT '{}'::jsonb,
  
  -- Images
  main_image_url text,
  image_urls text[] DEFAULT '{}',
  gallery jsonb DEFAULT '[]'::jsonb,
  
  -- Pricing (for simple products)
  base_price numeric CHECK (base_price >= 0),
  sale_price numeric CHECK (sale_price >= 0),
  sale_start_date timestamp with time zone,
  sale_end_date timestamp with time zone,
  cost_price numeric CHECK (cost_price >= 0),
  currency text DEFAULT 'USD',
  
  -- Inventory (for simple products)
  sku text UNIQUE,
  barcode text,
  stock_quantity integer NOT NULL DEFAULT 0,
  low_stock_threshold integer NOT NULL DEFAULT 5,
  track_inventory boolean NOT NULL DEFAULT true,
  allow_backorder boolean NOT NULL DEFAULT false,
  
  -- Shipping
  weight numeric CHECK (weight >= 0),
  weight_unit text DEFAULT 'kg',
  dimensions jsonb DEFAULT '{"length": 0, "width": 0, "height": 0}'::jsonb,
  dimensions_unit text DEFAULT 'cm',
  shipping_class text,
  is_shippable boolean NOT NULL DEFAULT true,
  is_virtual boolean NOT NULL DEFAULT false,
  
  -- SEO
  meta_title text,
  meta_description text,
  meta_keywords text[],
  
  -- Status
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived', 'out_of_stock')),
  is_available boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  is_digital boolean NOT NULL DEFAULT false,
  
  -- Ratings & Reviews
  average_rating numeric NOT NULL DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
  reviews_count integer NOT NULL DEFAULT 0,
  
  -- Sales Analytics
  total_sales integer NOT NULL DEFAULT 0,
  view_count integer NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  published_at timestamp with time zone,
  
  -- Constraints
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL,
  CONSTRAINT products_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE SET NULL,
  CONSTRAINT products_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE SET NULL
);

-- ----------------------------------------------------------------
-- Table: product_variants
-- Purpose: Product variations (size, color, etc.)
-- Description: Stores variant-specific data for variable products.
--              Each variant has its own price, stock, SKU, and
--              JSONB options defining the variant combination.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_variants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  
  -- Variant Info
  name text NOT NULL,
  sku text UNIQUE,
  barcode text,
  
  -- Variant Options (JSONB)
  options jsonb NOT NULL DEFAULT '{}'::jsonb,
  
  -- Pricing
  price numeric NOT NULL CHECK (price >= 0),
  sale_price numeric CHECK (sale_price >= 0),
  sale_start_date timestamp with time zone,
  sale_end_date timestamp with time zone,
  cost_price numeric CHECK (cost_price >= 0),
  price_adjustment numeric DEFAULT 0,
  
  -- Inventory
  stock_quantity integer NOT NULL DEFAULT 0,
  low_stock_threshold integer NOT NULL DEFAULT 5,
  track_inventory boolean NOT NULL DEFAULT true,
  allow_backorder boolean NOT NULL DEFAULT false,
  
  -- Images (variant-specific)
  image_url text,
  
  -- Shipping
  weight numeric CHECK (weight >= 0),
  weight_unit text DEFAULT 'kg',
  
  -- Status
  is_default boolean NOT NULL DEFAULT false,
  is_available boolean NOT NULL DEFAULT true,
  
  -- Position
  display_order integer NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT product_variants_pkey PRIMARY KEY (id),
  CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE,
  CONSTRAINT product_variants_unique_options UNIQUE (product_id, options)
);

-- ================================================================
-- 5. CART & ORDERS
-- ================================================================

-- ----------------------------------------------------------------
-- Table: carts
-- Purpose: User shopping cart session
-- Description: Stores active cart for each user. Contains cart
--              metadata and links to cart items.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.carts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT carts_pkey PRIMARY KEY (id),
  CONSTRAINT carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------
-- Table: cart_items
-- Purpose: Items in user's shopping cart
-- Description: Stores products added to cart with quantities.
--              Linked to product_variants for specific options.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL,
  variant_id uuid NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT cart_items_pkey PRIMARY KEY (id),
  CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.carts(id) ON DELETE CASCADE,
  CONSTRAINT cart_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------
-- Table: orders
-- Purpose: Customer order information
-- Description: Main order table storing order header data including
--              customer info, addresses, payment details, and totals.
--              Order status tracks fulfillment progress.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  order_number text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending',
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  customer_phone text,
  shipping_address jsonb NOT NULL,
  billing_address jsonb,
  subtotal numeric NOT NULL DEFAULT 0,
  shipping_cost numeric NOT NULL DEFAULT 0,
  taxes numeric NOT NULL DEFAULT 0,
  discount numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  payment_method text,
  payment_status text NOT NULL DEFAULT 'pending',
  notes text,
  -- Shipping & Tracking
  tracking_number text,
  carrier_id uuid,
  shipped_at timestamp with time zone,
  estimated_delivery_date timestamp with time zone,
  delivered_at timestamp with time zone,
  -- Returns
  return_status text DEFAULT 'none',
  return_requested_at timestamp with time zone,
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- ----------------------------------------------------------------
-- Table: order_items
-- Purpose: Individual items within an order
-- Description: Stores each product/variant in an order with pricing
--              at time of purchase. Links to vendor for multi-vendor
--              order splitting and fulfillment.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  product_id uuid,
  product_variant_id uuid,
  vendor_id uuid,
  product_name text NOT NULL,
  variant_name text,
  variant_options jsonb,
  sku text,
  quantity integer NOT NULL,
  price numeric NOT NULL,
  subtotal numeric NOT NULL,
  tax numeric NOT NULL DEFAULT 0,
  discount numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL,
  -- Fulfillment
  fulfillment_status text DEFAULT 'pending',
  shipped_quantity integer DEFAULT 0,
  returned_quantity integer DEFAULT 0,
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE,
  CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL,
  CONSTRAINT order_items_product_variant_id_fkey FOREIGN KEY (product_variant_id) REFERENCES public.product_variants(id) ON DELETE SET NULL,
  CONSTRAINT order_items_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE SET NULL
);

-- ================================================================
-- 6. WISHLIST & REVIEWS
-- ================================================================

-- ----------------------------------------------------------------
-- Table: wishlist_items
-- Purpose: User's saved/favorite products
-- Description: Allows users to save products for later viewing
--              or purchase. One entry per user-product combination.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT wishlist_items_pkey PRIMARY KEY (id),
  CONSTRAINT wishlist_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT wishlist_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE,
  CONSTRAINT wishlist_items_unique UNIQUE (user_id, product_id)
);

-- ----------------------------------------------------------------
-- Table: viewed_products
-- Purpose: Track user browsing history
-- Description: Records products viewed by users for "recently viewed"
--              feature and personalized recommendations.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.viewed_products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  product_id uuid NOT NULL,
  viewed_at timestamp with time zone NOT NULL DEFAULT now(),
  session_id text,
  CONSTRAINT viewed_products_pkey PRIMARY KEY (id),
  CONSTRAINT viewed_products_user_product_unique UNIQUE (user_id, product_id)
);

-- ----------------------------------------------------------------
-- Table: reviews
-- Purpose: Customer product reviews and ratings
-- Description: Stores user reviews with ratings, comments, and
--              verification status. Supports images and helpful votes.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  product_id uuid NOT NULL,
  user_id uuid,
  rating smallint NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  title text,
  comment text,
  is_verified_purchase boolean NOT NULL DEFAULT false,
  reviewer_name text,
  reviewer_email text,
  is_published boolean NOT NULL DEFAULT false,
  helpful_count integer NOT NULL DEFAULT 0,
  images text[] DEFAULT '{}',
  vendor_response text,
  vendor_response_at timestamp with time zone,
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE,
  CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- ----------------------------------------------------------------
-- Table: review_reports
-- Purpose: User-reported inappropriate reviews
-- Description: Allows users to flag reviews for moderation.
--              Tracks report status and resolution.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.review_reports (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  review_id bigint NOT NULL,
  user_id uuid,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'pending',
  resolved_at timestamp with time zone,
  resolved_by uuid,
  CONSTRAINT review_reports_pkey PRIMARY KEY (id),
  CONSTRAINT review_reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT review_reports_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.reviews(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------
-- Table: review_helpful_votes
-- Purpose: Track helpful votes on reviews
-- Description: Users can vote if a review was helpful. One vote
--              per user per review.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.review_helpful_votes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  review_id bigint NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT review_helpful_votes_pkey PRIMARY KEY (id),
  CONSTRAINT review_helpful_votes_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.reviews(id) ON DELETE CASCADE,
  CONSTRAINT review_helpful_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT review_helpful_votes_unique UNIQUE (review_id, user_id)
);

-- ================================================================
-- 7. RETURNS & REFUNDS
-- ================================================================

-- ----------------------------------------------------------------
-- Table: returns
-- Purpose: Product return/refund requests
-- Description: Manages customer return requests including reason,
--              status tracking, refund amounts, and shipping info.
--              Links to order items for validation.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.returns (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  order_item_id uuid NOT NULL,
  user_id uuid NOT NULL,
  vendor_id uuid,
  reason text NOT NULL,
  reason_details text,
  status text NOT NULL DEFAULT 'pending',
  refund_amount numeric,
  refund_method text,
  return_tracking_number text,
  return_shipping_address jsonb,
  requested_at timestamp with time zone NOT NULL DEFAULT now(),
  approved_at timestamp with time zone,
  received_at timestamp with time zone,
  resolved_at timestamp with time zone,
  resolved_by uuid,
  notes text,
  CONSTRAINT returns_pkey PRIMARY KEY (id),
  CONSTRAINT returns_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT returns_order_item_id_fkey FOREIGN KEY (order_item_id) REFERENCES public.order_items(id),
  CONSTRAINT returns_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- ================================================================
-- 8. MESSAGING & COMMUNICATION
-- ================================================================

-- ----------------------------------------------------------------
-- Table: conversations
-- Purpose: Buyer-seller messaging threads
-- Description: Creates conversation threads between buyers and vendors
--              for product inquiries, order questions, etc.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid,
  order_id uuid,
  buyer_id uuid NOT NULL,
  vendor_id uuid NOT NULL,
  subject text,
  last_message_at timestamp with time zone,
  is_buyer_deleted boolean DEFAULT false,
  is_vendor_deleted boolean DEFAULT false,
  is_read_by_buyer boolean DEFAULT false,
  is_read_by_vendor boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT conversations_pkey PRIMARY KEY (id),
  CONSTRAINT conversations_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES auth.users(id),
  CONSTRAINT conversations_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

-- ----------------------------------------------------------------
-- Table: messages
-- Purpose: Individual messages within conversations
-- Description: Stores message content, attachments, and read status.
--              Supports text and file attachments.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  read_at timestamp with time zone,
  attachments jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id)
);

-- ================================================================
-- 9. NOTIFICATIONS
-- ================================================================

-- ----------------------------------------------------------------
-- Table: notifications
-- Purpose: User notification system
-- Description: Stores in-app notifications for users about orders,
--              products, messages, and system events. Supports
--              read/unread status and custom data payload.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  read_at timestamp with time zone,
  action_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ================================================================
-- 10. DISCOUNT & MARKETING
-- ================================================================

-- ----------------------------------------------------------------
-- Table: discount_codes
-- Purpose: Promotional discount/coupon codes
-- Description: Stores discount codes with various types (percentage,
--              fixed, free shipping). Supports usage limits, validity
--              periods, and product/category/vendor restrictions.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.discount_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free_shipping')),
  discount_value numeric NOT NULL CHECK (discount_value >= 0),
  min_order_amount numeric DEFAULT 0,
  max_discount_amount numeric,
  usage_limit integer,
  usage_limit_per_user integer,
  times_used integer NOT NULL DEFAULT 0,
  valid_from timestamp with time zone DEFAULT now(),
  valid_until timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  applicable_products uuid[] DEFAULT '{}',
  applicable_categories uuid[] DEFAULT '{}',
  applicable_vendors uuid[] DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  CONSTRAINT discount_codes_pkey PRIMARY KEY (id),
  CONSTRAINT discount_codes_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);

-- ----------------------------------------------------------------
-- Table: gift_cards
-- Purpose: Purchasable gift card system
-- Description: Stores gift cards with codes, balances, and redemption
--              tracking. Can be purchased by users and gifted to others.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gift_cards (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  amount numeric NOT NULL,
  balance numeric NOT NULL,
  expires_at timestamp with time zone,
  status text NOT NULL DEFAULT 'active',
  purchased_by uuid,
  redeemed_by uuid,
  redeemed_at timestamp with time zone,
  recipient_email text,
  recipient_name text,
  message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT gift_cards_pkey PRIMARY KEY (id),
  CONSTRAINT gift_cards_purchased_by_fkey FOREIGN KEY (purchased_by) REFERENCES auth.users(id),
  CONSTRAINT gift_cards_redeemed_by_fkey FOREIGN KEY (redeemed_by) REFERENCES auth.users(id)
);

-- ----------------------------------------------------------------
-- Table: newsletter_subscriptions
-- Purpose: Email newsletter subscriber list
-- Description: Stores email addresses of newsletter subscribers
--              with subscription status and unsubscribe tracking.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'subscribed',
  unsubscribe_reason text,
  unsubscribed_at timestamp with time zone,
  source text DEFAULT 'website',
  CONSTRAINT newsletter_subscriptions_pkey PRIMARY KEY (id)
);

-- ================================================================
-- 11. LOYALTY & REWARDS
-- ================================================================

-- ----------------------------------------------------------------
-- Table: loyalty_points
-- Purpose: Customer loyalty points balance
-- Description: Tracks total and lifetime points for each user.
--              Points earned from purchases and activities.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.loyalty_points (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  points integer NOT NULL DEFAULT 0,
  lifetime_points integer NOT NULL DEFAULT 0,
  tier text DEFAULT 'bronze',
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT loyalty_points_pkey PRIMARY KEY (id),
  CONSTRAINT loyalty_points_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------
-- Table: loyalty_transactions
-- Purpose: Loyalty points transaction history
-- Description: Records all point earnings and redemptions with
--              reasons and linked orders/activities.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  points integer NOT NULL,
  type text NOT NULL,
  reason text,
  order_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT loyalty_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT loyalty_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT loyalty_transactions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);

-- ================================================================
-- 12. SHIPPING & CARRIERS
-- ================================================================

-- ----------------------------------------------------------------
-- Table: shipping_carriers
-- Purpose: Shipping carrier information
-- Description: Stores shipping company data (DHL, FedEx, etc.)
--              with tracking URL templates for order tracking.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shipping_carriers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  logo_url text,
  tracking_url_template text,
  website_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT shipping_carriers_pkey PRIMARY KEY (id)
);

-- ----------------------------------------------------------------
-- Table: shipping_rates
-- Purpose: Shipping cost calculation rules
-- Description: Defines shipping rates by vendor, carrier, region,
--              and weight ranges. Used for automatic shipping cost
--              calculation at checkout.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shipping_rates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  vendor_id uuid,
  carrier_id uuid,
  country text NOT NULL,
  state text,
  min_weight numeric DEFAULT 0,
  max_weight numeric,
  price numeric NOT NULL,
  estimated_days_min integer,
  estimated_days_max integer,
  is_free_shipping boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT shipping_rates_pkey PRIMARY KEY (id),
  CONSTRAINT shipping_rates_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES vendors(id),
  CONSTRAINT shipping_rates_carrier_id_fkey FOREIGN KEY (carrier_id) REFERENCES shipping_carriers(id)
);

-- ================================================================
-- 13. TAXES
-- ================================================================

-- ----------------------------------------------------------------
-- Table: tax_rates
-- Purpose: Tax rate configuration by region
-- Description: Stores tax rates for different countries/states.
--              Supports percentage and compound taxes for
--              automatic tax calculation at checkout.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tax_rates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  country text NOT NULL,
  state text,
  city text,
  rate numeric NOT NULL,
  tax_type text DEFAULT 'percentage',
  tax_name text,
  is_compound boolean DEFAULT false,
  priority integer DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT tax_rates_pkey PRIMARY KEY (id)
);

-- ================================================================
-- 14. SUPPORT & SETTINGS
-- ================================================================

-- ----------------------------------------------------------------
-- Table: support_requests
-- Purpose: Customer support ticket system
-- Description: Stores customer support requests with status tracking,
--              priority levels, and assignment to support staff.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.support_requests (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid,
  auth_email text,
  contact_email text NOT NULL,
  subject text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'normal',
  assigned_to uuid,
  category text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  resolved_at timestamp with time zone,
  CONSTRAINT support_requests_pkey PRIMARY KEY (id),
  CONSTRAINT support_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT support_requests_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES auth.users(id)
);

-- ----------------------------------------------------------------
-- Table: user_addresses
-- Purpose: User saved shipping/billing addresses
-- Description: Stores multiple addresses per user for checkout.
--              Supports default, billing, and shipping flags.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_addresses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  address_name text NOT NULL DEFAULT 'Home',
  first_name text NOT NULL,
  last_name text NOT NULL,
  company text,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text,
  postal_code text NOT NULL,
  country text NOT NULL,
  country_code text,
  phone text,
  is_default boolean NOT NULL DEFAULT false,
  is_billing boolean NOT NULL DEFAULT false,
  is_shipping boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_addresses_pkey PRIMARY KEY (id),
  CONSTRAINT user_addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------
-- Table: countries
-- Purpose: Country list for addresses and shipping
-- Description: Stores country data with codes, names in multiple
--              languages, and emoji flags for display.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.countries (
  id smallint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  name_ar text,
  emoji text,
  emojiU text,
  code text,
  isoCode text NOT NULL UNIQUE,
  flag text,
  phone_code text,
  currency text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT countries_pkey PRIMARY KEY (id)
);

-- ----------------------------------------------------------------
-- Table: exchange_rates
-- Purpose: Currency exchange rates
-- Description: Stores exchange rates from USD for multi-currency
--              support. Updated periodically for accurate pricing.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  currency_code text NOT NULL,
  rate_from_usd numeric NOT NULL,
  last_updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT exchange_rates_pkey PRIMARY KEY (currency_code)
);

-- ----------------------------------------------------------------
-- Table: site_settings
-- Purpose: Global site configuration
-- Description: Stores site-wide settings as JSONB key-value pairs.
--              Supports public and private settings for admin use.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  description text,
  is_public boolean NOT NULL DEFAULT false,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid,
  CONSTRAINT site_settings_pkey PRIMARY KEY (id),
  CONSTRAINT site_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id)
);

-- ================================================================
-- 15. ANALYTICS & ACTIVITY
-- ================================================================

-- ----------------------------------------------------------------
-- Table: analytics_events
-- Purpose: User behavior tracking for analytics
-- Description: Records user actions (page views, add to cart, purchases)
--              for analytics, recommendations, and business intelligence.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid,
  vendor_id uuid,
  product_id uuid,
  order_id uuid,
  session_id text,
  data jsonb DEFAULT '{}',
  ip_address inet,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT analytics_events_pkey PRIMARY KEY (id)
);

-- ----------------------------------------------------------------
-- Table: activity_logs
-- Purpose: User activity audit trail
-- Description: Logs significant user actions for security, debugging,
--              and compliance. Includes IP and user agent data.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT activity_logs_pkey PRIMARY KEY (id)
);

-- ================================================================
-- 16. INDEXES
-- ================================================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Vendors
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON public.vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_vendors_store_slug ON public.vendors(store_slug);
CREATE INDEX IF NOT EXISTS idx_vendors_is_verified ON public.vendors(is_verified);
CREATE INDEX IF NOT EXISTS idx_vendors_is_active ON public.vendors(is_active);
CREATE INDEX IF NOT EXISTS idx_vendors_subscription_tier_id ON public.vendors(subscription_tier_id);

-- Subscription Plans
CREATE INDEX IF NOT EXISTS idx_subscription_plans_slug ON public.subscription_plans(slug);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_is_active ON public.subscription_plans(is_active);

-- Vendor Subscriptions
CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_vendor_id ON public.vendor_subscriptions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_plan_id ON public.vendor_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_status ON public.vendor_subscriptions(status);

-- Categories
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);

-- Brands
CREATE INDEX IF NOT EXISTS idx_brands_slug ON public.brands(slug);
CREATE INDEX IF NOT EXISTS idx_brands_is_active ON public.brands(is_active);

-- Products
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON public.products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON public.products(is_available);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_product_type ON public.products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_tags ON public.products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_products_attributes ON public.products USING GIN(attributes);
CREATE INDEX IF NOT EXISTS idx_products_base_price ON public.products(base_price);
CREATE INDEX IF NOT EXISTS idx_products_average_rating ON public.products(average_rating);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_published_at ON public.products(published_at);

-- Product Variants
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_options ON public.product_variants USING GIN(options);
CREATE INDEX IF NOT EXISTS idx_product_variants_is_default ON public.product_variants(is_default);
CREATE INDEX IF NOT EXISTS idx_product_variants_price ON public.product_variants(price);

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

-- Order Items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_vendor_id ON public.order_items(vendor_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- Reviews
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_published ON public.reviews(is_published);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at);

-- Wishlist
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON public.wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_product_id ON public.wishlist_items(product_id);

-- Cart
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON public.carts(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_variant_id ON public.cart_items(variant_id);

-- Discount Codes
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON public.discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_is_active ON public.discount_codes(is_active);

-- User Addresses
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON public.user_addresses(user_id);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- Returns
CREATE INDEX IF NOT EXISTS idx_returns_order_id ON public.returns(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_user_id ON public.returns(user_id);
CREATE INDEX IF NOT EXISTS idx_returns_status ON public.returns(status);

-- Conversations
CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON public.conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_vendor_id ON public.conversations(vendor_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON public.conversations(last_message_at);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- Loyalty
CREATE INDEX IF NOT EXISTS idx_loyalty_points_user_id ON public.loyalty_points(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_user_id ON public.loyalty_transactions(user_id);

-- Analytics
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at);

-- ================================================================
-- 17. DEFAULT DATA
-- ================================================================

-- Default Roles
INSERT INTO public.roles (name, description) VALUES
  ('admin', 'Full system access'),
  ('vendor', 'Vendor/seller access'),
  ('customer', 'Customer access'),
  ('support', 'Customer support access')
ON CONFLICT (name) DO NOTHING;

-- Default Subscription Plans
INSERT INTO public.subscription_plans (
  name, name_ar, slug, description, description_ar,
  price_monthly, price_yearly, currency, trial_period_days,
  max_products, max_images_per_product, max_variants_per_product, storage_limit_mb,
  commission_rate, has_analytics, has_priority_support, has_custom_domain,
  has_discount_codes, has_bulk_upload, has_api_access,
  display_order, is_active, is_popular
) VALUES 
(
  'Free', 'مجاني', 'free',
  'Perfect for getting started', 'مثالي للبدء',
  0, 0, 'USD', 0,
  10, 3, 5, 100,
  15.0, false, false, false,
  false, false, false,
  1, true, false
),
(
  'Basic', 'أساسي', 'basic',
  'For growing businesses', 'للشركات الناشئة',
  29, 290, 'USD', 7,
  100, 10, 20, 5120,
  12.0, true, false, false,
  true, false, false,
  2, true, true
),
(
  'Pro', 'احترافي', 'pro',
  'For established businesses', 'للشركات المتوسطة',
  79, 790, 'USD', 14,
  500, 20, 50, 20480,
  8.0, true, true, false,
  true, true, true,
  3, true, false
),
(
  'Enterprise', 'مؤسسات', 'enterprise',
  'For large scale operations', 'للشركات الكبيرة',
  199, 1990, 'USD', 30,
  999999, 50, 999, 102400,
  5.0, true, true, true,
  true, true, true,
  4, true, false
)
ON CONFLICT (slug) DO NOTHING;

-- Default Site Settings
INSERT INTO public.site_settings (key, value, description, is_public) VALUES
  ('site_name', '{"en": "MarketNa", "ar": "ماركت نا"}', 'Site name in multiple languages', true),
  ('site_currency', '{"default": "USD", "supported": ["USD", "EUR", "SAR", "AED"]}', 'Supported currencies', true),
  ('site_locale', '{"default": "en", "supported": ["en", "ar"]}', 'Supported locales', true),
  ('vendor_settings', '{"auto_approve": false, "require_verification": true}', 'Vendor settings', false),
  ('order_settings', '{"auto_confirm": true, "allow_cancellation": true}', 'Order settings', false),
  ('loyalty_settings', '{"enabled": true, "points_per_dollar": 10, "redemption_rate": 100}', 'Loyalty program settings', false)
ON CONFLICT (key) DO NOTHING;

-- Default Shipping Carriers
INSERT INTO public.shipping_carriers (name, code, tracking_url_template, website_url, is_active) VALUES
  ('DHL Express', 'dhl', 'https://www.dhl.com/en/express/tracking.html?AWB={tracking_number}', 'https://www.dhl.com', true),
  ('FedEx', 'fedex', 'https://www.fedex.com/fedextrack/?trknbr={tracking_number}', 'https://www.fedex.com', true),
  ('UPS', 'ups', 'https://www.ups.com/track?tracknum={tracking_number}', 'https://www.ups.com', true),
  ('Aramex', 'aramex', 'https://www.aramex.com/us/en/track/shipments?tracking_number={tracking_number}', 'https://www.aramex.com', true)
ON CONFLICT (code) DO NOTHING;

-- ================================================================
-- 18. ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================================

-- Enable RLS for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viewed_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_helpful_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- PROFILES POLICIES
-- =================================================================
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- =================================================================
-- VENDORS POLICIES
-- =================================================================
DROP POLICY IF EXISTS "Anyone can view active vendors" ON public.vendors;
DROP POLICY IF EXISTS "Users can manage own vendor" ON public.vendors;
DROP POLICY IF EXISTS "Users can create own vendor" ON public.vendors;

CREATE POLICY "Anyone can view active vendors"
  ON public.vendors FOR SELECT USING (is_active = true OR user_id = auth.uid());

CREATE POLICY "Users can manage own vendor"
  ON public.vendors FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can create own vendor"
  ON public.vendors FOR INSERT WITH CHECK (user_id = auth.uid());

-- =================================================================
-- SUBSCRIPTION PLANS POLICIES
-- =================================================================
DROP POLICY IF EXISTS "Anyone can view active plans" ON public.subscription_plans;
CREATE POLICY "Anyone can view active plans"
  ON public.subscription_plans FOR SELECT USING (is_active = true);

-- =================================================================
-- VENDOR SUBSCRIPTIONS POLICIES
-- =================================================================
DROP POLICY IF EXISTS "Users can view own subscription" ON public.vendor_subscriptions;
CREATE POLICY "Users can view own subscription"
  ON public.vendor_subscriptions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.vendors
    WHERE vendors.id = vendor_subscriptions.vendor_id
    AND vendors.user_id = auth.uid()
  ));

-- =================================================================
-- PRODUCTS POLICIES
-- =================================================================
DROP POLICY IF EXISTS "Anyone can view available products" ON public.products;
DROP POLICY IF EXISTS "Vendors can manage own products" ON public.products;

CREATE POLICY "Anyone can view available products"
  ON public.products FOR SELECT
  USING (is_available = true OR vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can manage own products"
  ON public.products FOR ALL
  USING (vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid()));

-- =================================================================
-- PRODUCT VARIANTS POLICIES
-- =================================================================
DROP POLICY IF EXISTS "Anyone can view variants of available products" ON public.product_variants;
DROP POLICY IF EXISTS "Vendors can manage own variants" ON public.product_variants;

CREATE POLICY "Anyone can view variants of available products"
  ON public.product_variants FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.products
    WHERE id = product_variants.product_id AND is_available = true
  ));

CREATE POLICY "Vendors can manage own variants"
  ON public.product_variants FOR ALL
  USING (product_id IN (
    SELECT id FROM public.products
    WHERE vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid())
  ));

-- =================================================================
-- ORDERS POLICIES
-- =================================================================
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;

CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own orders"
  ON public.orders FOR INSERT WITH CHECK (user_id = auth.uid());

-- =================================================================
-- WISHLIST POLICIES
-- =================================================================
DROP POLICY IF EXISTS "Users can manage own wishlist" ON public.wishlist_items;
CREATE POLICY "Users can manage own wishlist"
  ON public.wishlist_items FOR ALL USING (user_id = auth.uid());

-- =================================================================
-- REVIEWS POLICIES
-- =================================================================
DROP POLICY IF EXISTS "Anyone can view published reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can manage own reviews" ON public.reviews;

CREATE POLICY "Anyone can view published reviews"
  ON public.reviews FOR SELECT
  USING (is_published = true OR user_id = auth.uid());

CREATE POLICY "Users can manage own reviews"
  ON public.reviews FOR ALL USING (user_id = auth.uid());

-- =================================================================
-- NOTIFICATIONS POLICIES
-- =================================================================
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT USING (user_id = auth.uid());

-- =================================================================
-- RETURNS POLICIES
-- =================================================================
DROP POLICY IF EXISTS "Users can view own returns" ON public.returns;
DROP POLICY IF EXISTS "Users can create returns" ON public.returns;

CREATE POLICY "Users can view own returns"
  ON public.returns FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create returns"
  ON public.returns FOR INSERT WITH CHECK (user_id = auth.uid());

-- =================================================================
-- CONVERSATIONS POLICIES
-- =================================================================
DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
CREATE POLICY "Users can view own conversations"
  ON public.conversations FOR SELECT
  USING (buyer_id = auth.uid() OR vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (buyer_id = auth.uid());

-- =================================================================
-- MESSAGES POLICIES
-- =================================================================
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;

CREATE POLICY "Users can view own messages"
  ON public.messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM conversations
    WHERE id = messages.conversation_id
    AND (buyer_id = auth.uid() OR vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()))
  ));

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- =================================================================
-- DISCOUNT CODES POLICIES
-- =================================================================
DROP POLICY IF EXISTS "Anyone can view active discount codes" ON public.discount_codes;
CREATE POLICY "Anyone can view active discount codes"
  ON public.discount_codes FOR SELECT
  USING (is_active = true);

-- =================================================================
-- GIFT CARDS POLICIES
-- =================================================================
DROP POLICY IF EXISTS "Users can view own gift cards" ON public.gift_cards;
CREATE POLICY "Users can view own gift cards"
  ON public.gift_cards FOR SELECT
  USING (purchased_by = auth.uid() OR redeemed_by = auth.uid());

CREATE POLICY "Users can redeem gift cards"
  ON public.gift_cards FOR UPDATE
  USING (true);

-- =================================================================
-- LOYALTY POLICIES
-- =================================================================
DROP POLICY IF EXISTS "Users can view own loyalty points" ON public.loyalty_points;
DROP POLICY IF EXISTS "Users can manage own loyalty points" ON public.loyalty_points;

CREATE POLICY "Users can view own loyalty points"
  ON public.loyalty_points FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can manage loyalty points"
  ON public.loyalty_points FOR ALL
  USING (true);

-- =================================================================
-- LOYALTY TRANSACTIONS POLICIES
-- =================================================================
DROP POLICY IF EXISTS "Users can view own loyalty transactions" ON public.loyalty_transactions;
CREATE POLICY "Users can view own loyalty transactions"
  ON public.loyalty_transactions FOR SELECT USING (user_id = auth.uid());

-- =================================================================
-- USER ADDRESSES POLICIES
-- =================================================================
DROP POLICY IF EXISTS "Users can manage own addresses" ON public.user_addresses;
CREATE POLICY "Users can manage own addresses"
  ON public.user_addresses FOR ALL USING (user_id = auth.uid());

-- =================================================================
-- SUPPORT REQUESTS POLICIES
-- =================================================================
DROP POLICY IF EXISTS "Users can view own support requests" ON public.support_requests;
DROP POLICY IF EXISTS "Users can create support requests" ON public.support_requests;

CREATE POLICY "Users can view own support requests"
  ON public.support_requests FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create support requests"
  ON public.support_requests FOR INSERT WITH CHECK (user_id = auth.uid());

-- =================================================================
-- SITE SETTINGS POLICIES
-- =================================================================
DROP POLICY IF EXISTS "Anyone can view public settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can manage settings" ON public.site_settings;

CREATE POLICY "Anyone can view public settings"
  ON public.site_settings FOR SELECT USING (is_public = true);

-- =================================================================
-- ANALYTICS EVENTS POLICIES
-- =================================================================
DROP POLICY IF EXISTS "Users can insert own analytics events" ON public.analytics_events;
CREATE POLICY "Users can insert own analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- =================================================================
-- ACTIVITY LOGS POLICIES
-- =================================================================
DROP POLICY IF EXISTS "Users can view own activity logs" ON public.activity_logs;
CREATE POLICY "Users can view own activity logs"
  ON public.activity_logs FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert activity logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (true);

-- =================================================================
-- VIEWED PRODUCTS POLICIES
-- =================================================================
DROP POLICY IF EXISTS "Users can manage own viewed products" ON public.viewed_products;
CREATE POLICY "Users can manage own viewed products"
  ON public.viewed_products FOR ALL
  USING (user_id = auth.uid() OR user_id IS NULL);

-- =================================================================
-- REVIEW REPORTS POLICIES
-- =================================================================
DROP POLICY IF EXISTS "Users can create review reports" ON public.review_reports;
DROP POLICY IF EXISTS "Users can view own review reports" ON public.review_reports;

CREATE POLICY "Users can create review reports"
  ON public.review_reports FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own review reports"
  ON public.review_reports FOR SELECT
  USING (user_id = auth.uid());

-- =================================================================
-- REVIEW HELPFUL VOTES POLICIES
-- =================================================================
DROP POLICY IF EXISTS "Users can vote on reviews" ON public.review_helpful_votes;
DROP POLICY IF EXISTS "Users can view helpful votes" ON public.review_helpful_votes;

CREATE POLICY "Users can vote on reviews"
  ON public.review_helpful_votes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view helpful votes"
  ON public.review_helpful_votes FOR SELECT
  USING (true);

-- =================================================================
-- CARTS POLICIES
-- =================================================================
DROP POLICY IF EXISTS "Users can manage own cart" ON public.carts;
CREATE POLICY "Users can manage own cart"
  ON public.carts FOR ALL USING (user_id = auth.uid());

-- =================================================================
-- CART ITEMS POLICIES
-- =================================================================
DROP POLICY IF EXISTS "Users can manage own cart items" ON public.cart_items;
CREATE POLICY "Users can manage own cart items"
  ON public.cart_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.carts
    WHERE carts.id = cart_items.cart_id
    AND carts.user_id = auth.uid()
  ));

-- =================================================================
-- ORDER ITEMS POLICIES
-- =================================================================
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  ));

-- =================================================================
-- CATEGORIES POLICIES
-- =================================================================
DROP POLICY IF EXISTS "Anyone can view active categories" ON public.categories;
CREATE POLICY "Anyone can view active categories"
  ON public.categories FOR SELECT USING (is_active = true);

-- =================================================================
-- BRANDS POLICIES
-- =================================================================
DROP POLICY IF EXISTS "Anyone can view active brands" ON public.brands;
CREATE POLICY "Anyone can view active brands"
  ON public.brands FOR SELECT USING (is_active = true);

-- =================================================================
-- PRODUCT ATTRIBUTES POLICIES
-- =================================================================
DROP POLICY IF EXISTS "Anyone can view visible attributes" ON public.product_attributes;
CREATE POLICY "Anyone can view visible attributes"
  ON public.product_attributes FOR SELECT USING (is_visible = true);

-- =================================================================
-- SHIPPING RATES POLICIES
-- =================================================================
DROP POLICY IF EXISTS "Anyone can view shipping rates" ON public.shipping_rates;
CREATE POLICY "Anyone can view shipping rates"
  ON public.shipping_rates FOR SELECT USING (true);

-- =================================================================
-- TAX RATES POLICIES
-- =================================================================
DROP POLICY IF EXISTS "Anyone can view tax rates" ON public.tax_rates;
CREATE POLICY "Anyone can view tax rates"
  ON public.tax_rates FOR SELECT USING (is_active = true);

-- =================================================================
-- NEWSLETTER SUBSCRIPTIONS POLICIES
-- =================================================================
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscriptions;
CREATE POLICY "Anyone can subscribe to newsletter"
  ON public.newsletter_subscriptions FOR INSERT
  WITH CHECK (true);

-- =================================================================
-- COUNTRIES POLICIES
-- =================================================================
DROP POLICY IF EXISTS "Anyone can view countries" ON public.countries;
CREATE POLICY "Anyone can view countries"
  ON public.countries FOR SELECT USING (true);

-- =================================================================
-- EXCHANGE RATES POLICIES
-- =================================================================
DROP POLICY IF EXISTS "Anyone can view exchange rates" ON public.exchange_rates;
CREATE POLICY "Anyone can view exchange rates"
  ON public.exchange_rates FOR SELECT USING (true);

-- =================================================================
-- SHIPPING CARRIERS POLICIES
-- =================================================================
DROP POLICY IF EXISTS "Anyone can view shipping carriers" ON public.shipping_carriers;
CREATE POLICY "Anyone can view shipping carriers"
  ON public.shipping_carriers FOR SELECT USING (is_active = true);

-- ================================================================
-- 19. FUNCTIONS & TRIGGERS
-- ================================================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vendor_subscriptions_updated_at BEFORE UPDATE ON public.vendor_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON public.carts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_addresses_updated_at BEFORE UPDATE ON public.user_addresses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_support_requests_updated_at BEFORE UPDATE ON public.support_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_loyalty_points_updated_at BEFORE UPDATE ON public.loyalty_points FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tax_rates_updated_at BEFORE UPDATE ON public.tax_rates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to sync product stock from variants
CREATE OR REPLACE FUNCTION public.sync_product_stock_from_variants()
RETURNS TRIGGER AS $$
DECLARE
  v_total_stock integer;
BEGIN
  SELECT COALESCE(SUM(stock_quantity), 0) INTO v_total_stock
  FROM public.product_variants
  WHERE product_id = COALESCE(NEW.product_id, OLD.product_id);
  
  UPDATE public.products
  SET 
    stock_quantity = v_total_stock,
    status = CASE WHEN v_total_stock = 0 THEN 'out_of_stock' ELSE 'active' END,
    updated_at = now()
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_product_stock_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.sync_product_stock_from_variants();

-- Function to update product rating
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products
  SET 
    average_rating = (SELECT COALESCE(AVG(rating), 0) FROM public.reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id) AND is_published = true),
    reviews_count = (SELECT COUNT(*) FROM public.reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id) AND is_published = true),
    updated_at = now()
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();

-- Function to update vendor product count
CREATE OR REPLACE FUNCTION public.update_vendor_product_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.vendors SET total_products = total_products + 1, updated_at = now() WHERE id = NEW.vendor_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.vendors SET total_products = GREATEST(total_products - 1, 0), updated_at = now() WHERE id = OLD.vendor_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.vendor_id IS DISTINCT FROM NEW.vendor_id THEN
    UPDATE public.vendors SET total_products = GREATEST(total_products - 1, 0), updated_at = now() WHERE id = OLD.vendor_id;
    UPDATE public.vendors SET total_products = total_products + 1, updated_at = now() WHERE id = NEW.vendor_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vendor_product_count_trigger
  AFTER INSERT OR DELETE OR UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_vendor_product_count();

-- Function to check vendor product limit
CREATE OR REPLACE FUNCTION public.check_vendor_product_limit(p_vendor_id uuid)
RETURNS TABLE (can_add boolean, current_count integer, max_allowed integer, message text) AS $$
DECLARE
  v_current_count integer;
  v_max_allowed integer;
BEGIN
  SELECT COUNT(*) INTO v_current_count FROM public.products WHERE vendor_id = p_vendor_id AND status != 'archived';
  SELECT COALESCE(sp.max_products, 10) INTO v_max_allowed
  FROM public.vendors v
  LEFT JOIN public.vendor_subscriptions vs ON v.id = vs.vendor_id AND vs.status = 'active'
  LEFT JOIN public.subscription_plans sp ON vs.plan_id = sp.id
  WHERE v.id = p_vendor_id;
  
  RETURN QUERY SELECT v_current_count < v_max_allowed, v_current_count, v_max_allowed,
    CASE WHEN v_current_count >= v_max_allowed THEN 'Product limit reached. Upgrade your plan.' ELSE 'OK' END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get vendor subscription info
CREATE OR REPLACE FUNCTION public.get_vendor_subscription_info(p_vendor_id uuid)
RETURNS TABLE (
  plan_name text, plan_slug text, status text, billing_cycle text, current_period_end timestamp with time zone,
  products_count integer, max_products integer, storage_used_mb integer, storage_limit_mb integer,
  commission_rate numeric, has_analytics boolean, has_priority_support boolean, has_custom_domain boolean,
  has_discount_codes boolean, has_bulk_upload boolean, has_api_access boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT sp.name, sp.slug, vs.status, vs.billing_cycle, vs.current_period_end, vs.products_count,
    sp.max_products, vs.storage_used_mb, sp.storage_limit_mb, sp.commission_rate,
    sp.has_analytics, sp.has_priority_support, sp.has_custom_domain,
    sp.has_discount_codes, sp.has_bulk_upload, sp.has_api_access
  FROM public.vendors v
  LEFT JOIN public.vendor_subscriptions vs ON v.id = vs.vendor_id
  LEFT JOIN public.subscription_plans sp ON vs.plan_id = sp.id
  WHERE v.id = p_vendor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text AS $$
BEGIN
  RETURN 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(nextval('orders_id_seq')::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to update review helpful count
CREATE OR REPLACE FUNCTION public.update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.reviews SET helpful_count = helpful_count + 1 WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.reviews SET helpful_count = GREATEST(helpful_count - 1, 0) WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_review_helpful_count_trigger
  AFTER INSERT OR DELETE ON public.review_helpful_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_review_helpful_count();

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_data jsonb DEFAULT '{}',
  p_action_url text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_notification_id uuid;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, data, action_url)
  VALUES (p_user_id, p_type, p_title, p_message, p_data, p_action_url)
  RETURNING id INTO v_notification_id;
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 20. COMMENTS
-- ================================================================

COMMENT ON TABLE public.vendors IS 'Vendor/Store information for multi-vendor marketplace';
COMMENT ON TABLE public.subscription_plans IS 'Subscription plans for vendors with features and limits';
COMMENT ON TABLE public.vendor_subscriptions IS 'Active subscriptions for vendors tracking billing and usage';
COMMENT ON TABLE public.products IS 'Products with JSONB attributes for flexibility';
COMMENT ON TABLE public.product_variants IS 'Product variants with JSONB options';
COMMENT ON TABLE public.product_attributes IS 'Global product attributes for filtering';
COMMENT ON TABLE public.returns IS 'Product return and refund requests';
COMMENT ON TABLE public.conversations IS 'Buyer-seller messaging conversations';
COMMENT ON TABLE public.messages IS 'Individual messages within conversations';
COMMENT ON TABLE public.notifications IS 'User notifications for orders, products, and system events';
COMMENT ON TABLE public.gift_cards IS 'Purchasable gift cards with balance tracking';
COMMENT ON TABLE public.loyalty_points IS 'Customer loyalty points balance and tier';
COMMENT ON TABLE public.loyalty_transactions IS 'Loyalty points earning and redemption history';
COMMENT ON TABLE public.shipping_carriers IS 'Shipping carrier information for order tracking';
COMMENT ON TABLE public.shipping_rates IS 'Shipping rate rules by region and weight';
COMMENT ON TABLE public.tax_rates IS 'Tax rates by country/state for automatic calculation';
COMMENT ON TABLE public.analytics_events IS 'User behavior events for analytics and recommendations';
COMMENT ON TABLE public.activity_logs IS 'User activity audit trail for security';
COMMENT ON TABLE public.viewed_products IS 'User product view history for recommendations';
COMMENT ON COLUMN public.products.attributes IS 'JSONB object containing attribute name-value pairs for filtering';
COMMENT ON COLUMN public.product_variants.options IS 'JSONB object containing the specific options for this variant';
COMMENT ON FUNCTION public.sync_product_stock_from_variants IS 'Automatically sync product stock from variant stock levels';
COMMENT ON FUNCTION public.check_vendor_product_limit IS 'Check if a vendor can add more products based on their subscription';
COMMENT ON FUNCTION public.get_vendor_subscription_info IS 'Get complete subscription info for a vendor';
COMMENT ON FUNCTION public.update_vendor_product_count IS 'Automatically update vendor product count when products are added/removed';
COMMENT ON FUNCTION public.update_product_rating IS 'Automatically update product rating and review count when reviews change';
COMMENT ON FUNCTION public.create_notification IS 'Create a notification for a user';

-- ================================================================
-- END OF SCHEMA - MarketNa Complete Database
-- ================================================================
