import React, { createContext, useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Check, X, AlertCircle } from 'lucide-react-native';

const NotificationContext = createContext();

export const NotificationDetails = {
    success: { icon: Check, color: "#16A34A", bg: "#F0FDF4", border: "#DCFCE7" },
    error: { icon: X, color: "#DC2626", bg: "#FEF2F2", border: "#FEE2E2" },
    warning: { icon: AlertCircle, color: "#CA8A04", bg: "#FEFCE8", border: "#FEF9C3" },
    info: { icon: AlertCircle, color: "#2563EB", bg: "#EFF6FF", border: "#DBEAFE" },
};

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState({
        visible: false,
        type: 'info',
        title: '',
        message: '',
    });

    const showNotification = (type, title, message) => {
        setNotification({ visible: true, type, title, message });
    };

    const hideNotification = () => {
        setNotification(prev => ({ ...prev, visible: false }));
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            {notification.visible && (
                <NotificationModal
                    notification={notification}
                    onClose={hideNotification}
                />
            )}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within NotificationProvider');
    return context;
};

const NotificationModal = ({ notification, onClose }) => {
    const { type, title, message } = notification;
    const style = NotificationDetails[type] || NotificationDetails.info;
    const Icon = style.icon;

    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <Modal transparent animationType="fade" visible={true} onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={[styles.card, { backgroundColor: style.bg, borderColor: style.border }]}>
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <X size={16} color="#666" />
                    </TouchableOpacity>
                    <View style={styles.content}>
                        <View style={[styles.iconBox, { backgroundColor: style.bg }]}>
                            <Icon size={24} color={style.color} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={[styles.title, { color: style.color }]}>{title}</Text>
                            <Text style={styles.message}>{message}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        padding: 20
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        position: 'relative'
    },
    closeBtn: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
        padding: 5
    },
    content: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 15
    },
    iconBox: {
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center'
    },
    textContainer: {
        flex: 1
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5
    },
    message: {
        color: '#4B5563',
        fontSize: 14,
        lineHeight: 20
    }
});

export default NotificationContext;
