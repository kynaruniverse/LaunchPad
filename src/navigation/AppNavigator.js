import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

import { FeedScreen } from '../screens/FeedScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { SubmitProductScreen } from '../screens/SubmitProductScreen';
import { MakerDashboardScreen } from '../screens/MakerDashboardScreen';
import { CollectionsScreen } from '../screens/CollectionsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const FeedStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Feed" component={FeedScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
  </Stack.Navigator>
);

const DashboardStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Dashboard" component={MakerDashboardScreen} />
    <Stack.Screen name="Submit" component={SubmitProductScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
  </Stack.Navigator>
);

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const tabs = [
    { name: 'FeedTab', icon: 'home', label: 'Discover' },
    { name: 'CollectionsTab', icon: 'albums', label: 'Collections' },
    { name: 'SubmitTab', icon: 'add-circle', label: '', isAction: true },
    { name: 'DashboardTab', icon: 'bar-chart', label: 'Dashboard' },
    { name: 'ProfileTab', icon: 'person', label: 'Profile' },
  ];

  return (
    <View style={tabStyles.container}>
      {state.routes.map((route, index) => {
        const tab = tabs[index];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (tab.isAction) {
          return (
            <TouchableOpacity key={route.key} style={tabStyles.actionBtn} onPress={onPress} activeOpacity={0.85}>
              <View style={tabStyles.actionBtnInner}>
                <Ionicons name="add" size={28} color="#fff" />
              </View>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity key={route.key} style={tabStyles.tab} onPress={onPress} activeOpacity={0.7}>
            <Ionicons
              name={isFocused ? tab.icon : `${tab.icon}-outline`}
              size={22}
              color={isFocused ? theme.colors.accent : theme.colors.text.muted}
            />
            <Text style={[tabStyles.label, isFocused && tabStyles.labelActive]}>
              {tab.label}
            </Text>
            {isFocused && <View style={tabStyles.indicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export const AppNavigator = () => (
  <NavigationContainer>
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="FeedTab" component={FeedStack} />
      <Tab.Screen name="CollectionsTab" component={CollectionsScreen} />
      <Tab.Screen name="SubmitTab" component={SubmitProductScreen} />
      <Tab.Screen name="DashboardTab" component={DashboardStack} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} />
    </Tab.Navigator>
  </NavigationContainer>
);

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: 24,
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    position: 'relative',
  },
  label: {
    color: theme.colors.text.muted,
    fontSize: 10,
    fontWeight: theme.fonts.weights.medium,
  },
  labelActive: {
    color: theme.colors.accent,
    fontWeight: theme.fonts.weights.bold,
  },
  indicator: {
    position: 'absolute',
    top: -10,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.accent,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    ...theme.shadows.accent,
  },
});
