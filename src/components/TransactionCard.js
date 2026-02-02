import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowUpRight, ArrowDownRight, Check, X, Clock, HelpCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const TransactionCard = ({ transaction }) => {
  const navigation = useNavigation();

  const getTransactionIcon = (type, status, details) => {
    const isCredit = type === 'wallet_fund' || (type === 'p2p_transfer' && details?.transfer_type === 'credit');

    if (status === 'failed') return <X color="#EF4444" size={20} />;

    if (isCredit) {
      return <ArrowDownRight color="#10B981" size={20} />;
    }
    return <ArrowUpRight color="#64748B" size={20} />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
      case 'completed':
        return { bg: '#F0FDF4', color: '#16A34A', border: '#DCFCE7' };
      case 'failed':
        return { bg: '#FEF2F2', color: '#DC2626', border: '#FEE2E2' };
      default:
        return { bg: '#FEFCE8', color: '#CA8A04', border: '#FEF9C3' };
    }
  };

  const formatAmount = (amount) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(Math.abs(amount));

  const formatDate = (date) => {
    try {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }) + ', ' + d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const statusStyle = getStatusColor(transaction.status);
  const isCredit = transaction.type === 'wallet_fund' || (transaction.type === 'p2p_transfer' && transaction.details?.transfer_type === 'credit');

  const getTitle = () => {
    const type = transaction.type;
    const details = transaction.details;

    if (type === 'wallet_fund') return 'Wallet Funded';
    if (type === 'withdrawal') return 'Withdrawal';
    if (type === 'airtime') return `Airtime: ${details?.phone || 'Recharge'}`;
    if (type === 'data') return `Data: ${details?.plan || 'Subscription'}`;
    if (type === 'bill') return `${details?.service_type === 'electricity' ? 'Electricity' : 'Cable TV'} Bill`;
    if (type === 'p2p_transfer') {
      return details?.transfer_type === 'credit'
        ? `From ${details?.sender_name || 'Zippy User'}`
        : `To ${details?.recipient_name || 'Zippy User'}`;
    }
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('TransactionDetails', { id: transaction.id })}
      style={styles.container}
    >
      <View style={styles.leftSection}>
        <View style={[styles.iconContainer, { backgroundColor: isCredit ? '#F0FDF4' : '#F8FAFC' }]}>
          {getTransactionIcon(transaction.type, transaction.status, transaction.details)}
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {getTitle()}
          </Text>
          <Text style={styles.date}>
            {formatDate(transaction.date || transaction.created_at)}
          </Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <Text style={[styles.amount, isCredit ? styles.creditAmount : styles.debitAmount]}>
          {isCredit ? '+' : '-'}{formatAmount(transaction.amount)}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
          <Text style={[styles.statusText, { color: statusStyle.color }]}>
            {transaction.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    marginLeft: 14,
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  creditAmount: {
    color: '#10B981',
  },
  debitAmount: {
    color: '#0F172A',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  }
});

export default TransactionCard;
