import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SPACING, FONT_SIZES } from '../constants/theme';

interface ErrorStateProps {
    title?: string;
    message: string;
    onRetry?: () => void;
}

export function ErrorState({
    title = 'Oops!',
    message,
    onRetry,
}: ErrorStateProps) {
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            <Text style={styles.icon}>⚠️</Text>
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
            <Text style={[styles.message, { color: theme.textSecondary }]}>
                {message}
            </Text>
            {onRetry && (
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.primary }]}
                    onPress={onRetry}>
                    <Text style={styles.buttonText}>Try Again</Text>
                </TouchableOpacity>
            )}
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
    },
    message: {
        fontSize: FONT_SIZES.md,
        textAlign: 'center',
        marginBottom: SPACING.lg,
        lineHeight: 22,
    },
    button: {
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
    },
});
