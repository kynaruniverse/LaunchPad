import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TextInput, TouchableOpacity, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AuthForm = ({ onSuccess }) => {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const toast = useToast();

  const handleSubmit = async () => {
    if (!email || !password) { toast.error('Email and password required'); return; }
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
        toast.success('Welcome back!');
      } else {
        if (!username) { toast.error('Username required'); setLoading(false); return; }
        await signUp(email, password, username, fullName);
        toast.success('Account created! Check your email.');
      }
    } catch (e) {
      toast.error(e.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.authContainer}>
        <Text style={styles.authLogo}>🚀</Text>
        <Text style={styles.authTitle}>LaunchPad</Text>
        <Text style={styles.authSubtitle}>
          {mode === 'signin' ? 'Welcome back' : 'Join the community'}
        </Text>

        <View style={styles.authTabs}>
          <TouchableOpacity
            style={[styles.authTab, mode === 'signin' && styles.authTabActive]}
            onPress={() => setMode('signin')}
          >
            <Text style={[styles.authTabText, mode === 'signin' && styles.authTabTextActive]}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.authTab, mode === 'signup' && styles.authTabActive]}
            onPress={() => setMode('signup')}
          >
            <Text style={[styles.authTabText, mode === 'signup' && styles.authTabTextActive]}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {mode === 'signup' && (
          <>
            <TextInput
              style={styles.authInput}
              placeholder="Full Name"
              placeholderTextColor={theme.colors.text.muted}
              value={fullName}
              onChangeText={setFullName}
            />
            <TextInput
              style={styles.authInput}
              placeholder="Username"
              placeholderTextColor={theme.colors.text.muted}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </>
        )}

        <TextInput
          style={styles.authInput}
          placeholder="Email"
          placeholderTextColor={theme.colors.text.muted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.authInput}
          placeholder="Password"
          placeholderTextColor={theme.colors.text.muted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.authSubmitBtn, loading && styles.authSubmitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.authSubmitBtnText}>
            {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export const ProfileScreen = ({ navigation }) => {
  const { user, profile, signOut } = useAuth();
  const toast = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out');
    } catch (e) {
      toast.error('Failed to sign out');
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <AuthForm />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
          <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(profile?.username || user.email || 'U')[0].toUpperCase()}
            </Text>
          </View>
          <Text style={styles.username}>{profile?.username || 'User'}</Text>
          <Text style={styles.email}>{user.email}</Text>
          {profile?.bio && <Text style={styles.bio}>{profile.bio}</Text>}
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          {[
            { icon: 'grid-outline', label: 'My Dashboard', onPress: () => navigation.navigate('Dashboard') },
            { icon: 'bookmark-outline', label: 'Collections', onPress: () => navigation.navigate('Collections') },
            { icon: 'notifications-outline', label: 'Notifications', onPress: () => navigation.navigate('Notifications') },
            { icon: 'settings-outline', label: 'Settings', onPress: () => {} },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={styles.menuItem} onPress={item.onPress}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}>
                  <Ionicons name={item.icon} size={18} color={theme.colors.accent} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.text.muted} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.signOutBtnFull} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={18} color={theme.colors.error} />
          <Text style={styles.signOutBtnFullText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 52,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: { color: theme.colors.text.primary, fontSize: theme.fonts.sizes.xl, fontWeight: theme.fonts.weights.bold },
  signOutBtn: { padding: 8 },
  scroll: { padding: theme.spacing.lg, gap: 20, paddingBottom: 100 },
  profileHeader: { alignItems: 'center', gap: 8, paddingVertical: theme.spacing.xl },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.accent + '40',
  },
  avatarText: { color: theme.colors.accent, fontSize: 32, fontWeight: theme.fonts.weights.bold },
  username: { color: theme.colors.text.primary, fontSize: theme.fonts.sizes.xl, fontWeight: theme.fonts.weights.bold },
  email: { color: theme.colors.text.muted, fontSize: theme.fonts.sizes.sm },
  bio: { color: theme.colors.text.secondary, fontSize: theme.fonts.sizes.sm, textAlign: 'center' },
  menu: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { color: theme.colors.text.primary, fontSize: theme.fonts.sizes.md },
  signOutBtnFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.error + '40',
    backgroundColor: theme.colors.error + '10',
  },
  signOutBtnFullText: { color: theme.colors.error, fontWeight: theme.fonts.weights.semibold },
  // Auth styles
  authContainer: { padding: theme.spacing.xl, gap: 14 },
  authLogo: { fontSize: 48, textAlign: 'center' },
  authTitle: { color: theme.colors.text.primary, fontSize: theme.fonts.sizes.xxl, fontWeight: theme.fonts.weights.extrabold, textAlign: 'center' },
  authSubtitle: { color: theme.colors.text.secondary, textAlign: 'center', marginBottom: 8 },
  authTabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  authTab: { flex: 1, paddingVertical: 10, borderRadius: theme.radius.sm, alignItems: 'center' },
  authTabActive: { backgroundColor: theme.colors.accent },
  authTabText: { color: theme.colors.text.muted, fontWeight: theme.fonts.weights.medium },
  authTabTextActive: { color: '#fff', fontWeight: theme.fonts.weights.bold },
  authInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: theme.colors.text.primary,
    fontSize: theme.fonts.sizes.md,
  },
  authSubmitBtn: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    ...theme.shadows.accent,
  },
  authSubmitBtnDisabled: { opacity: 0.6 },
  authSubmitBtnText: { color: '#fff', fontWeight: theme.fonts.weights.bold, fontSize: theme.fonts.sizes.md },
});
