import React, { useState } from 'react';
import {
    View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { vtuService } from '../services/vtuService';
import { useWallet } from '../context/WalletContext';
import TokenModal from '../components/TokenModal';
import { useNotification } from '../context/NotificationContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Lightbulb, ArrowLeft, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react-native';

const ElectricityScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const { refreshWallet, balance } = useWallet();
    const { showNotification } = useNotification();

    // State
    const [selectedProvider, setSelectedProvider] = useState("");
    const [selectedMeterType, setSelectedMeterType] = useState("");
    const [meterVerified, setMeterVerified] = useState(false);
    const [customerInfo, setCustomerInfo] = useState(null);
    const [verifying, setVerifying] = useState(false);
    const [showTokenModal, setShowTokenModal] = useState(false);
    const [token, setToken] = useState("");

    const [formData, setFormData] = useState({
        accountNumber: "",
        amount: "",
        phone: "",
    });

    const providers = [
        { id: "abuja-electric", name: "AEDC (Abuja)" },
        { id: "eko-electric", name: "EKEDC (Eko)" },
        { id: "ikeja-electric", name: "IKEDC (Ikeja)" },
        { id: "portharcourt-electric", name: "PHEDC (Port Harcourt)" },
    ];

    const handleVerify = async () => {
        if (!formData.accountNumber) return showNotification('error', 'Error', 'Please enter your meter number');
        setVerifying(true);
        try {
            const res = await vtuService.verifyMeter({
                serviceID: selectedProvider,
                billersCode: formData.accountNumber,
                type: selectedMeterType
            });
            if (res && (res.content?.Customer_Name || res.Customer_Name)) {
                setCustomerInfo(res.content || res);
                setMeterVerified(true);
                showNotification('success', 'Verified', 'Meter details validated successfully');
            } else {
                showNotification('error', 'Failed', 'Could not verify meter number');
            }
        } catch (error) {
            showNotification('error', 'Error', error.message);
        } finally {
            setVerifying(false);
        }
    };

    const handlePay = async () => {
        if (!formData.amount || parseFloat(formData.amount) < 100) {
            showNotification('error', 'Error', 'Minimum amount is ₦100');
            return;
        }
        if (parseFloat(formData.amount) > balance) {
            showNotification('error', 'Insufficient Balance', 'Please fund your wallet first.');
            return;
        }

        setLoading(true);
        try {
            const res = await vtuService.payBill({
                serviceID: selectedProvider,
                billersCode: formData.accountNumber,
                variation_code: selectedMeterType,
                amount: parseFloat(formData.amount),
                phone: formData.phone
            });

            await refreshWallet();

            if (res.success || res.status === 'success') {
                if (selectedMeterType === 'prepaid' && res.token) {
                    setToken(res.token);
                    setShowTokenModal(true);
                } else {
                    showNotification('success', 'Payment Successful', 'Your electricity bill has been paid.');
                    navigation.goBack();
                }
            } else {
                showNotification('error', 'Payment Failed', res.error || "Transaction failed");
            }
        } catch (error) {
            showNotification('error', 'Error', error.message);
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
                        <Text style={styles.headerTitle}>Electricity</Text>
                        <View style={styles.iconBox}>
                            <Lightbulb color="#FFFFFF" size={20} />
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {!selectedProvider ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Select Provider</Text>
                        {providers.map(p => (
                            <TouchableOpacity
                                key={p.id}
                                style={styles.providerCard}
                                onPress={() => setSelectedProvider(p.id)}
                            >
                                <Text style={styles.providerText}>{p.name}</Text>
                                <ChevronRight size={20} color="#94A3B8" />
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : !selectedMeterType ? (
                    <View style={styles.section}>
                        <View style={styles.rowBetween}>
                            <Text style={styles.sectionTitle}>Select Meter Type</Text>
                            <TouchableOpacity onPress={() => setSelectedProvider("")}>
                                <Text style={styles.linkText}>Change Provider</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.providerCard} onPress={() => setSelectedMeterType("prepaid")}>
                            <Text style={styles.providerText}>Prepaid Meter</Text>
                            <ChevronRight size={20} color="#94A3B8" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.providerCard} onPress={() => setSelectedMeterType("postpaid")}>
                            <Text style={styles.providerText}>Postpaid Meter</Text>
                            <ChevronRight size={20} color="#94A3B8" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.formArea}>
                        <View style={styles.rowBetween}>
                            <View>
                                <Text style={styles.providerLabel}>Provider</Text>
                                <Text style={styles.providerValue}>
                                    {providers.find(p => p.id === selectedProvider)?.name} ({selectedMeterType})
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => { setSelectedMeterType(""); setMeterVerified(false); }}
                                style={styles.changeBadge}
                            >
                                <Text style={styles.changeBadgeText}>Change</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.card}>
                            {!meterVerified ? (
                                <View>
                                    <Text style={styles.inputLabel}>Meter Number</Text>
                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            style={styles.input}
                                            value={formData.accountNumber}
                                            onChangeText={t => setFormData({ ...formData, accountNumber: t })}
                                            placeholder="Enter meter number"
                                            placeholderTextColor="#94A3B8"
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <TouchableOpacity
                                        style={[styles.verifyBtn, verifying && styles.disabledBtn]}
                                        onPress={handleVerify}
                                        disabled={verifying}
                                    >
                                        <LinearGradient
                                            colors={['#7C3AED', '#5C2D91']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.btnGradient}
                                        >
                                            {verifying ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verify Meter</Text>}
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            ) : customerInfo && (
                                <View style={styles.verifiedBox}>
                                    <View style={styles.verifiedHeader}>
                                        <CheckCircle2 size={18} color="#10B981" />
                                        <Text style={styles.verifiedTitle}>Validated Details</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Name:</Text>
                                        <Text style={styles.detailValue}>{customerInfo.Customer_Name}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Address:</Text>
                                        <Text style={styles.detailValue}>{customerInfo.Address}</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => setMeterVerified(false)}
                                        style={styles.reVerifyBtn}
                                    >
                                        <Text style={styles.reVerifyText}>Use another number</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {meterVerified && (
                                <View style={styles.paymentFields}>
                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.inputLabel}>Amount (₦)</Text>
                                        <View style={styles.inputContainer}>
                                            <TextInput
                                                style={styles.input}
                                                value={formData.amount}
                                                onChangeText={t => setFormData({ ...formData, amount: t })}
                                                keyboardType="numeric"
                                                placeholder="Min ₦100"
                                                placeholderTextColor="#94A3B8"
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.inputLabel}>Contact Phone</Text>
                                        <View style={styles.inputContainer}>
                                            <TextInput
                                                style={styles.input}
                                                value={formData.phone}
                                                onChangeText={t => setFormData({ ...formData, phone: t })}
                                                keyboardType="phone-pad"
                                                placeholder="Enter phone number"
                                                placeholderTextColor="#94A3B8"
                                            />
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        style={[styles.payBtn, loading && styles.disabledBtn]}
                                        onPress={handlePay}
                                        disabled={loading}
                                    >
                                        <LinearGradient
                                            colors={['#7C3AED', '#5C2D91']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.btnGradient}
                                        >
                                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Pay Now</Text>}
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        <View style={styles.warningCard}>
                            <AlertCircle size={16} color="#B45309" />
                            <Text style={styles.warningText}>
                                Ensure your meter details are correct before payment. Electricity tokens for prepaid meters will be shown after payment.
                            </Text>
                        </View>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>

            <TokenModal
                visible={showTokenModal}
                token={token}
                onClose={() => {
                    setShowTokenModal(false);
                    navigation.goBack();
                }}
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
    linkText: {
        color: '#5C2D91',
        fontWeight: '700',
    },
    providerCard: {
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
    },
    providerText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
    },
    formArea: {
        marginTop: 8,
    },
    providerLabel: {
        fontSize: 14,
        color: '#64748B',
    },
    providerValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0F172A',
    },
    changeBadge: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    changeBadgeText: {
        color: '#5C2D91',
        fontWeight: '700',
        fontSize: 12,
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
    inputLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 8,
    },
    inputContainer: {
        backgroundColor: '#F8FAFC',
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#F1F5F9',
        marginBottom: 16,
    },
    input: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#1E293B',
        fontWeight: '600',
    },
    btnGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        borderRadius: 14,
    },
    btnText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    disabledBtn: {
        opacity: 0.7,
    },
    verifyBtn: {
        borderRadius: 14,
        overflow: 'hidden',
    },
    verifiedBox: {
        backgroundColor: '#F0FDF4',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#DCFCE7',
        marginBottom: 20,
    },
    verifiedHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    verifiedTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#166534',
        marginLeft: 8,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    detailLabel: {
        color: '#166534',
        width: 70,
        fontSize: 13,
    },
    detailValue: {
        color: '#166534',
        fontWeight: 'bold',
        flex: 1,
        fontSize: 13,
    },
    reVerifyBtn: {
        marginTop: 12,
        alignSelf: 'flex-start',
    },
    reVerifyText: {
        color: '#166534',
        textDecorationLine: 'underline',
        fontSize: 13,
    },
    paymentFields: {
        marginTop: 8,
    },
    fieldGroup: {
        marginBottom: 4,
    },
    payBtn: {
        borderRadius: 14,
        overflow: 'hidden',
        marginTop: 12,
    },
    warningCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFBEB',
        padding: 16,
        borderRadius: 16,
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#FEF3C7',
    },
    warningText: {
        flex: 1,
        fontSize: 13,
        color: '#92400E',
        marginLeft: 10,
        lineHeight: 18,
    }
});

export default ElectricityScreen;
