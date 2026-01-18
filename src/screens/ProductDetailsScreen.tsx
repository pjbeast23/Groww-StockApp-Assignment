import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Modal,
    TextInput,
    Alert,
    Image,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { VictoryLine, VictoryChart, VictoryAxis, VictoryTheme } from 'victory-native';
import { RootStackParamList, CompanyOverview, TimeSeriesData, NewsItem, IndicatorData } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useWatchlist } from '../context/WatchlistContext';
import { fetchCompanyOverview, fetchTimeSeriesDaily, fetchMarketNews, fetchSMA } from '../services/api';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { formatCurrency, formatNumber, formatPercentage } from '../utils/formatters';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

type ProductDetailsRouteProp = RouteProp<RootStackParamList, 'ProductDetails'>;

const { width } = Dimensions.get('window');

export function ProductDetailsScreen() {
    const { theme } = useTheme();
    const route = useRoute<ProductDetailsRouteProp>();
    const navigation = useNavigation();
    const { ticker, name } = route.params;

    const {
        watchlists,
        isInWatchlist,
        addToWatchlist,
        removeFromWatchlist,
        createWatchlist,
    } = useWatchlist();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [overview, setOverview] = useState<CompanyOverview | null>(null);
    const [chartData, setChartData] = useState<TimeSeriesData[]>([]);
    const [smaData, setSmaData] = useState<IndicatorData[]>([]);
    const [news, setNews] = useState<NewsItem[]>([]);
    const [showSMA, setShowSMA] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [newWatchlistName, setNewWatchlistName] = useState('');
    const [inWatchlist, setInWatchlist] = useState(false);

    useEffect(() => {
        loadData();
        checkWatchlistStatus();
    }, [ticker]);

    const loadData = async () => {
        try {
            setError(null);
            setLoading(true);

            const [overviewData, timeSeriesData, stockNews, smaPoints] = await Promise.all([
                fetchCompanyOverview(ticker),
                fetchTimeSeriesDaily(ticker),
                fetchMarketNews(ticker),
                fetchSMA(ticker)
            ]);

            setOverview(overviewData);
            setChartData(timeSeriesData.slice(0, 30).reverse());
            setNews(stockNews?.feed?.slice(0, 5) || []);

            // Filter SMA to match chart dates
            const dates = timeSeriesData.slice(0, 30).map(d => d.date);
            setSmaData(smaPoints.filter(p => dates.includes(p.date)).reverse());

        } catch (err) {
            setError('Failed to load stock data. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const checkWatchlistStatus = () => {
        setInWatchlist(isInWatchlist(ticker));
    };

    const handleAddToWatchlist = () => {
        if (watchlists.length === 0) {
            Alert.alert(
                'No Watchlists',
                'Create a watchlist first',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Create', onPress: () => setModalVisible(true) },
                ],
            );
            return;
        }
        setModalVisible(true);
    };

    const handleSelectWatchlist = async (watchlistId: string) => {
        try {
            await addToWatchlist(watchlistId, ticker);
            setModalVisible(false);
            checkWatchlistStatus();
            Alert.alert('Success', 'Added to watchlist');
        } catch (error) {
            Alert.alert('Error', 'Failed to add to watchlist');
        }
    };

    const handleCreateAndAdd = async () => {
        if (!newWatchlistName.trim()) {
            Alert.alert('Error', 'Please enter a watchlist name');
            return;
        }

        try {
            const newWatchlist = await createWatchlist(newWatchlistName.trim());
            await addToWatchlist(newWatchlist.id, ticker);
            setNewWatchlistName('');
            setModalVisible(false);
            checkWatchlistStatus();
            Alert.alert('Success', 'Watchlist created and stock added');
        } catch (error) {
            Alert.alert('Error', 'Failed to create watchlist');
        }
    };

    const handleRemoveFromWatchlist = async () => {
        try {
            const watchlistsWithStock = watchlists.filter(w => w.stocks.includes(ticker));
            for (const watchlist of watchlistsWithStock) {
                await removeFromWatchlist(watchlist.id, ticker);
            }
            checkWatchlistStatus();
            Alert.alert('Success', 'Removed from all watchlists');
        } catch (error) {
            Alert.alert('Error', 'Failed to remove from watchlist');
        }
    };

    const handleNewsPress = (url: string) => {
        Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    };

    if (loading) {
        return <LoadingState message="Loading stock details..." />;
    }

    if (error || !overview) {
        return <ErrorState message={error || 'No data available'} onRetry={loadData} />;
    }

    const chartPoints = chartData.map(d => ({ x: new Date(d.date), y: d.close }));
    const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1].close : 0;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonContainer}>
                    <Text style={[styles.backButton, { color: theme.textSecondary }]}>✕</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTicker, { color: theme.text }]}>{ticker}</Text>
                <TouchableOpacity
                    onPress={inWatchlist ? handleRemoveFromWatchlist : handleAddToWatchlist}
                    style={styles.watchlistButton}>
                    <Text style={[styles.watchlistIcon, { color: inWatchlist ? theme.primary : theme.textSecondary }]}>
                        {inWatchlist ? '★' : '☆'}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Stock Info */}
                <View style={styles.stockInfo}>
                    <View style={styles.nameRow}>
                        <View style={[styles.iconLarge, { backgroundColor: theme.surface }]}>
                            <Text style={styles.iconLargeInitial}>{ticker.substring(0, 1)}</Text>
                        </View>
                        <View style={styles.nameContainer}>
                            <Text style={[styles.stockName, { color: theme.text }]}>
                                {overview.Name || name || ticker}
                            </Text>
                            <Text style={[styles.tickerLabel, { color: theme.textSecondary }]}>
                                {ticker} • {overview.Exchange || 'NASDAQ'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.priceRow}>
                        <Text style={[styles.price, { color: theme.text }]}>
                            {formatCurrency(currentPrice)}
                        </Text>
                        {chartData.length > 1 && (
                            <Text style={[styles.priceChange, { color: currentPrice >= chartData[0].close ? theme.gain : theme.loss }]}>
                                {currentPrice >= chartData[0].close ? '▲' : '▼'} {formatCurrency(Math.abs(currentPrice - chartData[0].close))} ({formatPercentage((currentPrice - chartData[0].close) / chartData[0].close * 100)})
                            </Text>
                        )}
                    </View>
                </View>

                {/* Chart Section */}
                {chartPoints.length > 0 ? (
                    <View style={styles.chartSection}>
                        <View style={styles.indicatorToggleRow}>
                            <Text style={[styles.indicatorLabel, { color: theme.textSecondary }]}>Technical Indicator</Text>
                            <TouchableOpacity
                                style={[styles.indicatorToggle, { backgroundColor: showSMA ? theme.primary : theme.surfaceSecondary }]}
                                onPress={() => setShowSMA(!showSMA)}>
                                <Text style={[styles.indicatorToggleText, { color: showSMA ? '#FFF' : theme.textSecondary }]}>SMA 20</Text>
                            </TouchableOpacity>
                        </View>

                        <VictoryChart
                            width={width}
                            height={220}
                            padding={{ top: 20, bottom: 30, left: 10, right: 10 }}>
                            <VictoryAxis
                                style={{
                                    axis: { stroke: 'transparent' },
                                    tickLabels: { fill: 'transparent' },
                                    grid: { stroke: theme.border, strokeDasharray: '4,4' },
                                }}
                            />
                            <VictoryLine
                                data={chartPoints}
                                interpolation="monotoneX"
                                style={{
                                    data: { stroke: theme.primary, strokeWidth: 3 },
                                }}
                            />
                            {showSMA && smaData.length > 0 && (
                                <VictoryLine
                                    data={smaData.map(p => ({ x: p.date, y: p.value }))}
                                    interpolation="monotoneX"
                                    style={{
                                        data: { stroke: '#FF9500', strokeWidth: 2, strokeDasharray: '5,5' },
                                    }}
                                />
                            )}
                        </VictoryChart>

                        <View style={styles.chartRangeTabs}>
                            {['1D', '1W', '1M', '1Y', 'ALL'].map((range) => (
                                <TouchableOpacity key={range} style={[styles.rangeTab, range === '1M' && { backgroundColor: theme.surface }]}>
                                    <Text style={[styles.rangeTabText, range === '1M' ? { color: theme.primary, fontWeight: '800' } : { color: theme.textSecondary }]}>{range}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ) : (
                    <View style={[styles.chartSection, { height: 150, justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={{ color: theme.textSecondary, textAlign: 'center', paddingHorizontal: 40 }}>
                            Chart data temporarily unavailable (API Rate Limit reached)
                        </Text>
                    </View>
                )}

                {/* Performance Metrics */}
                <View style={styles.statsSection}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Performance</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statBox}>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Low</Text>
                            <Text style={[styles.statValue, { color: theme.text }]}>{formatCurrency(overview['52WeekLow'])}</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>High</Text>
                            <Text style={[styles.statValue, { color: theme.text }]}>{formatCurrency(overview['52WeekHigh'])}</Text>
                        </View>
                    </View>
                </View>

                {/* About Section */}
                <View style={styles.aboutSection}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>About {ticker}</Text>
                    <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={5}>
                        {overview.Description}
                    </Text>
                    <TouchableOpacity style={styles.readMore}>
                        <Text style={{ color: theme.primary, fontWeight: '700' }}>READ MORE</Text>
                    </TouchableOpacity>
                </View>

                {/* Details List */}
                <View style={styles.detailsList}>
                    {[
                        { label: 'Market Cap', value: formatNumber(overview.MarketCapitalization) },
                        { label: 'P/E Ratio', value: overview.PERatio || '-' },
                        { label: 'Dividend Yield', value: overview.DividendYield || '-' },
                        { label: 'Sector', value: overview.Sector || '-' },
                    ].map((item, i) => (
                        <View key={i} style={[styles.detailItem, { borderBottomColor: theme.border }]}>
                            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>{item.label}</Text>
                            <Text style={[styles.detailValue, { color: theme.text }]}>{item.value}</Text>
                        </View>
                    ))}
                </View>

                {/* About Section */}
                {overview.Description && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>About {overview.Name}</Text>
                        <Text style={[styles.aboutText, { color: theme.textSecondary }]} numberOfLines={6}>
                            {overview.Description}
                        </Text>
                    </View>
                )}

                {/* News Section */}
                {news.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent News</Text>
                        {news.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.newsItem, { borderBottomColor: theme.border }]}
                                onPress={() => handleNewsPress(item.url)}>
                                <View style={styles.newsRow}>
                                    <View style={styles.newsText}>
                                        <Text style={[styles.newsSource, { color: theme.primary }]}>{item.source}</Text>
                                        <Text style={[styles.newsTitleSmall, { color: theme.text }]} numberOfLines={2}>{item.title}</Text>
                                        <Text style={[styles.newsMeta, { color: theme.textSecondary }]}>
                                            {item.overall_sentiment_label} • {new Date(item.time_published.replace(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/, '$1-$2-$3T$4:$5:$6')).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    {item.banner_image && (
                                        <Image source={{ uri: item.banner_image }} style={styles.newsThumb} />
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Action Buttons (Groww Style) */}
            <View style={[styles.actionFooter, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.surface, flex: 1, marginRight: 12 }]}>
                    <Text style={[styles.actionButtonText, { color: theme.text }]}>SELL</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.primary, flex: 2 }]}>
                    <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>BUY</Text>
                </TouchableOpacity>
            </View>

            {/* Watchlist Selection Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Add to Watchlist</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text style={{ fontSize: 24, color: theme.textSecondary }}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.watchlistList}>
                            {watchlists.map(watchlist => (
                                <TouchableOpacity
                                    key={watchlist.id}
                                    style={[
                                        styles.watchlistOption,
                                        { backgroundColor: theme.surface, borderColor: theme.border },
                                    ]}
                                    onPress={() => handleSelectWatchlist(watchlist.id)}>
                                    <View>
                                        <Text style={[styles.watchlistOptionText, { color: theme.text }]}>{watchlist.name}</Text>
                                        <Text style={[styles.watchlistOptionCount, { color: theme.textSecondary }]}>{watchlist.stocks.length} items</Text>
                                    </View>
                                    <Text style={[styles.chevron, { color: theme.primary }]}>+</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={styles.createNew}>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: theme.surface,
                                        color: theme.text,
                                        borderColor: theme.border,
                                    },
                                ]}
                                placeholder="Create new watchlsit..."
                                placeholderTextColor={theme.textSecondary}
                                value={newWatchlistName}
                                onChangeText={setNewWatchlistName}
                            />
                            <TouchableOpacity
                                style={[styles.createButton, { backgroundColor: theme.primary }]}
                                onPress={handleCreateAndAdd}>
                                <Text style={styles.createButtonText}>CREATE & ADD</Text>
                            </TouchableOpacity>
                        </View>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
    },
    backButtonContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    backButton: {
        fontSize: 22,
        fontWeight: '300',
    },
    headerTicker: {
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 1,
    },
    watchlistButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    watchlistIcon: {
        fontSize: 24,
    },
    scrollView: {
        flex: 1,
    },
    stockInfo: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.lg,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    iconLarge: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    iconLargeInitial: {
        fontSize: 24,
        fontWeight: '800',
        color: '#00D09C',
    },
    nameContainer: {
        flex: 1,
    },
    stockName: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    tickerLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    priceRow: {
        marginTop: SPACING.xs,
    },
    price: {
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -1,
    },
    priceChange: {
        fontSize: 14,
        fontWeight: '700',
        marginTop: 4,
    },
    chartSection: {
        marginVertical: SPACING.md,
    },
    chartRangeTabs: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.md,
        marginTop: SPACING.md,
    },
    rangeTab: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    rangeTabText: {
        fontSize: 13,
        fontWeight: '700',
    },
    statsSection: {
        padding: SPACING.md,
        marginTop: SPACING.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: SPACING.md,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statBox: {
        flex: 1,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '800',
    },
    aboutSection: {
        padding: SPACING.md,
    },
    description: {
        fontSize: 14,
        lineHeight: 22,
        fontWeight: '500',
    },
    readMore: {
        marginTop: 8,
    },
    detailsList: {
        padding: SPACING.md,
    },
    detailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    detailLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '800',
    },
    actionFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        padding: SPACING.md,
        paddingBottom: 34, // Safe area
        borderTopWidth: 1,
    },
    actionButton: {
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '800',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: SPACING.lg,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    watchlistList: {
        marginBottom: SPACING.lg,
    },
    watchlistOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12,
    },
    watchlistOptionText: {
        fontSize: 16,
        fontWeight: '800',
    },
    watchlistOptionCount: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 2,
    },
    chevron: {
        fontSize: 28,
        fontWeight: '400',
    },
    createNew: {
        marginTop: SPACING.sm,
    },
    input: {
        height: 52,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: SPACING.md,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    createButton: {
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
    },
    indicatorToggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        marginBottom: 10,
    },
    indicatorLabel: {
        fontSize: 11,
        fontWeight: '700',
    },
    indicatorToggle: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    indicatorToggleText: {
        fontSize: 10,
        fontWeight: '800',
    },
    section: {
        marginTop: 24,
        paddingHorizontal: SPACING.md,
    },
    aboutText: {
        fontSize: 13,
        lineHeight: 20,
        marginTop: 12,
    },
    newsItem: {
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    newsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    newsText: {
        flex: 1,
        paddingRight: 12,
    },
    newsSource: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    newsTitleSmall: {
        fontSize: 13,
        fontWeight: '700',
        lineHeight: 18,
        marginBottom: 4,
    },
    newsMeta: {
        fontSize: 10,
        fontWeight: '600',
    },
    newsThumb: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
});
