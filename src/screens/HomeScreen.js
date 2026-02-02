import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, StatusBar, RefreshControl } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import WalletCard from '../components/WalletCard';
import QuickActions from '../components/QuickActions';
import TransactionCard from '../components/TransactionCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, ArrowRight } from 'lucide-react-native';

const HomeScreen = ({ navigation }) => {
    const { user } = useAuth();
    const { transactions, refreshWallet } = useWallet();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await refreshWallet();
        } catch (error) {
            console.error('Refresh failed:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const recentTransactions = transactions.slice(0, 5);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Top Navy Header */}
            <LinearGradient
                colors={['#5C2D91', '#0F172A']}
                style={styles.headerGradient}
            >
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity
                            style={styles.userInfo}
                            onPress={() => navigation.navigate('Profile')}
                            activeOpacity={0.7}
                        >
                            <View style={styles.avatarContainer}>
                                <Text style={styles.avatarText}>
                                    {user?.full_name?.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                            <View style={styles.userTextContainer}>
                                <Text style={styles.greeting}>Good day,</Text>
                                <Text style={styles.userName}>{user?.full_name?.split(' ')[0]}</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={styles.headerActions}>
                            <TouchableOpacity style={styles.iconBtn}>
                                <Bell size={22} color="#FFFFFF" />
                            </TouchableOpacity>
                            <View style={styles.logoBadge}>
                                <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="cover" />
                            </View>
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#5C2D91']} // Android
                        tintColor="#5C2D91" // iOS
                    />
                }
            >
                <View style={styles.walletSection}>
                    <WalletCard navigation={navigation} />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Services</Text>
                    <QuickActions navigation={navigation} />
                </View>

                <View style={[styles.section, styles.transactionsSection]}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Transactions</Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Transactions')}
                            style={styles.seeAllBtn}
                        >
                            <Text style={styles.linkText}>See All</Text>
                            <ArrowRight size={14} color="#5C2D91" style={{ marginLeft: 4 }} />
                        </TouchableOpacity>
                    </View>

                    {recentTransactions.length > 0 ? (
                        <View style={styles.transactionsList}>
                            {recentTransactions.map((t) => (
                                <TransactionCard key={t.id} transaction={t} />
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyCard}>
                            <Image
                                source={require('../../assets/logo.png')}
                                style={[styles.emptyImage, { opacity: 0.1 }]}
                                resizeMode="contain"
                            />
                            <Text style={styles.emptyText}>No activity yet</Text>
                            <Text style={styles.emptySubText}>
                                Your transactions will appear here
                            </Text>
                        </View>
                    )}
                </View>

                {/* Bottom Spacer */}
                <View style={{ height: 40 }} />
            </ScrollView>
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
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    userTextContainer: {
        marginLeft: 12,
    },
    greeting: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    logoBadge: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        overflow: 'hidden',
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    walletSection: {
        marginTop: -10,
        zIndex: 10,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    seeAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    linkText: {
        color: '#5C2D91',
        fontWeight: '700',
        fontSize: 14,
    },
    transactionsSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    transactionsList: {
        marginTop: 10,
    },
    emptyCard: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyImage: {
        width: 60,
        height: 60,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748B',
        marginBottom: 4,
    },
    emptySubText: {
        fontSize: 14,
        color: '#94A3B8',
        textAlign: 'center',
    }
});

export default HomeScreen;
