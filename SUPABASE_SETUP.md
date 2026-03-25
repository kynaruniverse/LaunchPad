# LaunchPad Supabase Setup Guide

This document provides step-by-step instructions to set up your Supabase database for the LaunchPad platform evolution.

## Overview

The LaunchPad evolution introduces the following key features:
- **Indie-first products** with lifecycle status (idea/MVP/beta/live/sunset)
- **Structured feedback** with types (issue, suggestion, praise, question) and status tracking
- **Build-in-public updates** (changelog/product updates)
- **Collections** for curating and sharing projects
- **Notifications** for community engagement
- **Feedback points** system to incentivize quality contributions

---

## Step 1: Execute the SQL Migration

### Option A: Via Supabase Dashboard (Recommended for beginners)

1. Log in to your [Supabase Dashboard](https://app.supabase.com)
2. Select your LaunchPad project
3. Navigate to **SQL Editor** → **New Query**
4. Copy the entire contents of `/migration.sql` (provided in this repository)
5. Paste it into the query editor
6. Click **Run** (or press Ctrl+Enter)
7. Wait for confirmation that all statements executed successfully

### Option B: Via Supabase CLI (For advanced users)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to your Supabase account
supabase login

# Link your project
supabase link --project-ref <your-project-ref>

# Run the migration
supabase db push migration.sql
```

---

## Step 2: Verify Schema Changes

After running the migration, verify that all tables and columns were created:

### Check Products Table
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;
```

**Expected new columns:**
- `status` (text, default 'active')
- `launch_status` (text, default 'live')
- `is_indie` (boolean, default true)
- `team_size` (integer, nullable)
- `feedback_focus` (text[], default '{}')
- `view_count` (integer, default 0)
- `upvote_count` (integer, default 0)
- `comment_count` (integer, default 0)
- `trending_score` (numeric, default 0)

### Check Comments Table
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'comments'
ORDER BY ordinal_position;
```

**Expected new columns:**
- `type` (text, default 'general')
- `feedback_status` (text, default 'new')

### Check New Tables
```sql
-- Check product_updates table
SELECT * FROM product_updates LIMIT 1;

-- Check collections table
SELECT * FROM collections LIMIT 1;

-- Check collection_items table
SELECT * FROM collection_items LIMIT 1;

-- Check notifications table
SELECT * FROM notifications LIMIT 1;
```

---

## Step 3: Configure Row-Level Security (RLS) Policies

The migration creates tables but does not set up RLS policies. Configure these for security:

### Products Table
```sql
-- Allow anyone to read products
CREATE POLICY "Products are viewable by everyone"
ON products FOR SELECT
USING (true);

-- Allow authenticated users to insert their own products
CREATE POLICY "Users can insert their own products"
ON products FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own products
CREATE POLICY "Users can update their own products"
ON products FOR UPDATE
USING (auth.uid() = user_id);
```

### Comments Table
```sql
-- Allow anyone to read comments
CREATE POLICY "Comments are viewable by everyone"
ON comments FOR SELECT
USING (true);

-- Allow authenticated users to insert comments
CREATE POLICY "Users can insert comments"
ON comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow product owners to update comment feedback_status
CREATE POLICY "Product owners can update feedback status"
ON comments FOR UPDATE
USING (
  auth.uid() = (
    SELECT user_id FROM products WHERE id = product_id
  )
);
```

### Collections Table
```sql
-- Allow anyone to read public collections
CREATE POLICY "Public collections are viewable by everyone"
ON collections FOR SELECT
USING (is_public = true OR auth.uid() = user_id);

-- Allow authenticated users to create collections
CREATE POLICY "Users can create collections"
ON collections FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow collection owners to update their collections
CREATE POLICY "Collection owners can update their collections"
ON collections FOR UPDATE
USING (auth.uid() = user_id);

-- Allow collection owners to delete their collections
CREATE POLICY "Collection owners can delete their collections"
ON collections FOR DELETE
USING (auth.uid() = user_id);
```

### Collection Items Table
```sql
-- Allow anyone to read collection items if collection is public
CREATE POLICY "Collection items are viewable if collection is public or owned"
ON collection_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM collections c
    WHERE c.id = collection_id
    AND (c.is_public = true OR c.user_id = auth.uid())
  )
);

-- Allow collection owners to insert items
CREATE POLICY "Collection owners can add items"
ON collection_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM collections c
    WHERE c.id = collection_id
    AND c.user_id = auth.uid()
  )
);

-- Allow collection owners to remove items
CREATE POLICY "Collection owners can remove items"
ON collection_items FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM collections c
    WHERE c.id = collection_id
    AND c.user_id = auth.uid()
  )
);
```

### Notifications Table
```sql
-- Allow users to read their own notifications
CREATE POLICY "Users can read their own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

-- Allow system to insert notifications (disable direct user inserts)
CREATE POLICY "System can insert notifications"
ON notifications FOR INSERT
WITH CHECK (false); -- Disable for now; use triggers instead
```

### Product Updates Table
```sql
-- Allow anyone to read product updates
CREATE POLICY "Product updates are viewable by everyone"
ON product_updates FOR SELECT
USING (true);

