import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Users, UserPlus, Trash2 } from 'lucide-react-native';
import { emailBeneficiariesAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';

const EmailBeneficiarySelector = ({ value, onSelect, onAdd }) => {
    const [beneficiaries, setBeneficiaries] = useState([]);
    const [showList, setShowList] = useState(false);
    const [loading, setLoading] = useState(false);

    const { showNotification } = useNotification();

    useEffect(() => {
        loadBeneficiaries();
    }, []);

    const loadBeneficiaries = async () => {
        try {
            setLoading(true);
            const response = await emailBeneficiariesAPI.getAll();
            setBeneficiaries(response.data.beneficiaries || []);
        } catch (error) {
            console.log('Failed to load beneficiaries:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (email) => {
        onSelect(email);
        setShowList(false);
    };

    const handleAdd = async () => {
        if (!value) return;
        try {
            await emailBeneficiariesAPI.add({
                email: value,
                name: `Beneficiary ${value.split('@')[0]}`,
            });
            await loadBeneficiaries();
            onAdd?.();
            showNotification('success', 'Success', "Beneficiary added");
        } catch (error) {
            showNotification('error', 'Error', error.response?.data?.error || "Failed to add beneficiary");
        }
    };

    const handleDelete = async (id, name) => {
        Alert.alert("Confirm", `Delete ${name}?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: 'destructive', onPress: async () => {
                    try {
                        await emailBeneficiariesAPI.delete(id);
                        await loadBeneficiaries();
                        showNotification('success', 'Deleted', "Beneficiary removed");
                    } catch (e) {
                        showNotification('error', 'Error', "Failed to delete");
                    }
                }
            }
        ]);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Recipient Email</Text>
            <View style={styles.row}>
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onSelect}
                    placeholder="user@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TouchableOpacity style={styles.iconBtn} onPress={() => setShowList(true)}>
                    <Users color="#4B5563" size={20} />
                </TouchableOpacity>
            </View>

            {value.includes('@') && (
                <TouchableOpacity onPress={handleAdd} style={styles.addBtn}>
                    <UserPlus size={14} color="#5C2D91" />
                    <Text style={styles.addBtnText}>Save Beneficiary</Text>
                </TouchableOpacity>
            )}

            <Modal visible={Boolean(showList)} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Beneficiary</Text>
                        <TouchableOpacity onPress={() => setShowList(false)}>
                            <Text style={styles.closeText}>Close</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color="#5C2D91" style={{ marginTop: 50 }} />
                    ) : (
                        <FlatList
                            data={beneficiaries}
                            keyExtractor={item => item.id.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.itemRow}>
                                    <TouchableOpacity style={styles.itemMain} onPress={() => handleSelect(item.email)}>
                                        <Text style={styles.itemName}>{item.name || 'Unnamed'}</Text>
                                        <Text style={styles.itemPhone}>{item.email}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} style={styles.deleteBtn}>
                                        <Trash2 color="#EF4444" size={20} />
                                    </TouchableOpacity>
                                </View>
                            )}
                            ListEmptyComponent={<Text style={styles.emptyText}>No beneficiaries found.</Text>}
                        />
                    )}
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: 15 },
    label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 5 },
    row: { flexDirection: 'row', gap: 10 },
    input: {
        flex: 1,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 12,
        fontSize: 16
    },
    iconBtn: {
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 15,
        borderRadius: 8
    },
    addBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 5 },
    addBtnText: { color: '#5C2D91', fontSize: 13, fontWeight: '600' },
    modalContent: { flex: 1, backgroundColor: '#fff', padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    closeText: { color: '#5C2D91', fontSize: 16 },
    itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    itemMain: { flex: 1 },
    itemName: { fontSize: 16, fontWeight: '500', color: '#111' },
    itemPhone: { color: '#666', marginTop: 2 },
    deleteBtn: { padding: 10 },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#999' }
});

export default EmailBeneficiarySelector;
