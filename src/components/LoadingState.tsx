import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SPACING, FONT_SIZES } from '../constants/theme';

interface LoadingStateProps {
    message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.message, { color: theme.textSecondary }]}>
                {message}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    message: {
        fontSize: FONT_SIZES.md,
        marginTop: SPACING.md,
    },
});