-- Allow authenticated users to insert updates for their products
CREATE POLICY "Users can insert updates for their products"
ON product_updates FOR INSERT
WITH CHECK (
  auth.uid() = (
    SELECT user_id FROM products WHERE id = product_id
  )
);

-- Allow product owners to delete their own updates
CREATE POLICY "Product owners can delete their updates"
ON product_updates FOR DELETE
USING (
  auth.uid() = (
    SELECT user_id FROM products WHERE id = product_id
  )
);
```

---

## Step 4: Enable RLS on All Tables

```sql
-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_updates ENABLE ROW LEVEL SECURITY;
```

---

## Step 5: Create Indexes for Performance

```sql
-- Products indexes
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_launch_status ON products(launch_status);
CREATE INDEX idx_products_is_indie ON products(is_indie);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_trending_score ON products(trending_score DESC);

-- Comments indexes
CREATE INDEX idx_comments_product_id ON comments(product_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_type ON comments(type);
CREATE INDEX idx_comments_feedback_status ON comments(feedback_status);

-- Collections indexes
CREATE INDEX idx_collections_user_id ON collections(user_id);
CREATE INDEX idx_collections_is_public ON collections(is_public);

-- Collection items indexes
CREATE INDEX idx_collection_items_collection_id ON collection_items(collection_id);
CREATE INDEX idx_collection_items_product_id ON collection_items(product_id);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Product updates indexes
CREATE INDEX idx_product_updates_product_id ON product_updates(product_id);
CREATE INDEX idx_product_updates_author_id ON product_updates(author_id);
CREATE INDEX idx_product_updates_created_at ON product_updates(created_at DESC);
```

---

## Step 6: Verify RPC Functions

The migration creates several RPC functions. Verify they exist:

```sql
-- List all functions
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION'
ORDER BY routine_name;
```

**Expected functions:**
- `increment_product_view`
- `increment_upvote`
- `decrement_upvote`
- `increment_feedback_points`
- `award_done_bonus`

---

## Step 7: Test the Setup

### Test Product Creation
```sql
-- Insert a test product
INSERT INTO products (
  user_id,
  title,
  tagline,
  description,
  category,
  tags,
  launch_status,
  is_indie,
  team_size,
  feedback_focus,
  status
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- Replace with a real user_id
  'Test Product',
  'A test product for LaunchPad',
  'This is a test',
  'SaaS',
  ARRAY['test', 'demo'],
  'mvp',
  true,
  null,
  ARRAY['usability', 'pricing'],
  'active'
);
```

### Test Comment with Type
```sql
-- Insert a test comment with type
INSERT INTO comments (
  product_id,
  user_id,
  content,
  type,
  feedback_status
) VALUES (
  (SELECT id FROM products LIMIT 1),
  '00000000-0000-0000-0000-000000000000', -- Replace with a real user_id
  'This is a suggestion for improvement',
  'suggestion',
  'new'
);
```

### Test RPC Functions
```sql
-- Test increment_product_view
SELECT increment_product_view('00000000-0000-0000-0000-000000000001');

-- Test increment_upvote
SELECT increment_upvote('00000000-0000-0000-0000-000000000001');

-- Test increment_feedback_points
SELECT increment_feedback_points('00000000-0000-0000-0000-000000000001', 5);
```

---

## Step 8: Environment Variables

Ensure your `.env.local` file includes:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

These are available in your Supabase project settings under **API** → **Project URL** and **Project API keys** → **anon public**.

---

## Step 9: Test Frontend Integration

After deploying the updated code, test:

1. **Submit a product** with the new fields (status, indie flag, feedback focus)
2. **Leave feedback** with different types (issue, suggestion, praise, question)
3. **Mark feedback as done** and verify the 3-point bonus is awarded
4. **Create a collection** and add products to it
5. **Check the dashboard** for feedback points and feedback queue

---

## Troubleshooting

### RPC Functions Not Found
If you get "function not found" errors:
1. Verify the migration ran successfully
2. Check that functions are in the `public` schema
3. Restart your application to refresh the Supabase client

### RLS Policy Blocking Inserts
If you can't insert data:
1. Verify RLS policies are correctly configured
2. Ensure `auth.uid()` matches the user making the request
3. Check that the user is authenticated (not anonymous)

### Columns Not Appearing
If new columns don't show up:
1. Refresh your Supabase dashboard
2. Verify the migration ran without errors
3. Check the **SQL Editor** → **Query History** for any failed statements

---

## Next Steps

1. **Phase 2**: Implement feedback-centric product experience (refactor ProductDetail, add ProductUpdates component)
2. **Phase 3**: Enhance discovery and ranking transparency (improve FeedPage with sort/filter UI)
3. **Phase 4**: Community mechanics (display feedback points on profiles, introduce boosts)

For more details, see the main `README.md` and the audit document.
