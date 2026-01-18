import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { COLORS } from '../constants/theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
    theme: typeof COLORS.light;
    themeMode: ThemeMode;
    toggleTheme: () => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = '@stock_app_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
    const systemColorScheme = useColorScheme();
    const [themeMode, setThemeMode] = useState<ThemeMode>(
        systemColorScheme === 'dark' ? 'dark' : 'light',
    );

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_KEY);
            if (savedTheme) {
                setThemeMode(savedTheme as ThemeMode);
            }
        } catch (error) {
            console.error('Error loading theme:', error);
        }
    };

    const toggleTheme = async () => {
        try {
            const newTheme = themeMode === 'light' ? 'dark' : 'light';
            setThemeMode(newTheme);
            await AsyncStorage.setItem(THEME_KEY, newTheme);
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    const theme = themeMode === 'light' ? COLORS.light : COLORS.dark;
    const isDark = themeMode === 'dark';

    return (
        <ThemeContext.Provider value={{ theme, themeMode, toggleTheme, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}
