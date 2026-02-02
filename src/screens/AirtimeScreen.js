import React, { useState } from 'react';
import {
    View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NetworkSelector from '../components/NetworkSelector';
import { vtuService } from '../services/vtuService';
import { useWallet } from '../context/WalletContext';
import PhoneBeneficiarySelector from '../components/PhoneBeneficiarySelector';
import { useNotification } from '../context/NotificationContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Smartphone, ArrowLeft, ShieldCheck } from 'lucide-react-native';

const AirtimeScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const { balance, refreshWallet } = useWallet();
    const { showNotification } = useNotification();
    const [formData, setFormData] = useState({
        network: '',
        phone: '',
        amount: ''
    });

    const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

    const handleBuyAirtime = async () => {
        if (!formData.network) return showNotification('error', 'Selection Required', 'Please select a network provider');
        if (!formData.phone || formData.phone.length < 11) return showNotification('error', 'Invalid Phone', 'Enter a valid 11-digit phone number');
        if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) < 50) return showNotification('error', 'Invalid Amount', 'Enter an amount of at least ₦50');

        if (parseFloat(formData.amount) > balance) {
            return showNotification('error', 'Insufficient Balance', 'Please fund your wallet first.');
        }

        setLoading(true);
        try {
            const response = await vtuService.buyAirtime({
                network: formData.network,
                phone: formData.phone,
                amount: parseFloat(formData.amount)
            });

            await refreshWallet();

            if (response.status === 'success' || response.status === 'pending') {
                showNotification('success', 'Purchase Successful', `₦${formData.amount} airtime sent to ${formData.phone}`);
                navigation.goBack();
            } else {
                showNotification('error', 'Transaction Failed', 'Unable to complete your request. Please try again.');
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
                        <Text style={styles.headerTitle}>Buy Airtime</Text>
                        <View style={styles.iconBox}>
                            <Smartphone color="#FFFFFF" size={20} />
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

                <View style={styles.card}>
                    <View style={styles.fieldGroup}>
                        <Text style={styles.inputLabel}>Phone Number</Text>
                        <PhoneBeneficiarySelector
                            value={formData.phone}
                            onSelect={(text) => setFormData({ ...formData, phone: text })}
                            onAdd={() => { }}
                        />
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.inputLabel}>Choose Amount</Text>
                        <View style={styles.quickGrid}>
                            {quickAmounts.map((amt) => (
                                <TouchableOpacity
                                    key={amt}
                                    style={[
                                        styles.quickBtn,
                                        formData.amount === amt.toString() && styles.quickBtnSelected
                                    ]}
                                    onPress={() => setFormData({ ...formData, amount: amt.toString() })}
                                >
                                    <Text style={[
                                        styles.quickBtnText,
                                        formData.amount === amt.toString() && styles.quickBtnTextSelected
                                    ]}>₦{amt.toLocaleString()}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.inputLabel}>Or enter custom amount</Text>
                        <View style={styles.inputContainer}>
                            <Text style={styles.currencyPrefix}>₦</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0.00"
                                placeholderTextColor="#94A3B8"
                                keyboardType="numeric"
                                value={formData.amount}
                                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitBtn, loading && styles.disabledBtn]}
                        onPress={handleBuyAirtime}
                        disabled={loading}
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
                                <Text style={styles.btnText}>Purchase Airtime</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={styles.infoCard}>
                    <ShieldCheck size={18} color="#059669" />
                    <Text style={styles.infoText}>
                        ZippyPay ensures instant airtime delivery. For network delays, please wait a few minutes or contact support.
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
    fieldGroup: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 12,
    },
    quickGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 16,
    },
    quickBtn: {
        flex: 1,
        minWidth: '30%',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#F1F5F9',
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    quickBtnSelected: {
        backgroundColor: 'rgba(92, 45, 145, 0.05)',
        borderColor: '#5C2D91',
    },
    quickBtnText: {
        color: '#64748B',
        fontSize: 14,
        fontWeight: '700',
    },
    quickBtnTextSelected: {
        color: '#5C2D91',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#F1F5F9',
        paddingHorizontal: 16,
    },
    currencyPrefix: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
        marginRight: 8,
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 18,
        color: '#1E293B',
        fontWeight: 'bold',
    },
    submitBtn: {
        borderRadius: 14,
        overflow: 'hidden',
        marginTop: 8,
    },
    btnGradient: {
        paddingVertical: 16,
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
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#ECFDF5',
        padding: 16,
        borderRadius: 16,
        marginTop: 24,
        borderWidth: 1,
        borderColor: '#D1FAE5',
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#065F46',
        marginLeft: 10,
        lineHeight: 18,
    }
});

export default AirtimeScreen;
