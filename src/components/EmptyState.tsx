import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SPACING, FONT_SIZES } from '../constants/theme';

interface EmptyStateProps {
    title: string;
    message: string;
    icon?: string;
}

export function EmptyState({ title, message, icon = '📭' }: EmptyStateProps) {
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            <Text style={styles.icon}>{icon}</Text>
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
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
    icon: {
        fontSize: 64,
        marginBottom: SPACING.lg,
    },
    title: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '600',
        marginBottom: SPACING.sm,
        textAlign: 'center',
    },
    message: {
        fontSize: FONT_SIZES.md,
        textAlign: 'center',
        lineHeight: 22,
    },
});
