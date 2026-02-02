import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Image, StatusBar, Linking, Switch, Modal } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Phone, Mail, Lock, LogOut, ChevronRight, Shield, BadgeCheck, Camera, MessageCircle, HelpCircle, Fingerprint, X } from 'lucide-react-native';
import { authService } from '../services/authService';
import { useNotification } from '../context/NotificationContext';
import { LinearGradient } from 'expo-linear-gradient';
import biometricService from '../services/biometricService';

const ProfileScreen = () => {
    const { user, logout } = useAuth();
    const [isChangingPass, setIsChangingPass] = useState(false);
    const [passData, setPassData] = useState({ current: '', newPass: '', confirm: '' });
    const [loading, setLoading] = useState(false);
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [biometricType, setBiometricType] = useState('Biometric');
    const [biometricLoading, setBiometricLoading] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [biometricPassword, setBiometricPassword] = useState('');
    const { showNotification } = useNotification();

    const handleWhatsApp = () => {
        Linking.openURL('whatsapp://send?phone=2349056897432&text=Hello ZippyPay Support, I need help.');
    };

    const handleEmail = () => {
        Linking.openURL('mailto:emmco96@gmail.com?subject=ZippyPay Support Request');
    };

    const handleChangePass = async () => {
        if (!passData.current || !passData.newPass) return showNotification('error', "Error", "Please fill all fields");
        if (passData.newPass !== passData.confirm) return showNotification('error', "Error", "Passwords do not match");
        setLoading(true);
        try {
            await authService.changePassword({
                currentPassword: passData.current,
                newPassword: passData.newPass
            });
            showNotification('success', "Success", "Password updated successfully");
            setIsChangingPass(false);
            setPassData({ current: '', newPass: '', confirm: '' });
        } catch (e) {
            showNotification('error', "Error", e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBiometricToggle = async (value) => {
        if (value) {
            // Show password modal to enable biometric
            setShowPasswordModal(true);
        } else {
            // Disable biometric directly
            setBiometricLoading(true);
            try {
                await biometricService.disableBiometric();
                setBiometricEnabled(false);
                showNotification('success', "Success", `${biometricType} login disabled`);
            } catch (error) {
                showNotification('error', "Error", error.message);
            } finally {
                setBiometricLoading(false);
            }
        }
    };

    const handleEnableBiometric = async () => {
        if (!biometricPassword.trim()) {
            showNotification('error', "Error", "Please enter your password");
            return;
        }

        setBiometricLoading(true);
        try {
            await biometricService.enableBiometric(user.email, biometricPassword);
            setBiometricEnabled(true);
            setShowPasswordModal(false);
            setBiometricPassword('');
            showNotification('success', "Success", `${biometricType} login enabled successfully`);
        } catch (error) {
            showNotification('error', "Error", error.message);
        } finally {
            setBiometricLoading(false);
        }
    };

    const handleCancelPasswordModal = () => {
        setShowPasswordModal(false);
        setBiometricPassword('');
        setBiometricLoading(false);
    };

    useEffect(() => {
        const checkBiometric = async () => {
            try {
                const available = await biometricService.isAvailable();
                const enabled = await biometricService.isBiometricEnabled();
                const typeName = await biometricService.getBiometricTypeName();

                setBiometricAvailable(available);
                setBiometricEnabled(enabled);
                setBiometricType(typeName);
            } catch (error) {
                console.error('Error checking biometric:', error);
            }
        };

        checkBiometric();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header Section */}
            <LinearGradient
                colors={['#5C2D91', '#0F172A']}
                style={styles.headerGradient}
            >
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>My Profile</Text>
                        <TouchableOpacity style={styles.settingsBtn}>
                            <Shield size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.profileSummary}>
                        <View style={styles.avatarWrapper}>
                            <View style={styles.avatarContainer}>
                                <Text style={styles.avatarText}>{user?.full_name?.charAt(0).toUpperCase()}</Text>
                            </View>
                            <TouchableOpacity style={styles.cameraBtn}>
                                <Camera size={14} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.profileText}>
                            <View style={styles.nameRow}>
                                <Text style={styles.userName}>{user?.full_name}</Text>
                                <BadgeCheck size={18} color="#10B981" style={{ marginLeft: 6 }} />
                            </View>
                            <Text style={styles.userEmail}>{user?.email}</Text>
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Personal Info Group */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
                                <User color="#3B82F6" size={20} />
                            </View>
                            <View style={styles.rowContent}>
                                <Text style={styles.label}>Full Name</Text>
                                <Text style={styles.value}>{user?.full_name}</Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.row}>
                            <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
                                <Mail color="#22C55E" size={20} />
                            </View>
                            <View style={styles.rowContent}>
                                <Text style={styles.label}>Email Address</Text>
                                <Text style={styles.value}>{user?.email}</Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.row}>
                            <View style={[styles.iconBox, { backgroundColor: '#FEF2F2' }]}>
                                <Phone color="#EF4444" size={20} />
                            </View>
                            <View style={styles.rowContent}>
                                <Text style={styles.label}>Phone Number</Text>
                                <Text style={styles.value}>{user?.phone}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Security Group */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Security</Text>
                    <View style={styles.card}>
                        <TouchableOpacity
                            onPress={() => setIsChangingPass(!isChangingPass)}
                            style={styles.clickableRow}
                        >
                            <View style={styles.rowMain}>
                                <View style={[styles.iconBox, { backgroundColor: '#FAF5FF' }]}>
                                    <Lock color="#5C2D91" size={20} />
                                </View>
                                <Text style={styles.menuText}>Change Password</Text>
                            </View>
                            <ChevronRight size={20} color="#94A3B8" />
                        </TouchableOpacity>

                        {isChangingPass && (
                            <View style={styles.passwordForm}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Current Password"
                                    placeholderTextColor="#94A3B8"
                                    secureTextEntry
                                    value={passData.current}
                                    onChangeText={t => setPassData({ ...passData, current: t })}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="New Password"
                                    placeholderTextColor="#94A3B8"
                                    secureTextEntry
                                    value={passData.newPass}
                                    onChangeText={t => setPassData({ ...passData, newPass: t })}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm New Password"
                                    placeholderTextColor="#94A3B8"
                                    secureTextEntry
                                    value={passData.confirm}
                                    onChangeText={t => setPassData({ ...passData, confirm: t })}
                                />
                                <TouchableOpacity
                                    style={styles.updateBtn}
                                    onPress={handleChangePass}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.updateBtnText}>Save New Password</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}

                        {biometricAvailable && (
                            <>
                                <View style={styles.divider} />
                                <View style={styles.clickableRow}>
                                    <View style={styles.rowMain}>
                                        <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
                                            <Fingerprint color="#F59E0B" size={20} />
                                        </View>
                                        <View style={styles.rowContent}>
                                            <Text style={styles.menuText}>{biometricType} Login</Text>
                                            <Text style={styles.menuSubText}>
                                                {biometricEnabled ? 'Enabled' : 'Disabled'}
                                            </Text>
                                        </View>
                                    </View>
                                    <Switch
                                        value={biometricEnabled}
                                        onValueChange={handleBiometricToggle}
                                        disabled={biometricLoading}
                                        trackColor={{ false: '#E5E7EB', true: '#A78BFA' }}
                                        thumbColor={biometricEnabled ? '#5C2D91' : '#F3F4F6'}
                                    />
                                </View>
                            </>
                        )}
                    </View>
                </View>

                {/* Support Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support & Help</Text>
                    <View style={styles.card}>
                        <TouchableOpacity style={styles.clickableRow} onPress={handleWhatsApp}>
                            <View style={styles.rowMain}>
                                <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
                                    <MessageCircle color="#16A34A" size={20} />
                                </View>
                                <View style={styles.rowContent}>
                                    <Text style={styles.menuText}>WhatsApp Support</Text>
                                    <Text style={styles.menuSubText}>Chat with us instantly</Text>
                                </View>
                            </View>
                            <ChevronRight size={20} color="#94A3B8" />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity style={styles.clickableRow} onPress={handleEmail}>
                            <View style={styles.rowMain}>
                                <View style={[styles.iconBox, { backgroundColor: '#DBEAFE' }]}>
                                    <Mail color="#2563EB" size={20} />
                                </View>
                                <View style={styles.rowContent}>
                                    <Text style={styles.menuText}>Email Support</Text>
                                    <Text style={styles.menuSubText}>emmco96@gmail.com</Text>
                                </View>
                            </View>
                            <ChevronRight size={20} color="#94A3B8" />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                    <LinearGradient
                        colors={['#FF4B4B', '#CF0000']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.logoutGradient}
                    >
                        <LogOut color="#fff" size={20} style={{ marginRight: 8 }} />
                        <Text style={styles.logoutText}>Log Out Account</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Password Modal for Biometric */}
            <Modal
                visible={showPasswordModal}
                transparent={true}
                animationType="fade"
                onRequestClose={handleCancelPasswordModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalIconContainer}>
                                <Fingerprint size={32} color="#5C2D91" />
                            </View>
                            <TouchableOpacity
                                onPress={handleCancelPasswordModal}
                                style={styles.modalCloseBtn}
                            >
                                <X size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalTitle}>Enable {biometricType} Login</Text>
                        <Text style={styles.modalSubtitle}>
                            Enter your password to securely enable biometric authentication
                        </Text>

                        <View style={styles.modalInputContainer}>
                            <Lock size={20} color="#5C2D91" />
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Enter your password"
                                placeholderTextColor="#94A3B8"
                                secureTextEntry
                                value={biometricPassword}
                                onChangeText={setBiometricPassword}
                                autoFocus
                            />
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalCancelBtn}
                                onPress={handleCancelPasswordModal}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalConfirmBtn, biometricLoading && styles.modalConfirmBtnDisabled]}
                                onPress={handleEnableBiometric}
                                disabled={biometricLoading}
                            >
                                {biometricLoading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.modalConfirmText}>Enable</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    settingsBtn: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    profileSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginTop: 32,
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: 'bold',
    },
    cameraBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#5C2D91',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    profileText: {
        marginLeft: 20,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    userEmail: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 32,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#64748B',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rowContent: {
        marginLeft: 16,
    },
    label: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '600',
        marginBottom: 2,
    },
    value: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 16,
    },
    clickableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    rowMain: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuText: {
        marginLeft: 16,
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    menuSubText: {
        marginLeft: 16,
        fontSize: 12,
        color: '#64748B',
    },
    passwordForm: {
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    input: {
        backgroundColor: '#F8FAFC',
        borderWidth: 2,
        borderColor: '#F1F5F9',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: '#1E293B',
        marginBottom: 12,
    },
    updateBtn: {
        backgroundColor: '#5C2D91',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    updateBtnText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 15,
    },
    logoutBtn: {
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 8,
    },
    logoutGradient: {
        paddingVertical: 18,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCloseBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 24,
        lineHeight: 20,
    },
    modalInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        marginBottom: 24,
    },
    modalInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: '#1F2937',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalCancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
    },
    modalCancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748B',
    },
    modalConfirmBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#5C2D91',
        alignItems: 'center',
    },
    modalConfirmBtnDisabled: {
        opacity: 0.7,
    },
    modalConfirmText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    }
});

export default ProfileScreen;
