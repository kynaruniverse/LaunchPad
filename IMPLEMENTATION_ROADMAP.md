# LaunchPad Implementation Roadmap

This document maps your audit requirements to the implementation phases and tracks progress.

---

## Phase 1: Data + Basic Wiring ✅ (COMPLETE)

**Goal:** LaunchPad understands the new concepts and can store/show them.

### Completed Tasks

- [x] **Supabase Schema Updates**
  - [x] Add `is_indie`, `team_size`, `feedback_focus` to `products` table
  - [x] Add `type`, `feedback_status` to `comments` table
  - [x] Create `product_updates` table
  - [x] Create `collections` and `collection_items` tables
  - [x] Create `notifications` table
  - [x] Create RPC functions: `increment_product_view`, `increment_upvote`, `decrement_upvote`, `increment_feedback_points`, `award_done_bonus`

- [x] **Service Layer Updates**
  - [x] Update `productsService.getFeed()` with enhanced filtering (category, sort, range, isIndieOnly, launchStatus)
  - [x] Update `productsService.submitProduct()` to accept new fields
  - [x] Update `commentsService.addComment()` to accept and store `type`
  - [x] Update `commentsService.updateFeedbackStatus()` with bonus point logic
  - [x] Align RPC parameter names across services

- [x] **UI/Component Updates**
  - [x] `ProductCard` already displays status, indie flag, feedback focus
  - [x] `CommentSection` refactored to support typed feedback and status management
  - [x] `SubmitPage` already includes all Phase 1 fields

### Files Modified
- `migration.sql` (new)
- `src/services/products.js`
- `src/services/comments.js`
- `src/services/votes.js`
- `src/components/CommentSection.jsx`

### Next: Phase 2

---

## Phase 2: Feedback-Centric Product Experience ⏳ (IN PROGRESS)

**Goal:** Makers can ask for specific feedback, receive it, and show progress.

### Tasks

- [ ] **ProductDetailPage Enhancements**
  - [ ] Add top meta panel with:
    - [ ] Status (Idea/MVP/etc)
    - [ ] Indie/team info
    - [ ] Feedback focus ("Looking for feedback on onboarding and pricing")
  - [ ] Integrate `ProductUpdates` component below feedback section
  - [ ] Add changelog composer for makers to post new updates

- [ ] **New Components**
  - [ ] Create `ProductUpdates.jsx` component
    - [ ] Display list of product updates (changelog)
    - [ ] Show update type (feature/fix/announcement/update)
    - [ ] Show author and timestamp
  - [ ] Create `UpdateComposer.jsx` component
    - [ ] Product selector (for makers with multiple products)
    - [ ] Type selector (feature/fix/announcement/update)
    - [ ] Title and body inputs
    - [ ] Submit button

- [ ] **Service Layer**
  - [ ] `productUpdatesService` already exists; ensure it's used correctly
  - [ ] Add `getProductUpdates(productId)` calls in ProductDetailPage

- [ ] **Dashboard Updates**
  - [ ] Add "Feedback Queue" tab showing recent comments
  - [ ] Add quick status update controls (New → Planned → In Progress → Done)
  - [ ] Add "Post Update" tab with `UpdateComposer`

### Estimated Effort: 4-6 hours

### Next: Phase 3

---

## Phase 3: Discovery + Ranking Transparency ⏳ (PENDING)

**Goal:** Users understand why things are ranked the way they are, and they can control how they browse.

### Tasks

- [ ] **FeedPage Enhancements**
  - [ ] Add sort bar with buttons:
    - [ ] Trending (formula: `(upvotes * 3 + comments * 2) / (1 + age_in_days)`)
    - [ ] Pure leaderboard (upvotes only)
    - [ ] Newest (created_at desc)
  - [ ] Add time range selector:
    - [ ] Today
    - [ ] This week
    - [ ] Evergreen (all time)
  - [ ] Add Indie-only toggle
  - [ ] Add ranking explainer tooltip

- [ ] **Reusable Components**
  - [ ] `TrendingBadge` already exists in Dashboard; reuse in FeedPage
  - [ ] Create `RankingExplainer` component with formula and explanation

- [ ] **Service Integration**
  - [ ] `productsService.getFeed()` already supports all filters
  - [ ] Ensure trending_score is calculated and persisted

- [ ] **UI/UX**
  - [ ] Make sort/filter controls prominent and intuitive
  - [ ] Show active filters clearly
  - [ ] Provide visual feedback for selected options

### Estimated Effort: 3-4 hours

### Next: Phase 4

---

## Phase 4: Community & Boosts ⏳ (PENDING)

**Goal:** Turn LaunchPad into a place where helping others actually helps you.

### Tasks

