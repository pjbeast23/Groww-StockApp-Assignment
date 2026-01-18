import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Stock } from '../types';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency, formatPercentage, isGaining } from '../utils/formatters';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

interface StockCardProps {
    stock: Stock;
    onPress?: () => void;
    variant?: 'horizontal' | 'square';
}

export function StockCard({ stock, onPress, variant = 'horizontal' }: StockCardProps) {
    const { theme, isDark } = useTheme();
    const gaining = isGaining(stock.change_percentage);

    if (variant === 'square') {
        return (
            <TouchableOpacity
                style={[
                    styles.squareContainer,
                    {
                        backgroundColor: theme.card,
                        borderColor: isDark ? theme.border : 'transparent',
                        shadowColor: theme.shadow,
                    }
                ]}
                onPress={onPress}
                activeOpacity={0.7}>
                <View style={[styles.squareIconContainer, { backgroundColor: isDark ? '#262626' : '#F8F9FA' }]}>
                    <Text style={[styles.squareIconInitial, { color: theme.primary }]}>{stock.ticker.substring(0, 1)}</Text>
                </View>

                <Text style={[styles.squareTicker, { color: theme.text }]} numberOfLines={1}>
                    {stock.ticker}
                </Text>

                <Text style={[styles.squarePrice, { color: theme.textSecondary }]}>
                    {formatCurrency(stock.price)}
                </Text>

                <View style={[
                    styles.squareBadge,
                    { backgroundColor: gaining ? (isDark ? '#064E3B' : '#ECFDF5') : (isDark ? '#7F1D1D' : '#FEF2F2') },
                    { marginTop: 8 }
                ]}>
                    <Text
                        style={[
                            styles.squarePercentage,
                            { color: gaining ? theme.gain : theme.loss },
                        ]}>
                        {gaining ? '+' : ''}{formatPercentage(stock.change_percentage)}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    backgroundColor: theme.card,
                    borderColor: isDark ? theme.border : 'transparent',
                    shadowColor: theme.shadow,
                }
            ]}
            onPress={onPress}
            activeOpacity={0.7}>
            <View style={[styles.iconContainer, { backgroundColor: isDark ? theme.surface : '#F1F5F9' }]}>
                <Text style={styles.iconInitial}>{stock.ticker.substring(0, 1)}</Text>
            </View>

            <View style={styles.content}>
                <Text style={[styles.ticker, { color: theme.text }]} numberOfLines={1}>
                    {stock.ticker}
                </Text>
                <Text style={[styles.name, { color: theme.textSecondary }]} numberOfLines={1}>
                    {stock.name || stock.ticker}
                </Text>
            </View>

            <View style={styles.priceContainer}>
                <Text style={[styles.price, { color: theme.text }]}>
                    {formatCurrency(stock.price)}
                </Text>
                <View style={[
                    styles.changeBadge,
                    { backgroundColor: gaining ? (isDark ? '#064E3B' : '#ECFDF5') : (isDark ? '#7F1D1D' : '#FEF2F2') }
                ]}>
                    <Text
                        style={[
                            styles.changePercentage,
                            { color: gaining ? theme.gain : theme.loss },
                        ]}>
                        {gaining ? '+' : ''}{formatPercentage(stock.change_percentage)}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        marginBottom: SPACING.md,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    squareContainer: {
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        width: '48%', // Allow 2 per row
        marginBottom: SPACING.md,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        alignItems: 'flex-start',
    },
    squareIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    squareIconInitial: {
        fontSize: 14,
        fontWeight: '800',
        color: '#00D09C',
    },

    squareTicker: {
        fontSize: 14,
        fontWeight: '800',
        marginBottom: 2,
    },
    squarePrice: {
        fontSize: 13,
        fontWeight: '600',
    },
    squareBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    squarePercentage: {
        fontSize: 11,
        fontWeight: '700',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    iconInitial: {
        fontSize: 18,
        fontWeight: '700',
        color: '#00D09C',
    },
    content: {
        flex: 1,
    },
    ticker: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 2,
        letterSpacing: -0.2,
    },
    name: {
        fontSize: 12,
        fontWeight: '500',
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    price: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
        letterSpacing: -0.2,
    },
    changeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    changePercentage: {
        fontSize: 12,
        fontWeight: '700',
    },
});
