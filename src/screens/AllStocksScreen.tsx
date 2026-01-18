import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, SearchResult } from '../types';
import { useTheme } from '../context/ThemeContext';
import { searchSymbols } from '../services/api';
import { SPACING, BORDER_RADIUS } from '../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function AllStocksScreen() {
    const { theme, isDark } = useTheme();
    const navigation = useNavigation<NavigationProp>();

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (text: string) => {
        setQuery(text);
        if (text.trim().length > 1) {
            setLoading(true);
            const data = await searchSymbols(text);
            setResults(data.bestMatches || []);
            setLoading(false);
        } else {
            setResults([]);
        }
    };

    const renderItem = ({ item }: { item: SearchResult }) => (
        <TouchableOpacity
            style={[styles.card, { borderBottomColor: theme.border }]}
            onPress={() => navigation.navigate('ProductDetails', {
                ticker: item['1. symbol'],
                name: item['2. name']
            })}>
            <View style={styles.cardInfo}>
                <View style={[styles.avatar, { backgroundColor: theme.surfaceSecondary }]}>
                    <Text style={[styles.avatarText, { color: theme.primary }]}>
                        {item['1. symbol'].substring(0, 1)}
                    </Text>
                </View>
                <View>
                    <Text style={[styles.symbol, { color: theme.text }]}>{item['1. symbol']}</Text>
                    <Text style={[styles.name, { color: theme.textSecondary }]} numberOfLines={1}>{item['2. name']}</Text>
                </View>
            </View>
            <View style={styles.cardMetadata}>
                <Text style={[styles.type, { color: theme.textSecondary }]}>{item['3. type']}</Text>
                <Text style={[styles.region, { color: theme.textSecondary }]}>{item['4. region']}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={{ fontSize: 24, color: theme.text }}>✕</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>All Stocks</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.searchBox}>
                <View style={[styles.searchWrapper, { backgroundColor: theme.surfaceSecondary }]}>
                    <Text style={{ marginRight: 8 }}>🔍</Text>
                    <TextInput
                        style={[styles.input, { color: theme.text }]}
                        placeholder="Search for stocks, indices..."
                        placeholderTextColor={theme.textSecondary}
                        value={query}
                        onChangeText={handleSearch}
                        autoFocus
                    />
                    {loading && <ActivityIndicator color={theme.primary} />}
                </View>
            </View>

            <FlatList
                data={results}
                renderItem={renderItem}
                keyExtractor={(item) => item['1. symbol']}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                            {query.length > 1 ? 'No results found' : 'Type to search for stocks'}
                        </Text>
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
    searchBox: {
        paddingHorizontal: SPACING.md,
        paddingBottom: 16,
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
    },
    list: {
        paddingHorizontal: SPACING.md,
    },
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    cardInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 16,
        fontWeight: '800',
    },
    symbol: {
        fontSize: 15,
        fontWeight: '800',
    },
    name: {
        fontSize: 13,
        fontWeight: '500',
        marginTop: 2,
    },
    cardMetadata: {
        alignItems: 'flex-end',
    },
    type: {
        fontSize: 11,
        fontWeight: '700',
    },
    region: {
        fontSize: 10,
        fontWeight: '500',
        marginTop: 2,
    },
    empty: {
        paddingTop: 100,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        fontWeight: '600',
    }
});
