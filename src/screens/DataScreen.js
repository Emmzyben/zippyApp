import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NetworkSelector from '../components/NetworkSelector';
import { vtuService } from '../services/vtuService';
import { useWallet } from '../context/WalletContext';
import PhoneBeneficiarySelector from '../components/PhoneBeneficiarySelector';
import { useNotification } from '../context/NotificationContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Wifi, ArrowLeft, ChevronRight, Check } from 'lucide-react-native';

const DataScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [loadingPlans, setLoadingPlans] = useState(false);
    const { balance, refreshWallet } = useWallet();
    const { showNotification } = useNotification();
    const [dataPlans, setDataPlans] = useState([]);

    const [formData, setFormData] = useState({
        network: '',
        phone: '',
        variation_code: '',
        amount: 0,
        planName: ''
    });

    const [activeTab, setActiveTab] = useState('Monthly');

    useEffect(() => {
        if (formData.network) {
            loadDataPlans(formData.network);
        }
    }, [formData.network]);

    const loadDataPlans = async (network) => {
        setLoadingPlans(true);
        setDataPlans([]); // Clear old plans
        setFormData(prev => ({ ...prev, variation_code: '', amount: 0, planName: '' }));
        try {
            const serviceMap = {
                mtn: 'mtn-data',
                glo: 'glo-data',
                airtel: 'airtel-data',
                etisalat: 'etisalat-data',
            };
            const serviceID = serviceMap[network];

            const response = await vtuService.getVariations(serviceID);
            const variations = response.content?.variations || [];

            const plans = variations.map((v) => ({
                id: v.variation_code,
                name: v.name,
                price: parseFloat(v.variation_amount),
                variation_code: v.variation_code,
                amount: parseFloat(v.variation_amount),
            })).sort((a, b) => a.amount - b.amount);

            setDataPlans(plans);
        } catch (error) {
            showNotification('error', 'Error', 'Failed to load data plans');
            setDataPlans([]);
        } finally {
            setLoadingPlans(false);
        }
    };

    const handleBuyData = async () => {
        if (!formData.network) return showNotification('error', 'Selection Required', 'Please select a network');
        if (!formData.phone || formData.phone.length < 11) return showNotification('error', 'Invalid Phone', 'Enter a valid 11-digit phone number');
        if (!formData.variation_code) return showNotification('error', 'Selection Required', 'Please select a data plan');

        if (formData.amount > balance) {
            return showNotification('error', 'Insufficient Balance', 'Please fund your wallet first.');
        }

        setLoading(true);
        try {
            const response = await vtuService.buyData({
                network: formData.network,
                phone: formData.phone,
                variation_code: formData.variation_code,
                amount: formData.amount
            });

            await refreshWallet();

            if (response.success || response.status === 'success') {
                showNotification('success', 'Purchase Successful', `${formData.planName} data sent to ${formData.phone}`);
                navigation.goBack();
            } else if (response.status === 'pending') {
                showNotification('info', 'Transaction Pending', 'Your data request is being processed.');
                navigation.goBack();
            } else {
                showNotification('error', 'Transaction Failed', response.error || 'Unable to complete purchase');
            }
        } catch (error) {
            showNotification('error', 'Error', error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
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
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <ArrowLeft color="#FFFFFF" size={24} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Buy Data</Text>
                        <View style={styles.iconBox}>
                            <Wifi color="#FFFFFF" size={20} />
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Select Network</Text>
                    <NetworkSelector
                        selectedNetwork={formData.network}
                        onSelect={(id) => setFormData({ ...formData, network: id })}
                    />
                </View>

                <View style={[styles.card, { paddingBottom: 10 }]}>
                    <View style={styles.fieldGroup}>
                        <Text style={styles.inputLabel}>Phone Number</Text>
                        <PhoneBeneficiarySelector
                            value={formData.phone}
                            onSelect={(text) => setFormData({ ...formData, phone: text })}
                            onAdd={() => { }}
                        />
                    </View>
                </View>

                {/* Validity Filter Tabs */}
                <View style={styles.tabContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {['Daily', 'Weekly', 'Monthly', 'Special Plans'].map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                style={[
                                    styles.tabItem,
                                    activeTab === tab && styles.tabItemActive
                                ]}
                                onPress={() => setActiveTab(tab)}
                            >
                                <Text style={[
                                    styles.tabText,
                                    activeTab === tab && styles.tabTextActive
                                ]}>{tab}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.section}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.sectionTitle}>Available Plans</Text>
                        {loadingPlans && <ActivityIndicator color="#5C2D91" size="small" />}
                    </View>

                    {!formData.network ? (
                        <View style={styles.emptyState}>
                            <Wifi size={40} color="#CBD5E1" />
                            <Text style={styles.emptyText}>Select a network to view plans</Text>
                        </View>
                    ) : loadingPlans ? (
                        <View style={styles.loadingState}>
                            <Text style={styles.loadingText}>Fetching available bundles...</Text>
                        </View>
                    ) : (
                        <View>
                            {dataPlans.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyText}>No data plans found for this network</Text>
                                </View>
                            ) : (
                                dataPlans
                                    .filter(plan => {
                                        const name = plan.name.toLowerCase();
                                        const getDays = (n) => {
                                            if (n.includes('month')) {
                                                const m = n.match(/(\d+)\s*month/);
                                                return m ? parseInt(m[1]) * 30 : 30;
                                            }
                                            if (n.includes('week')) {
                                                const w = n.match(/(\d+)\s*week/);
                                                return w ? parseInt(w[1]) * 7 : 7;
                                            }
                                            const d = n.match(/(\d+)\s*day/);
                                            if (d) return parseInt(d[1]);
                                            return null;
                                        };

                                        const days = getDays(name);
                                        if (activeTab === 'Daily') return days !== null && days >= 1 && days <= 5;
                                        if (activeTab === 'Weekly') return days !== null && days > 5 && days <= 7;
                                        if (activeTab === 'Monthly') return days !== null && days > 7;
                                        if (activeTab === 'Special Plans') return days === null;
                                        return true;
                                    })
                                    .map(plan => (
                                        <TouchableOpacity
                                            key={plan.id}
                                            style={[
                                                styles.planCard,
                                                formData.variation_code === plan.variation_code && styles.planCardSelected
                                            ]}
                                            onPress={() => setFormData({
                                                ...formData,
                                                variation_code: plan.variation_code,
                                                amount: plan.amount,
                                                planName: plan.name
                                            })}
                                        >
                                            <View style={styles.planInfo}>
                                                <Text style={[styles.planName, formData.variation_code === plan.variation_code && styles.planTextSelected]}>
                                                    {plan.name}
                                                </Text>
                                                <Text style={[styles.planPrice, formData.variation_code === plan.variation_code && styles.planPriceSelected]}>
                                                    ₦{plan.price.toLocaleString()}
                                                </Text>
                                            </View>
                                            {formData.variation_code === plan.variation_code && (
                                                <View style={styles.checkBadge}>
                                                    <Check size={14} color="#FFFFFF" />
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    ))
                            )}
                        </View>
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.bottomAction}>
                <LinearGradient
                    colors={['rgba(255,255,255,0.9)', '#FFFFFF']}
                    style={styles.actionGradient}
                >
                    <TouchableOpacity
                        style={[styles.submitBtn, (loading || !formData.variation_code) && styles.disabledBtn]}
                        onPress={handleBuyData}
                        disabled={loading || !formData.variation_code}
                    >
                        <LinearGradient
                            colors={['#7C3AED', '#5C2D91']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.btnGradient}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.btnText}>
                                    {formData.variation_code ? `Pay ₦${formData.amount.toLocaleString()}` : 'Select a Plan'}
                                </Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 16,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
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
        marginBottom: 24,
    },
    fieldGroup: {
        marginBottom: 12,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 12,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#F1F5F9',
        borderStyle: 'dashed',
    },
    emptyText: {
        marginTop: 12,
        color: '#94A3B8',
        fontSize: 14,
    },
    loadingState: {
        padding: 20,
        alignItems: 'center',
    },
    loadingText: {
        color: '#64748B',
        fontSize: 14,
    },
    planCard: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    planCardSelected: {
        borderColor: '#5C2D91',
        backgroundColor: 'rgba(92, 45, 145, 0.02)',
    },
    planInfo: {
        flex: 1,
    },
    planName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 4,
    },
    planPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#5C2D91',
    },
    planTextSelected: {
        color: '#5C2D91',
    },
    planPriceSelected: {
        color: '#5C2D91',
    },
    checkBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#5C2D91',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomAction: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    actionGradient: {
        padding: 10,
        borderRadius: 24,
    },
    submitBtn: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    btnGradient: {
        paddingVertical: 18,
        alignItems: 'center',
    },
    btnText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    disabledBtn: {
        opacity: 0.7,
    },
    tabContainer: {
        marginBottom: 20,
    },
    tabItem: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#F1F5F9',
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    tabItemActive: {
        backgroundColor: '#5C2D91',
        borderColor: '#5C2D91',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748B',
    },
    tabTextActive: {
        color: '#FFFFFF',
    },
});

export default DataScreen;
