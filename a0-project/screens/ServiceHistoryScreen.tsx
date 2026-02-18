/**
* ServiceHistoryScreen - Histórico de Solicitações
* @module screens/ServiceHistoryScreen
*/

import React, { useState, useEffect, useCallback } from 'react';
import {
View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, useThemeMode } from '../lib/theme';
import { ServiceRequestHistoryItem, ServiceRequestStatus, ServiceRequestType } from '../api/types/services';
import * as serviceRequestService from '../api/services/serviceRequestService';
import { useAppStore } from '../store/useAppStore';
import { formatDate } from '../utils/formatters';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import LoadingScreen from '../components/LoadingScreen';

interface ServiceHistoryScreenProps {
navigation: any;
}

/** Mapeia tipo de solicitação para ícone */
function getTypeIcon(type: ServiceRequestType): { icon: string; color: string } {
switch (type) {
case 'PORTABILITY': return { icon: 'repeat', color: colors.accent };
case 'CHIP_SWAP': return { icon: 'cpu', color: colors.success };
case 'BLOCK': return { icon: 'lock', color: colors.error };
case 'UNBLOCK': return { icon: 'unlock', color: colors.success };
case 'CANCELLATION': return { icon: 'x-circle', color: colors.error };
default: return { icon: 'file', color: colors.textSecondary };
}
}

/** Mapeia status para badge */
function getStatusVariant(status: ServiceRequestStatus): { label: string; variant: 'success' | 'warning' | 'info' | 'neutral' } {
switch (status) {
case 'COMPLETED': return { label: 'Concluída', variant: 'success' };
case 'IN_PROGRESS': return { label: 'Em andamento', variant: 'info' };
case 'PENDING': return { label: 'Pendente', variant: 'warning' };
case 'CANCELLED': return { label: 'Cancelada', variant: 'neutral' };
default: return { label: status, variant: 'neutral' };
}
}

export default function ServiceHistoryScreen({ navigation }: ServiceHistoryScreenProps) {
  /** Subscreve ao tema para re-render automatico */
  const { mode: themeMode } = useThemeMode();
  const styles = getStyles();
const customer = useAppStore((s) => s.customer);
const [requests, setRequests] = useState<ServiceRequestHistoryItem[]>([]);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);

const loadHistory = useCallback(async () => {
if (!customer) return;
try {
const data = await serviceRequestService.getServiceRequestHistory(customer.id);
setRequests(data.requests);
} catch { }
finally {
setLoading(false);
setRefreshing(false);
}
}, [customer]);

useEffect(() => { loadHistory(); }, [loadHistory]);

const renderItem = ({ item }: { item: ServiceRequestHistoryItem }) => {
const typeInfo = getTypeIcon(item.type);
const statusInfo = getStatusVariant(item.status);
return (
<View style={styles.card}>
<View style={styles.cardHeader}>
<View style={[styles.typeIcon, { backgroundColor: typeInfo.color + '15' }]}>
<Feather name={typeInfo.icon as any} size={20} color={typeInfo.color} />
</View>
<View style={styles.cardInfo}>
<Text style={styles.cardDescription}>{item.description}</Text>
<Text style={styles.cardProtocol}>Protocolo: {item.protocol}</Text>
</View>
</View>
<View style={styles.cardFooter}>
<StatusBadge label={statusInfo.label} variant={statusInfo.variant} />
<Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
</View>
</View>
);
};

if (loading) return <LoadingScreen message="Carregando histórico..." />;

return (
<SafeAreaView style={styles.container} edges={['top']}>
<View style={styles.header}>
<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
<Feather name="arrow-left" size={24} color={colors.textPrimary} />
</TouchableOpacity>
<Text style={styles.headerTitle}>Solicitações</Text>
<View style={{ width: 40 }} />
</View>

<FlatList
data={requests}
keyExtractor={(item) => item.id}
renderItem={renderItem}
contentContainerStyle={requests.length === 0 ? { flex: 1 } : { padding: spacing.xl }}
refreshControl={
<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadHistory(); }} colors={[colors.accent]} />
}
ListEmptyComponent={
<EmptyState
icon="inbox"
title="Sem solicitações"
message="Você não possui solicitações de serviço."
/>
}
/>
</SafeAreaView>
);
}

const getStyles = () => StyleSheet.create({
container: { flex: 1, backgroundColor: colors.background },
header: {
flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.divider,
},
backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
headerTitle: { ...typography.h3 , color: colors.textPrimary },
card: {
backgroundColor: colors.surface, borderRadius: borderRadius.lg,
padding: spacing.lg, marginBottom: spacing.md,
},
cardHeader: { flexDirection: 'row', marginBottom: spacing.md },
typeIcon: {
width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
marginRight: spacing.md,
},
cardInfo: { flex: 1 },
cardDescription: { ...typography.body, fontWeight: '600' , color: colors.textPrimary },
cardProtocol: { ...typography.caption, marginTop: 4 , color: colors.textSecondary },
cardFooter: {
flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.divider,
},
cardDate: { ...typography.caption , color: colors.textSecondary },
});
