import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types';
import { ExploreScreen } from '../screens/ExploreScreen';
import { WatchlistScreen } from '../screens/WatchlistScreen';
import { useTheme } from '../context/ThemeContext';
import { FONT_SIZES } from '../constants/theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
    const { theme } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.primary,
                tabBarInactiveTintColor: theme.textSecondary,
                tabBarStyle: {
                    backgroundColor: theme.background,
                    borderTopWidth: 1,
                    borderTopColor: theme.border,
                    height: 60,
                    paddingBottom: 10,
                    paddingTop: 5,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                },
            }}>
            <Tab.Screen
                name="Home"
                component={ExploreScreen}
                options={{
                    tabBarIcon: ({ color }) => <TabIcon icon="🏠" color={color} />,
                }}
            />
            <Tab.Screen
                name="Watchlist"
                component={WatchlistScreen}
                options={{
                    tabBarIcon: ({ color }) => <TabIcon icon="⭐" color={color} />,
                }}
            />
        </Tab.Navigator>
    );
}

function TabIcon({ icon, color }: { icon: string; color: string }) {
    return <Text style={{ fontSize: 24, color }}>{icon}</Text>;
}
