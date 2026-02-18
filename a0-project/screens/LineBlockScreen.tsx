/**
* LineBlockScreen - Bloqueio/Desbloqueio de Linha
* @module screens/LineBlockScreen
*/

import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, useThemeMode } from '../lib/theme';
import { useAppStore } from '../store/useAppStore';
import * as serviceRequestService from '../api/services/serviceRequestService';
import SKYCard from '../components/SKYCard';
import SKYButton from '../components/SKYButton';
import StatusBadge from '../components/StatusBadge';
import { formatPhone } from '../utils/formatters';

interface LineBlockScreenProps {
navigation: any;
}

export default function LineBlockScreen({ navigation }: LineBlockScreenProps) {
  /** Subscreve ao tema para re-render automatico */
  const { mode: themeMode } = useThemeMode();
  const styles = getStyles();
const customer = useAppStore((s) => s.customer);
const line = customer?.mobileLines[0];
const isBlocked = line?.status === 'BLOCKED' || line?.status === 'SUSPENDED';
const [loading, setLoading] = useState(false);

const handleToggleBlock = () => {
const action = isBlocked ? 'desbloquear' : 'bloquear';
Alert.alert(
`Confirmar ${action}`,
`Deseja realmente ${action} sua linha ${formatPhone(line?.msisdn || '')}?`,
[
{ text: 'Cancelar', style: 'cancel' },
{
text: 'Confirmar',
style: isBlocked ? 'default' : 'destructive',
onPress: async () => {
setLoading(true);
try {
const response = await serviceRequestService.createServiceRequest({
type: isBlocked ? 'UNBLOCK' : 'BLOCK',
customerId: customer!.id,
lineId: line!.msisdn,
details: { reason: isBlocked ? 'Desbloqueio solicitado' : 'Bloqueio temporário' },
});
Alert.alert('Sucesso!', `Protocolo: ${response.protocol}\n${response.message}`, [
{ text: 'OK', onPress: () => navigation.goBack() },
]);
} catch {
Alert.alert('Erro', 'Não foi possível processar a solicitação.');
} finally {
setLoading(false);
}
},
},
]
);
};

return (
<SafeAreaView style={styles.container} edges={['top']}>
<View style={styles.header}>
<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
<Feather name="arrow-left" size={24} color={colors.textPrimary} />
</TouchableOpacity>
<Text style={styles.headerTitle}>Bloqueio de linha</Text>
<View style={{ width: 40 }} />
</View>

<View style={styles.content}>
<View style={styles.iconCircle}>
<Feather
name={isBlocked ? 'unlock' : 'lock'}
size={40}
color={isBlocked ? colors.success : colors.error}
/>
</View>

<Text style={styles.title}>
{isBlocked ? 'Linha bloqueada' : 'Linha ativa'}
</Text>

<SKYCard style={styles.lineCard}>
<View style={styles.lineRow}>
<Text style={styles.lineLabel}>Número</Text>
<Text style={styles.lineValue}>{formatPhone(line?.msisdn || '')}</Text>
</View>
<View style={styles.lineRow}>
<Text style={styles.lineLabel}>Status</Text>
<StatusBadge
label={isBlocked ? 'Bloqueado' : 'Ativo'}
variant={isBlocked ? 'error' : 'success'}
/>
</View>
</SKYCard>

<Text style={styles.warningText}>
{isBlocked
? 'Ao desbloquear, sua linha voltará a funcionar normalmente.'
: 'Ao bloquear, você não poderá fazer/receber chamadas ou usar dados até desbloquear.'}
</Text>

<SKYButton
title={isBlocked ? 'Desbloquear linha' : 'Bloquear linha'}
onPress={handleToggleBlock}
variant={isBlocked ? 'primary' : 'danger'}
loading={loading}
size="large"
icon={<Feather name={isBlocked ? 'unlock' : 'lock'} size={18} color="#FFF" />}
style={{ marginTop: spacing.xxl } as any}
/>
</View>
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
content: { padding: spacing.xxl, alignItems: 'center' },
iconCircle: {
width: 80, height: 80, borderRadius: 40, backgroundColor: colors.surface,
alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl,
},
title: { ...typography.h2, marginBottom: spacing.xl , color: colors.textPrimary },
lineCard: { width: '100%' as any, marginBottom: spacing.xl },
lineRow: {
flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
paddingVertical: spacing.sm,
},
lineLabel: { ...typography.bodySmall, fontWeight: '500' , color: colors.textPrimary },
lineValue: { ...typography.body, fontWeight: '600' , color: colors.textPrimary },
warningText: { ...typography.bodySmall, textAlign: 'center', lineHeight: 20 , color: colors.textPrimary },
});
