import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Smartphone, Wifi, Receipt, Plane } from 'lucide-react-native';

const QuickActions = ({ navigation }) => {
    const actions = [
        {
            icon: Smartphone,
            label: 'Buy Airtime',
            path: 'Airtime',
            iconColor: '#EF4444', // red-500
            bgColor: '#FEF2F2' // red-50
        },
        {
            icon: Wifi,
            label: 'Buy Data',
            path: 'Data',
            iconColor: '#22C55E', // green-500
            bgColor: '#F0FDF4' // green-50
        },
        {
            icon: Receipt,
            label: 'Pay Bills',
            path: 'Bills',
            iconColor: '#3B82F6', // blue-500
            bgColor: '#EFF6FF' // blue-50
        },
        {
            icon: Plane,
            label: 'Book Flight',
            path: 'Flight',
            iconColor: '#8B5CF6', // purple-500
            bgColor: '#F5F3FF', // purple-50
            comingSoon: true
        },
    ];

    return (
        <View style={styles.grid}>
            {actions.map((action, index) => {
                const IconComponent = action.icon;
                const isComingSoon = action.comingSoon;

                return (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.card,
                            isComingSoon && { opacity: 0.6, backgroundColor: '#F9FAFB' }
                        ]}
                        onPress={() => !isComingSoon && navigation?.navigate(action.path)}
                        disabled={isComingSoon}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: '#F5F5F5' }]}>
                            <IconComponent size={24} color={isComingSoon ? '#94A3B8' : action.iconColor} />
                        </View>
                        <Text style={[styles.label, isComingSoon && { color: '#94A3B8' }]}>{action.label}</Text>
                        {isComingSoon && (
                            <View style={styles.comingSoonBadge}>
                                <Text style={styles.comingSoonText}>Coming Soon</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'flex-start',
    },
    card: {
        width: '48%',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        elevation: 2,
    },
    iconContainer: {
        padding: 12,
        borderRadius: 999, // full rounded
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#171717',
        textAlign: 'center',
    },
    comingSoonBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#F5F3FF',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#DDD6FE',
    },
    comingSoonText: {
        fontSize: 8,
        color: '#7C3AED',
        fontWeight: 'bold',
    }
});

export default QuickActions;
