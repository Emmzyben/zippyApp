import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Clipboard } from 'react-native';
import { Copy, X, CheckCircle } from 'lucide-react-native';

const TokenModal = ({ visible, token, onClose }) => {
    const handleCopy = () => {
        Clipboard.setString(token);
        // Could show toast here if we had notification hook passed in or available globally
    };

    return (
        <Modal transparent animationType="slide" visible={Boolean(visible)} onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <View style={styles.iconContainer}>
                        <CheckCircle size={50} color="#16A34A" />
                    </View>

                    <Text style={styles.title}>Payment Successful!</Text>
                    <Text style={styles.subtitle}>Here is your electricity token</Text>

                    <View style={styles.tokenBox}>
                        <Text style={styles.tokenText}>{token}</Text>
                        <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
                            <Copy size={20} color="#5C2D91" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.helperText}>
                        This token has also been sent to your transaction history.
                    </Text>

                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <Text style={styles.closeText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    iconContainer: {
        marginBottom: 15
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center'
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 5,
        marginBottom: 20,
        textAlign: 'center'
    },
    tokenBox: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#E5E5E5'
    },
    tokenText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        letterSpacing: 2
    },
    copyBtn: {
        padding: 8,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E5E5'
    },
    helperText: {
        fontSize: 13,
        color: '#9CA3AF',
        textAlign: 'center',
        marginBottom: 20
    },
    closeBtn: {
        backgroundColor: '#5C2D91',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center'
    },
    closeText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    }
});

export default TokenModal;
