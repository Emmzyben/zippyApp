import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, ScrollView, StatusBar, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWallet } from '../context/WalletContext';
import { Wallet as WalletIcon, Send, Plus, CreditCard, ArrowRightLeft, User, ArrowLeft } from 'lucide-react-native';
import { walletService } from '../services/walletService';
import EmailBeneficiarySelector from '../components/EmailBeneficiarySelector';
import { useNotification } from '../context/NotificationContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import PaystackPayment from '../components/payment';

const WalletScreen = () => {
    const { balance, refreshWallet } = useWallet();
    const [fundAmount, setFundAmount] = useState('');
    const { showNotification } = useNotification();
    const { user } = useAuth();
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

    const quickAmounts = [1000, 2000, 5000, 10000];

    // Reset form and refresh wallet on successful payment
    const handlePaymentSuccess = async () => {
        setFundAmount('');
        await refreshWallet();
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={['#5C2D91', '#0F172A']}
                style={styles.headerGradient}
            >
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>My Wallet</Text>
                        <View style={styles.iconBox}>
                            <WalletIcon color="#FFFFFF" size={20} />
                        </View>
                    </View>

                    <View style={styles.balanceInfo}>
                        <Text style={styles.balanceLabel}>Available Balance</Text>
                        <Text style={styles.balanceText}>
                            {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(balance)}
                        </Text>
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
                <View style={styles.formCard}>
                    <View style={styles.labelRow}>
                        <CreditCard size={18} color="#5C2D91" style={{ marginRight: 8 }} />
                        <Text style={styles.label}>Add Funds</Text>
                    </View>

                    <Text style={[styles.label, { marginTop: 0, marginBottom: 12 }]}>Choose Amount</Text>

                    <View style={styles.quickGrid}>
                        {quickAmounts.map(amt => (
                            <TouchableOpacity
                                key={amt}
                                style={[styles.quickBtn, fundAmount === amt.toString() && styles.quickBtnSelected]}
                                onPress={() => setFundAmount(amt.toString())}
                            >
                                <Text style={[styles.quickBtnText, fundAmount === amt.toString() && styles.quickBtnTextSelected]}>
                                    ₦{amt.toLocaleString()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>Or enter custom amount</Text>
                    <View style={styles.inputContainer}>
                        <Text style={styles.currencyPrefix}>₦</Text>
                        <TextInput
                            style={styles.input}
                            value={fundAmount}
                            onChangeText={setFundAmount}
                            keyboardType="numeric"
                            placeholder="0.00"
                            placeholderTextColor="#94A3B8"
                        />
                    </View>

                    {/* Fee Breakdown */}
                    {fundAmount && !isNaN(parseFloat(fundAmount)) && parseFloat(fundAmount) >= 100 && (
                        <View style={styles.feeCard}>
                            <View style={styles.feeRow}>
                                <Text style={styles.feeLabel}>Transaction Fee:</Text>
                                <Text style={styles.feeValue}>
                                    {(() => {
                                        const amount = parseFloat(fundAmount);
                                        const fee = amount < 2500 ? amount * 0.015 : (amount * 0.015) + 100;
                                        return `₦${fee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                                    })()}
                                </Text>
                            </View>
                            <View style={[styles.feeRow, styles.feeRowTotal]}>
                                <Text style={styles.feeLabelTotal}>Amount to Credit:</Text>
                                <Text style={styles.feeValueTotal}>
                                    {(() => {
                                        const amount = parseFloat(fundAmount);
                                        const fee = amount < 2500 ? amount * 0.015 : (amount * 0.015) + 100;
                                        return `₦${(amount - fee).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                                    })()}
                                </Text>
                            </View>
                            <Text style={styles.feeDisclaimer}>
                                * A Paystack processing fee is deducted from your payment.
                            </Text>
                        </View>
                    )}

                    <PaystackPayment
                        amount={fundAmount}
                        onSuccess={handlePaymentSuccess}
                        onCancel={() => { }}
                    />
                </View>

                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>Secure Transactions</Text>
                    <Text style={styles.infoText}>
                        Your transactions are encrypted and monitored for your safety. ZippyPay ensures instant delivery.
                    </Text>
                </View>

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
        paddingBottom: 40,
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
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    iconBox: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    balanceInfo: {
        alignItems: 'center',
        marginTop: 32,
    },
    balanceLabel: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 14,
        marginBottom: 8,
    },
    balanceText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#E2E8F0',
        padding: 4,
        borderRadius: 16,
        marginBottom: 24,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
    },
    activeTab: {
        backgroundColor: '#5C2D91',
        shadowColor: '#5C2D91',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    tabInner: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tabIcon: {
        marginRight: 6,
    },
    tabText: {
        fontWeight: '700',
        color: '#64748B',
        fontSize: 14,
    },
    activeTabText: {
        color: '#FFFFFF',
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 2,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    quickGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    quickBtn: {
        flex: 1,
        minWidth: '45%',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderWidth: 2,
        borderColor: '#F1F5F9',
        borderRadius: 16,
        alignItems: 'center',
    },
    quickBtnSelected: {
        borderColor: '#5C2D91',
        backgroundColor: 'rgba(92, 45, 145, 0.05)',
    },
    quickBtnText: {
        color: '#475569',
        fontWeight: '700',
        fontSize: 15,
    },
    quickBtnTextSelected: {
        color: '#5C2D91',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#F1F5F9',
        paddingHorizontal: 20,
        marginBottom: 24,
        marginTop: 10,
    },
    currencyPrefix: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
        marginRight: 8,
    },
    input: {
        flex: 1,
        height: 60,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    actionBtn: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    btnGradient: {
        paddingVertical: 18,
        alignItems: 'center',
    },
    actionBtnText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    feeCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 16,
        marginBottom: 24,
    },
    feeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    feeRowTotal: {
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        paddingTop: 8,
        marginTop: 4,
    },
    feeLabel: {
        fontSize: 14,
        color: '#64748B',
    },
    feeValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
    },
    feeLabelTotal: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
    },
    feeValueTotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#5C2D91',
    },
    feeDisclaimer: {
        fontSize: 11,
        color: '#94A3B8',
        marginTop: 8,
        fontStyle: 'italic',
    },
    btnDisabled: {
        opacity: 0.7,
    },
    infoCard: {
        marginTop: 24,
        backgroundColor: '#F0FDFA',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#CCFBF1',
    },
    infoTitle: {
        color: '#0F766E',
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 4,
    },
    infoText: {
        color: '#134E4A',
        fontSize: 13,
        lineHeight: 18,
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    infoNote: {
        backgroundColor: '#EFF6FF',
        borderWidth: 1,
        borderColor: '#BFDBFE',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    infoNoteTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#1E40AF',
        marginBottom: 4,
    },
    infoNoteText: {
        fontSize: 12,
        color: '#1E3A8A',
        lineHeight: 18,
    },
    recipientCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    recipientIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EDE9FE',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    recipientInfo: {
        flex: 1,
    },
    recipientName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 2,
    },
    recipientEmail: {
        fontSize: 13,
        color: '#64748B',
    },
});

export default WalletScreen;
