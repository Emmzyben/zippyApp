import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useWallet } from '../context/WalletContext';
import { Wallet, Eye, EyeOff, PlusCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const WalletCard = ({ navigation }) => {
    const [showBalance, setShowBalance] = useState(true);
    const { balance } = useWallet();

    const formatBalance = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <LinearGradient
            colors={['#5C2D91', '#401C6A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
        >
            <View style={styles.header}>
                <View style={styles.leftContent}>
                    <View style={styles.iconContainer}>
                        <Wallet size={20} color="#FFFFFF" />
                    </View>
                    <Text style={styles.label}>Available Balance</Text>
                </View>

                <TouchableOpacity
                    onPress={() => setShowBalance(!showBalance)}
                    style={styles.eyeButton}
                >
                    {showBalance ? <EyeOff size={20} color="rgba(255, 255, 255, 0.7)" /> : <Eye size={20} color="rgba(255, 255, 255, 0.7)" />}
                </TouchableOpacity>
            </View>

            <View style={styles.balanceContainer}>
                <Text style={styles.currencySymbol}>₦</Text>
                <Text style={styles.balanceText}>
                    {showBalance ? balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '••••••'}
                </Text>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.fundButton}
                    onPress={() => navigation?.navigate('Wallet')}
                >
                    <PlusCircle size={18} color="#5C2D91" style={{ marginRight: 8 }} />
                    <Text style={styles.fundButtonText}>Add Money</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        padding: 24,
        shadowColor: '#5C2D91',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
        marginBottom: 20
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    iconContainer: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    label: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
    },
    balanceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 24,
    },
    currencySymbol: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginRight: 4,
        opacity: 0.8,
    },
    balanceText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    eyeButton: {
        padding: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    fundButton: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    fundButtonText: {
        color: '#5C2D91',
        fontSize: 15,
        fontWeight: 'bold',
    }
});

export default WalletCard;
