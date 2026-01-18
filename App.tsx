import React from 'react';
import { StatusBar } from 'react-native';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { WatchlistProvider } from './src/context/WatchlistContext';
import { RootNavigator } from './src/navigation/RootNavigator';

import { SafeAreaProvider } from 'react-native-safe-area-context';

function AppContent() {
    const { isDark } = useTheme();

    return (
        <SafeAreaProvider>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor="transparent"
                translucent={true}
            />
            <WatchlistProvider>
                <RootNavigator />
            </WatchlistProvider>
        </SafeAreaProvider>
    );
}

export default function App() {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
}
