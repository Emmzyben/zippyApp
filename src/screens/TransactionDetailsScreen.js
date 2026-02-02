import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, StatusBar, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWallet } from '../context/WalletContext';
import api from '../services/api';
import { Check, X, Clock, Hash, Calendar, Phone, Wifi, Zap, Tv, Repeat, ArrowLeft, Share2, ShieldCheck, CreditCard } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const TransactionDetailsScreen = ({ route, navigation }) => {
    const { id } = route.params;
    const { transactions } = useWallet();
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const found = transactions.find(t => t.id === parseInt(id));
        if (found) {
            setTransaction(found);
            setLoading(false);
        } else {
            const fetchTx = async () => {
                try {
                    const res = await api.get(`/transactions/${id}`);
                    setTransaction(res.data.transaction);
                } catch (e) {
                    console.log("Error fetching transaction", e);
                } finally {
                    setLoading(false);
                }
            };
            fetchTx();
        }
    }, [id, transactions]);

    const handleShare = async () => {
        try {
            await Share.share({
                message: `ZippyPay Receipt\nTransaction ID: ${transaction.id}\nType: ${transaction.type}\nAmount: ₦${Math.abs(transaction.amount).toLocaleString()}\nStatus: ${transaction.status}`,
            });
        } catch (error) {
            console.log(error.message);
        }
    };

    if (loading) return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color="#5C2D91" />
        </View>
    );

    if (!transaction) return (
        <View style={styles.center}>
            <Text>Transaction not found</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnAlt}>
                <Text style={styles.backBtnText}>Go Back</Text>
            </TouchableOpacity>
        </View>
    );

    const getStatusDetails = (status) => {
        if (status === 'success' || status === 'completed') {
            return { icon: <Check color="#FFFFFF" size={24} />, color: '#10B981', label: 'Successful', bg: '#DCFCE7' };
        }
        if (status === 'failed') {
            return { icon: <X color="#FFFFFF" size={24} />, color: '#EF4444', label: 'Failed', bg: '#FEE2E2' };
        }
        return { icon: <Clock color="#FFFFFF" size={24} />, color: '#F59E0B', label: 'Pending', bg: '#FEF3C7' };
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'airtime': return <Phone size={24} color="#5C2D91" />;
            case 'data': return <Wifi size={24} color="#5C2D91" />;
            case 'wallet_fund': return <CreditCard size={24} color="#5C2D91" />;
            case 'p2p_transfer': return <Repeat size={24} color="#5C2D91" />;
            case 'bill': return transaction.details?.service_type === 'electricity' ? <Zap size={24} color="#5C2D91" /> : <Tv size={24} color="#5C2D91" />;
            default: return <Hash size={24} color="#5C2D91" />;
        }
    };

    const status = getStatusDetails(transaction.status);

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
                        <Text style={styles.headerTitle}>Transaction Details</Text>
                        <TouchableOpacity onPress={handleShare} style={styles.iconBox}>
                            <Share2 color="#FFFFFF" size={20} />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.statusSection}>
                    <View style={[styles.statusIconContainer, { backgroundColor: status.color }]}>
                        {status.icon}
                    </View>
                    <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
                    <Text style={styles.amountText}>₦{Math.abs(transaction.amount).toLocaleString()}</Text>
                    <Text style={styles.dateText}>
                        {new Date(transaction.date || transaction.created_at).toLocaleString('en-US', {
                            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                    </Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        {getTypeIcon(transaction.type)}
                        <Text style={styles.cardTitle}>
                            {transaction.type.toUpperCase().replace('_', ' ')}
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Transaction ID</Text>
                        <Text style={styles.infoValue}>{transaction.id}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Reference</Text>
                        <Text style={styles.infoValue}>{transaction.reference || 'N/A'}</Text>
                    </View>

                    {transaction.phone && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Recipient Phone</Text>
                            <Text style={styles.infoValue}>{transaction.phone}</Text>
                        </View>
                    )}

                    {transaction.network && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Network</Text>
                            <Text style={styles.infoValue}>{transaction.network.toUpperCase()}</Text>
                        </View>
                    )}

                    {transaction.details && Object.entries(transaction.details).map(([key, value]) => (
                        <View key={key} style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{key.replace(/_/g, ' ')}</Text>
                            <Text style={styles.infoValue} numberOfLines={2}>{String(value)}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.trustCard}>
                    <ShieldCheck size={20} color="#059669" />
                    <Text style={styles.trustText}>
                        This transaction is secured by ZippyPay end-to-end encryption.
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => navigation.navigate('MainTabs')}
                >
                    <Text style={styles.actionBtnText}>Back to Home</Text>
                </TouchableOpacity>

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
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    headerGradient: {
        paddingBottom: 24,
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
        fontSize: 20,
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
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 32,
    },
    statusSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    statusIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    statusLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    amountText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 4,
    },
    dateText: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
        marginLeft: 12,
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    infoLabel: {
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    infoValue: {
        fontSize: 14,
        color: '#1E293B',
        fontWeight: '700',
        textAlign: 'right',
        flex: 1,
        marginLeft: 20,
    },
    trustCard: {
        flexDirection: 'row',
        backgroundColor: '#ECFDF5',
        padding: 16,
        borderRadius: 16,
        marginTop: 24,
        borderWidth: 1,
        borderColor: '#D1FAE5',
        alignItems: 'center',
    },
    trustText: {
        flex: 1,
        fontSize: 13,
        color: '#065F46',
        marginLeft: 10,
        lineHeight: 18,
        fontWeight: '500',
    },
    actionBtn: {
        marginTop: 32,
        backgroundColor: '#F1F5F9',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    actionBtnText: {
        color: '#5C2D91',
        fontWeight: 'bold',
        fontSize: 16,
    },
    backBtnAlt: {
        marginTop: 20,
        padding: 10,
    },
    backBtnText: {
        color: '#5C2D91',
        fontWeight: 'bold',
    }
});

export default TransactionDetailsScreen;
