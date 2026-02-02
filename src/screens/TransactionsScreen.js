import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWallet } from '../context/WalletContext';
import TransactionCard from '../components/TransactionCard';
import { Search, ArrowLeft, Filter, SlidersHorizontal, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const TransactionsScreen = ({ navigation }) => {
    const { transactions, loading, refreshWallet } = useWallet();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    const filterTransactions = () => {
        return transactions.filter(t => {
            const matchSearch = searchTerm
                ? (t.details?.phone?.includes(searchTerm) ||
                    t.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    t.details?.plan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    t.id.toString().includes(searchTerm))
                : true;

            const matchType = filterType !== 'all' ? t.type === filterType : true;
            const matchStatus = filterStatus !== 'all' ? t.status === filterStatus : true;

            return matchSearch && matchType && matchStatus;
        });
    };

    const filtered = filterTransactions();

    const FilterButton = ({ label, active, onPress }) => (
        <TouchableOpacity
            style={[styles.filterBtn, active && styles.filterBtnActive]}
            onPress={onPress}
        >
            <Text style={[styles.filterBtnText, active && styles.filterBtnTextActive]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <LinearGradient
                colors={['#5C2D91', '#0F172A']}
                style={styles.headerGradient}
            >
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <ArrowLeft color="#FFFFFF" size={24} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Transactions</Text>
                        <TouchableOpacity
                            onPress={() => setShowFilters(!showFilters)}
                            style={[styles.iconBox, showFilters && styles.iconBoxActive]}
                        >
                            <SlidersHorizontal color="#FFFFFF" size={20} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchContainer}>
                        <View style={styles.searchWrapper}>
                            <Search size={18} color="#94A3B8" style={styles.searchIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Search transactions..."
                                placeholderTextColor="#94A3B8"
                                value={searchTerm}
                                onChangeText={setSearchTerm}
                            />
                            {searchTerm.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchTerm('')} style={styles.clearBtn}>
                                    <X size={16} color="#94A3B8" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            {showFilters && (
                <View style={styles.filterArea}>
                    <Text style={styles.filterLabel}>Filter by Type</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                        <FilterButton label="All" active={filterType === 'all'} onPress={() => setFilterType('all')} />
                        <FilterButton label="Fund" active={filterType === 'wallet_fund'} onPress={() => setFilterType('wallet_fund')} />
                        <FilterButton label="Transfer" active={filterType === 'p2p_transfer'} onPress={() => setFilterType('p2p_transfer')} />
                        <FilterButton label="Airtime" active={filterType === 'airtime'} onPress={() => setFilterType('airtime')} />
                        <FilterButton label="Data" active={filterType === 'data'} onPress={() => setFilterType('data')} />
                        <FilterButton label="Bills" active={filterType === 'bill'} onPress={() => setFilterType('bill')} />
                    </ScrollView>

                    <Text style={styles.filterLabel}>Filter by Status</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                        <FilterButton label="All" active={filterStatus === 'all'} onPress={() => setFilterStatus('all')} />
                        <FilterButton label="Success" active={filterStatus === 'success'} onPress={() => setFilterStatus('success')} />
                        <FilterButton label="Pending" active={filterStatus === 'pending'} onPress={() => setFilterStatus('pending')} />
                        <FilterButton label="Failed" active={filterStatus === 'failed'} onPress={() => setFilterStatus('failed')} />
                    </ScrollView>
                </View>
            )}

            <FlatList
                data={filtered}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <TransactionCard transaction={item} />
                )}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Search size={48} color="#CBD5E1" />
                        <Text style={styles.emptyText}>No transactions found</Text>
                        <Text style={styles.emptySubText}>Try adjusting your search or filters</Text>
                    </View>
                }
                onRefresh={refreshWallet}
                refreshing={loading}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    headerGradient: {
        paddingBottom: 20,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 16,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    iconBox: {
        width: 44,
        height: 44,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconBoxActive: {
        backgroundColor: '#5C2D91',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1,
    },
    searchContainer: {
        paddingHorizontal: 24,
        marginTop: 20,
        marginBottom: 10,
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    searchIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: 50,
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '500',
    },
    clearBtn: {
        padding: 8,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 40,
    },
    filterArea: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    filterLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    horizontalScroll: {
        marginBottom: 16,
    },
    filterBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        marginRight: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    filterBtnActive: {
        backgroundColor: 'rgba(92, 45, 145, 0.1)',
        borderColor: '#5C2D91',
    },
    filterBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    filterBtnTextActive: {
        color: '#5C2D91',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
        marginTop: 16,
    },
    emptySubText: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 8,
    }
});

export default TransactionsScreen;
