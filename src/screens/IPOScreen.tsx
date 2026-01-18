import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, IPOData } from '../types';
import { useTheme } from '../context/ThemeContext';
import { fetchIPOCalendar } from '../services/api';
import { LoadingState } from '../components/LoadingState';
import { SPACING, BORDER_RADIUS } from '../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function IPOScreen() {
    const { theme, isDark } = useTheme();
    const navigation = useNavigation<NavigationProp>();
    const [loading, setLoading] = useState(true);
    const [ipos, setIpos] = useState<IPOData[]>([]);

    useEffect(() => {
        loadIPOs();
    }, []);

    const loadIPOs = async () => {
        const data = await fetchIPOCalendar();
        setIpos(data);
        setLoading(false);
    };

    const renderItem = ({ item }: { item: IPOData }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => navigation.navigate('ProductDetails', { ticker: item.symbol, name: item.name })}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={[styles.symbol, { color: theme.text }]}>{item.symbol}</Text>
                    <Text style={[styles.name, { color: theme.textSecondary }]} numberOfLines={1}>{item.name}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: theme.surfaceSecondary }]}>
                    <Text style={[styles.badgeText, { color: theme.primary }]}>{item.exchange}</Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <View>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>IPO DATE</Text>
                    <Text style={[styles.value, { color: theme.text }]}>{item.ipoDate}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>PRICE RANGE</Text>
                    <Text style={[styles.value, { color: theme.text }]}>
                        ${item.priceRangeLow} - ${item.priceRangeHigh}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) return <LoadingState message="Fetching IPO Calendar..." />;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={{ fontSize: 24, color: theme.text }}>✕</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Upcoming IPOs</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={ipos}
                renderItem={renderItem}
                keyExtractor={(item) => item.symbol}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={{ color: theme.textSecondary }}>No IPOs scheduled at the moment.</Text>
                    </View>
                }
            />
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
    list: {
        padding: SPACING.md,
    },
    card: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    symbol: {
        fontSize: 16,
        fontWeight: '800',
    },
    name: {
        fontSize: 13,
        fontWeight: '500',
        marginTop: 2,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '800',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    label: {
        fontSize: 10,
        fontWeight: '700',
        marginBottom: 4,
    },
    value: {
        fontSize: 14,
        fontWeight: '700',
    },
    empty: {
        padding: 40,
        alignItems: 'center',
    }
});
