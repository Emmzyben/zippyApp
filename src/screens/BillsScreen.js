import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Zap, Tv, ArrowLeft, ChevronRight, Receipt } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const BillsScreen = ({ navigation }) => {
    const billCategories = [
        {
            id: "electricity",
            name: "Electricity",
            desc: "AEDC, EKEDC, IKEDC, PHEDC, etc.",
            icon: Zap,
            color: "#CA8A04",
            bgColor: '#FEF9C3',
            path: "Electricity"
        },
        {
            id: "cable",
            name: "Cable TV",
            desc: "DStv, GOtv, StarTimes, Showmax",
            icon: Tv,
            color: "#2563EB",
            bgColor: '#DBEAFE',
            path: "Cable"
        },
    ];

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
                        <Text style={styles.headerTitle}>Pay Bills</Text>
                        <View style={styles.iconBox}>
                            <Receipt color="#FFFFFF" size={20} />
                        </View>
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.greeting}>Select Category</Text>
                        <Text style={styles.subtitle}>Choose which bill you'd like to pay</Text>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.grid}>
                    {billCategories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                            <TouchableOpacity
                                key={cat.id}
                                style={styles.card}
                                onPress={() => navigation.navigate(cat.path)}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: cat.bgColor }]}>
                                    <Icon size={24} color={cat.color} />
                                </View>
                                <View style={styles.cardInfo}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.cardTitle}>{cat.name}</Text>
                                        <ChevronRight size={18} color="#94A3B8" />
                                    </View>
                                    <Text style={styles.cardDesc}>{cat.desc}</Text>
                                </View>
                            </TouchableOpacity>
                        )
                    })}
                </View>

                <View style={styles.recentSection}>
                    <Text style={styles.sectionTitle}>Frequently Paid</Text>
                    <View style={styles.recentPlaceholder}>
                        <Receipt size={30} color="#CBD5E1" />
                        <Text style={styles.placeholderText}>Your frequent bills will appear here for quick access.</Text>
                    </View>
                </View>
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
    headerInfo: {
        paddingHorizontal: 24,
        marginTop: 24,
    },
    greeting: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
        marginTop: 4,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 32,
    },
    grid: {
        gap: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardInfo: {
        flex: 1,
        marginLeft: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    cardDesc: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 4,
    },
    recentSection: {
        marginTop: 40,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 16,
    },
    recentPlaceholder: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#F1F5F9',
        borderStyle: 'dashed',
    },
    placeholderText: {
        textAlign: 'center',
        color: '#94A3B8',
        fontSize: 13,
        marginTop: 12,
        lineHeight: 18,
    }
});

export default BillsScreen;
