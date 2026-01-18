import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Stock } from '../types';
import { useTheme } from '../context/ThemeContext';
import { StockCard } from '../components/StockCard';
import { SPACING, FONT_SIZES } from '../constants/theme';

type ViewAllRouteProp = RouteProp<RootStackParamList, 'ViewAll'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ITEMS_PER_PAGE = 10;

export function ViewAllScreen() {
    const { theme } = useTheme();
    const route = useRoute<ViewAllRouteProp>();
    const navigation = useNavigation<NavigationProp>();
    const { title, data } = route.params;

    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentData = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleStockPress = (stock: Stock) => {
        navigation.navigate('ProductDetails', {
            ticker: stock.ticker,
            name: stock.name,
        });
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const renderItem = ({ item }: { item: Stock }) => (
        <View style={styles.cardContainer}>
            <StockCard stock={item} onPress={() => handleStockPress(item)} />
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={{ fontSize: 24, color: theme.text }}>✕</Text>
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>{title}</Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        Page {currentPage} of {totalPages}
                    </Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={currentData}
                renderItem={renderItem}
                keyExtractor={(item, index) => `${item.ticker}-${index}`}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={
                    totalPages > 1 ? (
                        <View style={styles.pagination}>
                            <TouchableOpacity
                                style={[
                                    styles.pageButton,
                                    { backgroundColor: currentPage === 1 ? theme.surfaceSecondary : theme.primary },
                                ]}
                                onPress={handlePreviousPage}
                                disabled={currentPage === 1}>
                                <Text style={[styles.pageButtonText, { color: currentPage === 1 ? theme.textSecondary : '#FFFFFF' }]}>
                                    PREVIOUS
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.pageIndicator}>
                                <Text style={[styles.pageIndicatorText, { color: theme.text }]}>{currentPage}</Text>
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.pageButton,
                                    { backgroundColor: currentPage === totalPages ? theme.surfaceSecondary : theme.primary },
                                ]}
                                onPress={handleNextPage}
                                disabled={currentPage === totalPages}>
                                <Text style={[styles.pageButtonText, { color: currentPage === totalPages ? theme.textSecondary : '#FFFFFF' }]}>
                                    NEXT
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={{ color: theme.textSecondary }}>No stocks to display.</Text>
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
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: 15,
        borderBottomWidth: 0.5,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    subtitle: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 2,
    },
    list: {
        paddingHorizontal: SPACING.md,
        paddingTop: 10,
        paddingBottom: 40,
    },
    cardContainer: {
        marginBottom: 12,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        paddingVertical: 10,
    },
    pageButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        minWidth: 100,
        alignItems: 'center',
    },
    pageButtonText: {
        fontSize: 12,
        fontWeight: '800',
    },
    pageIndicator: {
        paddingHorizontal: 15,
    },
    pageIndicatorText: {
        fontSize: 14,
        fontWeight: '800',
    },
    empty: {
        padding: 60,
        alignItems: 'center',
    },
});
