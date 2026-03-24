export const theme = {
  colors: {
    background: '#0A0A0F',
    surface: '#13131A',
    surfaceElevated: '#1C1C26',
    border: '#2A2A3A',
    accent: '#FF5722',
    accentSoft: '#FF572220',
    accentGlow: '#FF572240',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    text: {
      primary: '#F0F0F5',
      secondary: '#9090A8',
      muted: '#5A5A70',
    },
    card: '#13131A',
    overlay: 'rgba(0,0,0,0.7)',
    categories: {
      AI: '#8B5CF6',
      Web: '#3B82F6',
      Mobile: '#06B6D4',
      Productivity: '#22C55E',
      Design: '#EC4899',
      Developer: '#F59E0B',
      Other: '#6B7280',
    },
  },
  fonts: {
    sizes: {
      xs: 11,
      sm: 13,
      md: 15,
      lg: 17,
      xl: 20,
      xxl: 24,
      xxxl: 30,
    },
    weights: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 999,
  },
  shadows: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    accent: {
      shadowColor: '#FF5722',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    },
  },
};

export const CATEGORIES = [
  'All', 'AI', 'Web', 'Mobile', 'Productivity', 'Design', 'Developer', 'Other'
];
