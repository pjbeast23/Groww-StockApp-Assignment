import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../context/ThemeContext';
import { SPACING, BORDER_RADIUS } from '../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MOCK_FO = [
    { ticker: 'NIFTY 18 JAN 24500 CE', price: '142.05', change: '+24.15', changePerc: '20.47%', gaining: true },
    { ticker: 'NIFTY 18 JAN 24500 PE', price: '86.40', change: '-45.10', changePerc: '34.28%', gaining: false },
    { ticker: 'BANKNIFTY 18 JAN 52500 CE', price: '342.10', change: '+12.50', changePerc: '3.79%', gaining: true },
    { ticker: 'RELIANCE JAN FUT', price: '2986.50', change: '+14.20', changePerc: '0.47%', gaining: true },
    { ticker: 'HDFCBANK JAN FUT', price: '1642.00', change: '-8.45', changePerc: '0.51%', gaining: false },
];

export function FOScreen() {
    const { theme, isDark } = useTheme();
    const navigation = useNavigation<NavigationProp>();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={{ fontSize: 24, color: theme.text }}>✕</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Futures & Options</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={[styles.infoBanner, { backgroundColor: isDark ? '#262626' : '#F1F5F9' }]}>
                    <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                        Futures and Options allow you to trade on the future price of stocks and indices.
                    </Text>
                </View>

                <Text style={[styles.sectionTitle, { color: theme.text }]}>Trending Contracts</Text>

                {MOCK_FO.map((item, i) => (
                    <TouchableOpacity
                        key={i}
                        style={[styles.card, { borderBottomColor: theme.border }]}
                        onPress={() => { }}>
                        <View style={styles.cardLeft}>
                            <Text style={[styles.ticker, { color: theme.text }]}>{item.ticker}</Text>
                        </View>
                        <View style={styles.cardRight}>
                            <Text style={[styles.price, { color: theme.text }]}>₹{item.price}</Text>
                            <Text style={[styles.change, { color: item.gaining ? theme.gain : theme.loss }]}>
                                {item.change} ({item.changePerc})
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}

                <View style={styles.ctaContainer}>
                    <View style={[styles.lockIcon, { backgroundColor: theme.surfaceSecondary }]}>
                        <Text style={{ fontSize: 20 }}>🔒</Text>
                    </View>
                    <Text style={[styles.ctaTitle, { color: theme.text }]}>F&O Trading is Locked</Text>
                    <Text style={[styles.ctaDesc, { color: theme.textSecondary }]}>
                        Complete your KYC and enable F&O segment to start trading in derivatives.
                    </Text>
                    <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]}>
                        <Text style={styles.btnText}>ACTIVATE F&O</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.md,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    content: {
        padding: SPACING.md,
    },
    infoBanner: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    infoText: {
        fontSize: 13,
        lineHeight: 18,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 16,
    },
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    cardLeft: {
        flex: 1,
    },
    cardRight: {
        alignItems: 'flex-end',
    },
    ticker: {
        fontSize: 14,
        fontWeight: '700',
    },
    price: {
        fontSize: 14,
        fontWeight: '800',
        marginBottom: 2,
    },
    change: {
        fontSize: 12,
        fontWeight: '600',
    },
    ctaContainer: {
        marginTop: 40,
        alignItems: 'center',
        padding: 24,
    },
    lockIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    ctaTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 8,
    },
    ctaDesc: {
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 24,
    },
    btn: {
        width: '100%',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    btnText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 14,
    }
});