- [ ] **Feedback Points Display**
  - [ ] Show on user profiles:
    - [ ] "You've helped improve N products"
    - [ ] "Feedback points: X"
  - [ ] Show on dashboard:
    - [ ] Total feedback points earned
    - [ ] Breakdown by contribution type

- [ ] **Boost Logic (Optional for v1)**
  - [ ] Add small, capped boost to trending score for engaged makers
  - [ ] Introduce "Community Boost" feed showing products from engaged makers
  - [ ] **Key rule:** Explain boosts in UI so trust stays high

- [ ] **Notifications System**
  - [ ] Create `NotificationsPage` (already exists)
  - [ ] Integrate notification creation on:
    - [ ] Product upvote
    - [ ] Comment on product
    - [ ] Follow user (if implemented)
  - [ ] Add notification bell to Navbar with unread count

- [ ] **Profile Enhancements**
  - [ ] Display feedback_points on user profiles
  - [ ] Show "Feedback given" and "Feedback received" stats
  - [ ] Link to user's feedback contributions

### Estimated Effort: 5-7 hours

---

## Trust & Transparency Features (Ongoing)

**Goal:** "People trust LaunchPad's rules, rankings, and moderation more than Product Hunt's."

### Implemented

- [x] Ranking transparency: Formula shown in UI
- [x] Multiple ranking options: Trending, Pure, Newest
- [x] Clear status labels: Idea, MVP, Beta, Live, Sunset
- [x] Indie flag: Solo makers clearly identified

### To Implement

- [ ] Moderation guidelines: Write clear, specific guidelines
- [ ] Appeals process: Provide path for users to contest decisions
- [ ] Data respect: Support email/social login with clear security settings
- [ ] Email preferences: Easy unsubscribe and notification controls

---

## Database Maintenance

### Monitoring

- [ ] Set up alerts for:
  - [ ] RLS policy violations
  - [ ] RPC function errors
  - [ ] Slow queries (trending_score calculation)

- [ ] Regular backups:
  - [ ] Enable automated backups in Supabase
  - [ ] Test restore procedures

### Optimization

- [ ] Monitor query performance
- [ ] Consider materialized view for trending_score if calculation becomes slow
- [ ] Archive old notifications and product updates

---

## Testing Checklist

### Phase 1 Testing
- [ ] Submit product with all new fields (status, indie, team_size, feedback_focus)
- [ ] Verify fields are stored in database
- [ ] Verify ProductCard displays all new badges
- [ ] Leave comment with different types (issue, suggestion, praise, question)
- [ ] Verify comment type is stored and displayed
- [ ] Mark comment as done and verify bonus points awarded

### Phase 2 Testing
- [ ] Create product update (changelog entry)
- [ ] Verify update appears on ProductDetailPage
- [ ] Verify maker can post update from dashboard
- [ ] Verify feedback queue shows recent comments
- [ ] Verify quick status update works

### Phase 3 Testing
- [ ] Sort feed by Trending, Pure, Newest
- [ ] Filter by time range (Today, This Week, Evergreen)
- [ ] Toggle Indie-only filter
- [ ] Verify trending score calculation is correct
- [ ] Verify ranking explainer is clear and helpful

### Phase 4 Testing
- [ ] Verify feedback_points increment on comment
- [ ] Verify bonus points awarded when marking as done
- [ ] Verify feedback_points display on profile
- [ ] Verify notifications are created and displayed
- [ ] Verify notification bell shows unread count

---

## Deployment Checklist

### Before Going Live

- [ ] Run full test suite
- [ ] Test on mobile and desktop
- [ ] Verify all RLS policies are working
- [ ] Backup production database
- [ ] Test rollback procedure
- [ ] Brief team on new features

### Monitoring Post-Launch

- [ ] Monitor error logs
- [ ] Check database performance
- [ ] Gather user feedback
- [ ] Fix bugs quickly
- [ ] Plan Phase 2 improvements based on feedback

---

## Success Metrics

### Phase 1
- Makers can submit products with status and feedback focus
- Comments are typed and tracked
- Feedback points are awarded

### Phase 2
- Makers post regular updates (changelog)
- Product detail page clearly shows feedback requests
- Dashboard helps makers manage feedback

### Phase 3
- Users understand ranking logic
- Discovery options increase engagement
- Indie-only filter gets regular use

### Phase 4
- Feedback points incentivize quality contributions
- Community engagement increases
- User retention improves

---

## Notes

- All code changes are tracked in Git with descriptive commit messages
- SQL migrations are idempotent (safe to re-run)
- RLS policies ensure data security
- Performance indexes are in place for common queries

For detailed setup instructions, see `SUPABASE_SETUP.md`.
