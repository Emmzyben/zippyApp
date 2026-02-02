import React from 'react';
import { View, ActivityIndicator, StyleSheet, Modal, Text } from 'react-native';

const LoadingSpinner = ({ visible, text = 'Loading...' }) => {
    if (!visible) return null;

    return (
        <Modal transparent animationType="fade" visible={Boolean(visible)}>
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <ActivityIndicator size="large" color="#5C2D91" />
                    <Text style={styles.text}>{text}</Text>
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
        alignItems: 'center'
    },
    card: {
        backgroundColor: '#fff',
        padding: 25,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    text: {
        marginTop: 15,
        fontSize: 16,
        color: '#5C2D91',
        fontWeight: '600'
    }
});

export default LoadingSpinner;
