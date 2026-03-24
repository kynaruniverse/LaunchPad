import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

export const UpvoteButton = ({ count = 0, upvoted = false, onPress, size = 'md' }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevUpvoted = useRef(upvoted);

  useEffect(() => {
    if (upvoted && !prevUpvoted.current) {
      Animated.sequence([
        Animated.spring(scaleAnim, { toValue: 1.4, useNativeDriver: true, speed: 30 }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20 }),
      ]).start();
    }
    prevUpvoted.current = upvoted;
  }, [upvoted]);

  const isSmall = size === 'sm';

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        upvoted && styles.buttonActive,
        isSmall && styles.buttonSmall,
      ]}
      activeOpacity={0.7}
    >
      <Animated.View style={[styles.inner, { transform: [{ scale: scaleAnim }] }]}>
        <Ionicons
          name={upvoted ? 'rocket' : 'rocket-outline'}
          size={isSmall ? 14 : 16}
          color={upvoted ? theme.colors.accent : theme.colors.text.secondary}
        />
        <Text style={[styles.count, upvoted && styles.countActive, isSmall && styles.countSmall]}>
          {count}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonActive: {
    backgroundColor: theme.colors.accentSoft,
    borderColor: theme.colors.accent,
  },
  buttonSmall: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  count: {
    color: theme.colors.text.secondary,
    fontSize: theme.fonts.sizes.sm,
    fontWeight: theme.fonts.weights.semibold,
  },
  countActive: {
    color: theme.colors.accent,
  },
  countSmall: {
    fontSize: theme.fonts.sizes.xs,
  },
});
