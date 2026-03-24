import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { theme } from '../theme';

export const LoadingSpinner = ({ message = 'Loading...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    );
  }
  return (
    <View style={styles.inline}>
      <ActivityIndicator size="small" color={theme.colors.accent} />
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inline: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  message: {
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
    fontSize: theme.fonts.sizes.md,
  },
});
