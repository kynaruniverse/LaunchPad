export const CATEGORIES = [
  'All', 'AI', 'Web', 'Mobile', 'Productivity', 'Design', 'Developer', 'Other'
]

export const CATEGORY_COLORS = {
  AI:           '#8B5CF6',
  Web:          '#3B82F6',
  Mobile:       '#06B6D4',
  Productivity: '#22C55E',
  Design:       '#EC4899',
  Developer:    '#F59E0B',
  Other:        '#6B7280',
}

// Lifecycle stage of a product
export const LAUNCH_STATUSES = [
  { value: 'idea',   label: 'Idea',   emoji: '💡', color: '#8B5CF6', desc: 'Just an idea, looking for early thoughts' },
  { value: 'mvp',    label: 'MVP',    emoji: '🛠️', color: '#F59E0B', desc: 'Minimum viable product, rough around the edges' },
  { value: 'beta',   label: 'Beta',   emoji: '🧪', color: '#3B82F6', desc: 'In testing, most features work' },
  { value: 'live',   label: 'Live',   emoji: '🚀', color: '#22C55E', desc: 'Fully launched and available' },
  { value: 'sunset', label: 'Sunset', emoji: '🌅', color: '#6B7280', desc: 'No longer actively maintained' },
]

export const LAUNCH_STATUS_MAP = Object.fromEntries(
  LAUNCH_STATUSES.map(s => [s.value, s])
)

// Areas a maker wants feedback on
export const FEEDBACK_FOCUS_OPTIONS = [
  { value: 'usability',   label: 'Usability' },
  { value: 'onboarding',  label: 'Onboarding' },
  { value: 'pricing',     label: 'Pricing' },
  { value: 'bugs',        label: 'Bugs' },
  { value: 'design',      label: 'Design' },
  { value: 'performance', label: 'Performance' },
  { value: 'features',    label: 'Feature ideas' },
  { value: 'general',     label: 'General feedback' },
]
