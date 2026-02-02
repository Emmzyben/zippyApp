import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const networks = [
    { id: 'mtn', name: 'MTN', color: '#FFCC00', textColor: '#000' },
    { id: 'glo', name: 'GLO', color: '#00B050', textColor: '#FFF' },
    { id: 'airtel', name: 'Airtel', color: '#FF0000', textColor: '#FFF' },
    { id: 'etisalat', name: '9mobile', color: '#006400', textColor: '#FFF' },
];

const NetworkSelector = ({ selectedNetwork, onSelect }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>Select Network</Text>
            <View style={styles.grid}>
                {networks.map((network) => (
                    <TouchableOpacity
                        key={network.id}
                        style={[
                            styles.item,
                            selectedNetwork === network.id && styles.selectedItem,
                            { borderColor: selectedNetwork === network.id ? '#5C2D91' : '#E5E5E5' }
                        ]}
                        onPress={() => onSelect(network.id)}
                    >
                        <View style={[styles.logoPlaceholder, { backgroundColor: network.color }]}>
                            <Text style={[styles.networkText, { color: network.textColor }]}>{network.name}</Text>
                        </View>
                        <View style={styles.radioContainer}>
                            <View style={[
                                styles.radioOuter,
                                selectedNetwork === network.id && { borderColor: '#5C2D91' }
                            ]}>
                                {selectedNetwork === network.id && <View style={styles.radioInner} />}
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        color: '#333',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        justifyContent: 'space-between',
    },
    item: {
        width: '48%', // 2 per row roughly
        backgroundColor: '#fff',
        borderWidth: 2,
        borderRadius: 12,
        padding: 10,
        alignItems: 'center',
        flexDirection: 'row',
        gap: 10
    },
    selectedItem: {
        backgroundColor: '#F3E8FF', // Light purple bg
    },
    logoPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    networkText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    radioContainer: {
        marginLeft: 'auto'
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center'
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#5C2D91'
    }
});

export default NetworkSelector;
