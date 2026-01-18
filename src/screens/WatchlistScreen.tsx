import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Watchlist, SearchResult } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useWatchlist } from '../context/WatchlistContext';
import { searchSymbols } from '../services/api';
import { EmptyState } from '../components/EmptyState';
import { LoadingState } from '../components/LoadingState';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function WatchlistScreen() {
    const { theme, toggleTheme, isDark } = useTheme();
    const navigation = useNavigation<NavigationProp>();
    const { watchlists, loading, createWatchlist: createWatchlistService, deleteWatchlist } = useWatchlist();

    const [modalVisible, setModalVisible] = useState(false);
    const [newWatchlistName, setNewWatchlistName] = useState('');

    // Search State (consistent header)
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.trim().length > 1) {
                handleSearch(searchQuery.trim());
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleSearch = async (query: string) => {
        setIsSearching(true);
        try {
            const data = await searchSymbols(query);
            setSearchResults(data.bestMatches || []);
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleCreateWatchlist = async () => {
        if (!newWatchlistName.trim()) {
            Alert.alert('Error', 'Please enter a watchlist name');
            return;
        }

        try {
            await createWatchlistService(newWatchlistName.trim());
            setNewWatchlistName('');
            setModalVisible(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to create watchlist');
        }
    };

    const handleDeleteWatchlist = (watchlist: Watchlist) => {
        Alert.alert(
            'Delete Watchlist',
            `Are you sure you want to delete "${watchlist.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteWatchlist(watchlist.id),
                },
            ],
        );
    };

    const handleSearchResultPress = (result: SearchResult) => {
        setSearchQuery('');
        setSearchResults([]);
        navigation.navigate('ProductDetails', {
            ticker: result['1. symbol'],
            name: result['2. name'],
        });
    };

    const renderWatchlistItem = ({ item }: { item: Watchlist }) => (
        <TouchableOpacity
            style={[styles.watchlistItem, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => console.log('Edit watchlist:', item.id)}
            onLongPress={() => handleDeleteWatchlist(item)}>
            <View style={styles.watchlistContent}>
                <Text style={[styles.watchlistName, { color: theme.text }]}>
                    {item.name}
                </Text>
                <Text style={[styles.stockCount, { color: theme.textSecondary }]}>
                    {item.stocks.length} {item.stocks.length === 1 ? 'stock' : 'stocks'}
                </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: theme.surfaceSecondary }]}>
                <Text style={[styles.badgeText, { color: theme.primary }]}>VIEW</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return <LoadingState message="Connecting to Groww..." />;
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Consistent Groww Header */}
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <View style={[styles.profileAvatar, { backgroundColor: isDark ? '#333' : '#E5E7EB' }]}>
                    <Text style={{ fontSize: 12 }}>👤</Text>
                </View>

                <View style={[styles.searchWrapper, { backgroundColor: theme.surfaceSecondary }]}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={[styles.searchInput, { color: theme.text }]}
                        placeholder="Search for stocks to add..."
                        placeholderTextColor={theme.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {isSearching && <ActivityIndicator size="small" color={theme.primary} />}
                </View>

                <TouchableOpacity
                    style={[styles.themeToggle, { backgroundColor: isDark ? '#FFF' : '#000' }]}
                    onPress={toggleTheme}>
                    <Text style={[styles.themeToggleText, { color: isDark ? '#000' : '#FFF' }]}>
                        {isDark ? 'LIGHT' : 'DARK'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Search Results Overlay */}
            {searchResults.length > 0 && (
                <View style={[styles.resultsOverlay, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                    <FlatList
                        data={searchResults}
                        keyExtractor={(item) => item['1. symbol']}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.resultItem, { borderBottomColor: theme.border }]}
                                onPress={() => handleSearchResultPress(item)}>
                                <Text style={[styles.resultSymbol, { color: theme.text }]}>{item['1. symbol']}</Text>
                                <Text style={[styles.resultName, { color: theme.textSecondary }]} numberOfLines={1}>{item['2. name']}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}

            <View style={styles.titleSection}>
                <Text style={[styles.pageTitle, { color: theme.text }]}>My Watchlists</Text>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: theme.surfaceSecondary }]}
                    onPress={() => setModalVisible(true)}>
                    <Text style={[styles.addButtonText, { color: theme.primary }]}>+ CREATE</Text>
                </TouchableOpacity>
            </View>

            {watchlists.length === 0 ? (
                <EmptyState
                    title="No Watchlists Yet"
                    message="Track your favorite stocks in one place."
                    icon="⭐"
                />
            ) : (
                <FlatList
                    data={watchlists}
                    renderItem={renderWatchlistItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                />
            )}

            {/* Create Watchlist Modal - High Quality */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Create New Watchlist</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text style={{ fontSize: 24, color: theme.textSecondary }}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: theme.surfaceSecondary,
                                    color: theme.text,
                                    borderColor: theme.border,
                                },
                            ]}
                            placeholder="e.g. Bluechip Stocks"
                            placeholderTextColor={theme.textSecondary}
                            value={newWatchlistName}
                            onChangeText={setNewWatchlistName}
                            autoFocus
                        />

                        <TouchableOpacity
                            style={[styles.createButton, { backgroundColor: theme.primary }]}
                            onPress={handleCreateWatchlist}>
                            <Text style={styles.createButtonText}>CREATE WATCHLIST</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingTop: 10,
        paddingBottom: 15,
        borderBottomWidth: 0.5,
    },
    profileAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    searchWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        paddingHorizontal: 12,
        height: 38,
    },
    searchIcon: {
        fontSize: 12,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 13,
        fontWeight: '500',
    },
    themeToggle: {
        marginLeft: 10,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
    },
    themeToggleText: {
        fontSize: 10,
        fontWeight: '800',
    },
    titleSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: 20,
    },
    pageTitle: {
        fontSize: 22,
        fontWeight: '800',
    },
    addButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addButtonText: {
        fontSize: 12,
        fontWeight: '800',
    },
    list: {
        paddingHorizontal: SPACING.md,
    },
    watchlistItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    watchlistContent: {
        flex: 1,
    },
    watchlistName: {
        fontSize: 17,
        fontWeight: '800',
        marginBottom: 4,
    },
    stockCount: {
        fontSize: 13,
        fontWeight: '500',
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '800',
    },
    resultsOverlay: {
        position: 'absolute',
        top: 60,
        left: SPACING.md,
        right: SPACING.md,
        maxHeight: 300,
        borderRadius: 12,
        zIndex: 1000,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    resultItem: {
        padding: 15,
        borderBottomWidth: 0.5,
    },
    resultSymbol: {
        fontSize: 14,
        fontWeight: '800',
    },
    resultName: {
        fontSize: 12,
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 30,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    input: {
        height: 56,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 20,
    },
    createButton: {
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
    },
});
