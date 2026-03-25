-- LaunchPad Database Migration Script
-- This script updates the schema to support indie-first, feedback-driven features.
-- Includes "IF NOT EXISTS" and safe checks to prevent errors if elements already exist.

-- 1. Profiles Table Updates
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='feedback_points') THEN
        ALTER TABLE profiles ADD COLUMN feedback_points INTEGER DEFAULT 0;
    END IF;
END $$;

-- 2. Products Table Updates
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='status') THEN
        ALTER TABLE products ADD COLUMN status TEXT DEFAULT 'active';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='launch_status') THEN
        ALTER TABLE products ADD COLUMN launch_status TEXT DEFAULT 'live';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='is_indie') THEN
        ALTER TABLE products ADD COLUMN is_indie BOOLEAN DEFAULT TRUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='team_size') THEN
        ALTER TABLE products ADD COLUMN team_size INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='feedback_focus') THEN
        ALTER TABLE products ADD COLUMN feedback_focus TEXT[] DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='view_count') THEN
        ALTER TABLE products ADD COLUMN view_count INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='upvote_count') THEN
        ALTER TABLE products ADD COLUMN upvote_count INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='comment_count') THEN
        ALTER TABLE products ADD COLUMN comment_count INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='trending_score') THEN
        ALTER TABLE products ADD COLUMN trending_score NUMERIC DEFAULT 0;
    END IF;
END $$;

-- 3. Comments Table Updates
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comments' AND column_name='type') THEN
        ALTER TABLE comments ADD COLUMN type TEXT DEFAULT 'general';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comments' AND column_name='feedback_status') THEN
        ALTER TABLE comments ADD COLUMN feedback_status TEXT DEFAULT 'new';
    END IF;
END $$;

-- 4. Product Updates Table (Changelog)
CREATE TABLE IF NOT EXISTS product_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT,
    type TEXT DEFAULT 'update',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Collections Tables
CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collection_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(collection_id, product_id)
);

-- 6. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'upvote', 'comment', 'follow'
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. RPC Functions (Explicitly drop before creating to avoid return type mismatch)

-- RPC: Increment Product View
DROP FUNCTION IF EXISTS increment_product_view(UUID);
CREATE OR REPLACE FUNCTION increment_product_view(p_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE products
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

-- RPC: Increment Upvote
DROP FUNCTION IF EXISTS increment_upvote(UUID);
CREATE OR REPLACE FUNCTION increment_upvote(p_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE products
    SET upvote_count = COALESCE(upvote_count, 0) + 1
    WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

-- RPC: Decrement Upvote
DROP FUNCTION IF EXISTS decrement_upvote(UUID);
CREATE OR REPLACE FUNCTION decrement_upvote(p_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE products
    SET upvote_count = GREATEST(0, COALESCE(upvote_count, 0) - 1)
    WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

-- RPC: Increment Feedback Points
DROP FUNCTION IF EXISTS increment_feedback_points(UUID, INTEGER);
CREATE OR REPLACE FUNCTION increment_feedback_points(u_id UUID, points INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE profiles
    SET feedback_points = COALESCE(feedback_points, 0) + points
    WHERE id = u_id;
END;
$$ LANGUAGE plpgsql;

-- RPC: Award Done Bonus
DROP FUNCTION IF EXISTS award_done_bonus(UUID);
CREATE OR REPLACE FUNCTION award_done_bonus(c_id UUID)
RETURNS VOID AS $$
DECLARE
    commenter_id UUID;
    owner_id UUID;
BEGIN
    -- Get commenter and product owner
    SELECT c.user_id, p.user_id INTO commenter_id, owner_id
    FROM comments c
    JOIN products p ON c.product_id = p.id
    WHERE c.id = c_id;

    -- Award bonus to both
    PERFORM increment_feedback_points(commenter_id, 3);
    PERFORM increment_feedback_points(owner_id, 3);
END;
$$ LANGUAGE plpgsql;

-- 8. Fix for existing update_trending_score trigger (if it exists)
-- This ensures the trending score calculation handles date math correctly
-- Formula: (upvotes * 3 + comments * 2) / (1 + age_in_days)

CREATE OR REPLACE FUNCTION update_trending_score()
RETURNS TRIGGER AS $$
DECLARE
    age_in_days NUMERIC;
BEGIN
    -- Calculate age in days (minimum 0)
    age_in_days := GREATEST(0, EXTRACT(EPOCH FROM (NOW() - NEW.created_at)) / 86400);
    
    -- Calculate score using the formula from the audit document
    NEW.trending_score := (COALESCE(NEW.upvote_count, 0) * 3 + COALESCE(NEW.comment_count, 0) * 2) / (1 + age_in_days);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Re-apply trigger to products table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trig_update_trending_score') THEN
        CREATE TRIGGER trig_update_trending_score
        BEFORE INSERT OR UPDATE OF upvote_count, comment_count ON products
        FOR EACH ROW EXECUTE FUNCTION update_trending_score();
    END IF;
END $$;
