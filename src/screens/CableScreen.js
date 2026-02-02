import React, { useState } from 'react';
import {
    View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { vtuService } from '../services/vtuService';
import { useWallet } from '../context/WalletContext';
import { useNotification } from '../context/NotificationContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Tv, ArrowLeft, ChevronRight, CheckCircle2, CreditCard, Info } from 'lucide-react-native';

const CableScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const { refreshWallet, balance } = useWallet();
    const { showNotification } = useNotification();

    // State
    const [selectedProvider, setSelectedProvider] = useState("");
    const [step, setStep] = useState("provider"); // provider, verify, options, payment
    const [formData, setFormData] = useState({ accountNumber: "", amount: "", phone: "" });
    const [verificationData, setVerificationData] = useState(null);
    const [variations, setVariations] = useState([]);
    const [selectedVariation, setSelectedVariation] = useState("");
    const [subscriptionType, setSubscriptionType] = useState(""); // renew or change

    const providers = [
        { id: "dstv", name: "DStv", type: "subscription" },
        { id: "gotv", name: "GOtv", type: "subscription" },
        { id: "startimes", name: "StarTimes", type: "subscription" },
        { id: "showmax", name: "Showmax", type: "subscription" },
    ];

    const handleProviderSelect = async (provider) => {
        setSelectedProvider(provider);
        if (provider === "dstv" || provider === "gotv") {
            setStep("verify");
        } else if (provider === "startimes" || provider === "showmax") {
            setLoading(true);
            try {
                const res = await vtuService.getVariations(provider);
                if (res.response_description === "000" || res.content?.variations) {
                    setVariations(res.content?.variations || []);
                    setSubscriptionType("change");
                    setStep("payment");
                } else {
                    throw new Error("Failed to load plans");
                }
            } catch (e) {
                showNotification('error', 'Error', 'Failed to load subscription options');
            } finally {
                setLoading(false);
            }
        } else {
            setStep("payment");
        }
    };

    const handleVerify = async () => {
        if (!formData.accountNumber) return showNotification('error', 'Error', 'Enter smartcard number');
        setLoading(true);
        try {
            const res = await vtuService.verifySmartcard({
                serviceID: selectedProvider,
                billersCode: formData.accountNumber
            });
            if (res.code === "000" || res.content?.Customer_Name) {
                setVerificationData(res.content || res);
                setStep("options");
                showNotification('success', 'Verified', 'Smartcard details validated');
            } else {
                showNotification('error', 'Validation Failed', 'Smartcard validation failed');
            }
        } catch (e) {
            showNotification('error', 'Error', e.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePay = async () => {
        if (parseFloat(formData.amount || 0) > balance) {
            return showNotification('error', 'Insufficient Balance', 'Please fund your wallet first.');
        }

        setLoading(true);
        try {
            const payload = {
                serviceID: selectedProvider,
                billersCode: formData.accountNumber,
                amount: parseFloat(formData.amount),
                phone: formData.phone
            };

            if (selectedProvider === "dstv" || selectedProvider === "gotv") {
                payload.subscription_type = subscriptionType;
                if (subscriptionType === "change") payload.variation_code = selectedVariation;
            } else {
                payload.variation_code = selectedVariation;
            }

            const res = await vtuService.payBill(payload);
            await refreshWallet();

            if (res.success || res.status === 'success') {
                showNotification('success', 'Subscription Successful', 'Your cable TV has been recharged.');
                navigation.goBack();
            } else {
                showNotification('error', 'Payment Failed', res.error || "Transaction failed");
            }
        } catch (e) {
            showNotification('error', 'Error', e.message);
        } finally {
            setLoading(false);
        }
    };

    const renderHeader = () => (
        <LinearGradient
            colors={['#5C2D91', '#0F172A']}
            style={styles.headerGradient}
        >
            <SafeAreaView edges={['top']}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => {
                        if (step === 'provider') navigation.goBack();
                        else if (step === 'verify') setStep('provider');
                        else if (step === 'options') setStep('verify');
                        else if (step === 'payment') {
                            if (selectedProvider === 'startimes' || selectedProvider === 'showmax') setStep('provider');
                            else setStep('options');
                        }
                    }} style={styles.backBtn}>
                        <ArrowLeft color="#FFFFFF" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>TV Subscription</Text>
                    <View style={styles.iconBox}>
                        <Tv color="#FFFFFF" size={20} />
                    </View>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            {renderHeader()}

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {step === 'provider' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Select Provider</Text>
                        {providers.map(p => (
                            <TouchableOpacity
                                key={p.id}
                                style={styles.providerCard}
                                onPress={() => handleProviderSelect(p.id)}
                            >
                                <Text style={styles.providerName}>{p.name}</Text>
                                <ChevronRight size={20} color="#94A3B8" />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {step === 'verify' && (
                    <View style={styles.formCard}>
                        <Text style={styles.cardHeader}>Verify Smartcard</Text>
                        <View style={styles.labelRow}>
                            <CreditCard size={18} color="#5C2D91" style={{ marginRight: 8 }} />
                            <Text style={styles.inputLabel}>{selectedProvider.toUpperCase()} IUC / Smartcard Number</Text>
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={formData.accountNumber}
                                onChangeText={t => setFormData({ ...formData, accountNumber: t })}
                                placeholder="Enter Number"
                                placeholderTextColor="#94A3B8"
                                keyboardType="numeric"
                            />
                        </View>
                        <TouchableOpacity
                            style={[styles.mainBtn, loading && styles.disabledBtn]}
                            onPress={handleVerify}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={['#7C3AED', '#5C2D91']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.btnGradient}
                            >
                                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verify Account</Text>}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}

                {step === 'options' && verificationData && (
                    <View>
                        <View style={styles.verifiedBox}>
                            <View style={styles.verifiedHeader}>
                                <CheckCircle2 size={18} color="#10B981" />
                                <Text style={styles.verifiedTitle}>Customer Verified</Text>
                            </View>
                            <View style={styles.detailCard}>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Name:</Text>
                                    <Text style={styles.detailValue}>{verificationData.Customer_Name}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Current:</Text>
                                    <Text style={styles.detailValue}>{verificationData.Current_Bouquet}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Expiry:</Text>
                                    <Text style={styles.detailValue}>{verificationData.Due_Date}</Text>
                                </View>
                            </View>
                        </View>

                        <Text style={styles.sectionTitle}>Choose Action</Text>
                        <TouchableOpacity style={styles.actionCard} onPress={() => {
                            setSubscriptionType("renew");
                            setFormData({ ...formData, amount: verificationData.Renewal_Amount?.toString() });
                            setStep("payment");
                        }}>
                            <View style={styles.actionInfo}>
                                <Text style={styles.actionTitle}>Renew Current Plan</Text>
                                <Text style={styles.actionSubtitle}>₦{verificationData.Renewal_Amount?.toLocaleString()}</Text>
                            </View>
                            <ChevronRight size={20} color="#5C2D91" />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.actionCard, { marginTop: 12 }]} onPress={async () => {
                            setLoading(true);
                            try {
                                const res = await vtuService.getVariations(selectedProvider);
                                setVariations(res.content?.variations || []);
                                setSubscriptionType("change");
                                setStep("payment");
                            } catch (e) { showNotification('error', 'Error', 'Failed to fetch packages'); }
                            finally { setLoading(false); }
                        }}>
                            <View style={styles.actionInfo}>
                                <Text style={styles.actionTitle}>Change Package</Text>
                                <Text style={styles.actionSubtitle}>Select a new subscription plan</Text>
                            </View>
                            <ChevronRight size={20} color="#5C2D91" />
                        </TouchableOpacity>
                    </View>
                )}

                {step === 'payment' && (
                    <View>
                        <Text style={styles.sectionTitle}>
                            {subscriptionType === 'renew' ? 'Confirm Renewal' : 'Select New Package'}
                        </Text>

                        {subscriptionType === 'change' && variations.length > 0 && (
                            <View style={styles.packagesList}>
                                {variations.map(v => (
                                    <TouchableOpacity
                                        key={v.variation_code}
                                        style={[
                                            styles.packageCard,
                                            selectedVariation === v.variation_code && styles.packageCardSelected
                                        ]}
                                        onPress={() => {
                                            setSelectedVariation(v.variation_code);
                                            setFormData({ ...formData, amount: v.variation_amount });
                                        }}
                                    >
                                        <Text style={[styles.packageName, selectedVariation === v.variation_code && styles.packageTextSelected]}>
                                            {v.name}
                                        </Text>
                                        <Text style={[styles.packagePrice, selectedVariation === v.variation_code && styles.packageTextSelected]}>
                                            ₦{parseFloat(v.variation_amount).toLocaleString()}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        <View style={styles.formCard}>
                            <View style={styles.fieldGroup}>
                                <Text style={styles.inputLabel}>Receiver Phone Number</Text>
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

                            <View style={styles.summaryBox}>
                                <Text style={styles.summaryLabel}>Total Payable</Text>
                                <Text style={styles.summaryValue}>₦{parseFloat(formData.amount || 0).toLocaleString()}</Text>
                            </View>

                            <TouchableOpacity
                                style={[styles.mainBtn, (loading || !formData.amount) && styles.disabledBtn]}
                                onPress={handlePay}
                                disabled={loading || !formData.amount}
                            >
                                <LinearGradient
                                    colors={['#7C3AED', '#5C2D91']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.btnGradient}
                                >
                                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Complete Payment</Text>}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <View style={styles.infoCard}>
                    <Info size={16} color="#475569" />
                    <Text style={styles.infoText}>
                        Cable TV recharges are processed instantly. If your channels don't clear immediately, please contact your service provider for a reset.
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
    providerName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 2,
        marginBottom: 20,
    },
    cardHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 20,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#475569',
    },
    inputContainer: {
        backgroundColor: '#F8FAFC',
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#F1F5F9',
        marginBottom: 20,
    },
    input: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#1E293B',
        fontWeight: '700',
    },
    mainBtn: {
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
    verifiedBox: {
        backgroundColor: '#F0FDF4',
        padding: 20,
        borderRadius: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#DCFCE7',
    },
    verifiedHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    verifiedTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#166534',
        marginLeft: 8,
    },
    detailCard: {
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: 16,
        padding: 16,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    detailLabel: {
        width: 60,
        fontSize: 13,
        color: '#166534',
    },
    detailValue: {
        flex: 1,
        fontSize: 13,
        fontWeight: 'bold',
        color: '#166534',
    },
    actionCard: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    actionInfo: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    actionSubtitle: {
        fontSize: 14,
        color: '#5C2D91',
        fontWeight: '700',
        marginTop: 2,
    },
    packagesList: {
        marginBottom: 20,
    },
    packageCard: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 2,
        borderColor: '#F1F5F9',
    },
    packageCardSelected: {
        borderColor: '#5C2D91',
        backgroundColor: 'rgba(92, 45, 145, 0.02)',
    },
    packageName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
        flex: 1,
        marginRight: 10,
    },
    packagePrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#5C2D91',
    },
    packageTextSelected: {
        color: '#5C2D91',
    },
    summaryBox: {
        backgroundColor: '#F8FAFC',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 20,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        padding: 16,
        borderRadius: 16,
        marginTop: 24,
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#475569',
        marginLeft: 10,
        lineHeight: 18,
    }
});

export default CableScreen;
