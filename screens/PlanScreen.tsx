/**
* PlanScreen - Tela Meu Plano
* 
* Exibe detalhes do plano atual e opção de trocar de plano.
* 
* @module screens/PlanScreen
*/

import React, { useState, useEffect } from 'react';
import {
View, Text, StyleSheet, ScrollView, Alert, Modal, FlatList,
TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, useThemeMode } from '../lib/theme';
import { useAppStore } from '../store/useAppStore';
import { AvailablePlan } from '../api/types/plan';
import * as planService from '../api/services/planService';
import { formatCurrency, formatDate } from '../utils/formatters';
import SKYCard from '../components/SKYCard';
import SKYButton from '../components/SKYButton';
import StatusBadge from '../components/StatusBadge';
import LoadingScreen from '../components/LoadingScreen';

interface PlanScreenProps {
navigation: any;
}

/** Mapa de ícones dos apps inclusos */
const appIcons: Record<string, string> = {
WhatsApp: 'message-circle',
Instagram: 'instagram',
Facebook: 'facebook',
TikTok: 'music',
};

export default function PlanScreen({ navigation }: PlanScreenProps) {
  /** Subscreve ao tema para re-render automatico */
  const { mode: themeMode } = useThemeMode();
  const styles = getStyles();
const customer = useAppStore((s: any) => s.customer);
const currentPlan = useAppStore((s: any) => s.currentPlan);
const [availablePlans, setAvailablePlans] = useState<AvailablePlan[]>([]);
const [showChangePlan, setShowChangePlan] = useState(false);
const [changingPlan, setChangingPlan] = useState(false);
const [refreshing, setRefreshing] = useState(false);

/** Pull-to-refresh: recarrega dados do plano atual */
const handleRefresh = async () => {
  setRefreshing(true);
  try {
    if (customer) {
      await planService.getCurrentPlan(customer.id);
    }
  } catch {
    // Silencioso - dados do cache permanecem
  } finally {
    setRefreshing(false);
  }
};

/** Carrega planos disponíveis ao abrir modal */
const openChangePlan = async () => {
try {
const plans = await planService.getAvailablePlans();
setAvailablePlans(plans);
setShowChangePlan(true);
} catch {
Alert.alert('Erro', 'Não foi possível carregar os planos disponíveis.');
}
};

/** Confirma troca de plano */
const confirmChangePlan = (plan: AvailablePlan) => {
Alert.alert(
'Confirmar troca',
`Deseja trocar para o ${plan.name} por ${formatCurrency(plan.monthlyPrice)}/mês?`,
[
{ text: 'Cancelar', style: 'cancel' },
{
text: 'Confirmar',
onPress: async () => {
setChangingPlan(true);
try {
const response = await planService.changePlan(customer!.id, {
newPlanId: plan.id,
});
setShowChangePlan(false);
Alert.alert('Sucesso!', response.message);
} catch {
Alert.alert('Erro', 'Não foi possível trocar de plano.');
} finally {
setChangingPlan(false);
}
},
},
]
);
};

if (!currentPlan) return <LoadingScreen message="Carregando plano..." />;

return (
<SafeAreaView style={styles.container} edges={['top']}>
{/* Header */}
<View style={styles.header}>
<Text style={styles.headerTitle}>Meu Plano</Text>
</View>

<ScrollView
style={styles.scrollView}
contentContainerStyle={styles.content}
showsVerticalScrollIndicator={false}
refreshControl={
  <RefreshControl
    refreshing={refreshing}
    onRefresh={handleRefresh}
    colors={[colors.primary]}
    tintColor={colors.primary}
  />
}
>
{/* Card do plano atual */}
<SKYCard style={styles.planCard}>
<View style={styles.planBadge}>
<StatusBadge label="Plano atual" variant="info" />
</View>
<Text style={styles.planName}>{currentPlan.name}</Text>
<Text style={styles.planPrice}>
{formatCurrency(currentPlan.monthlyPrice)}
<Text style={styles.planPriceLabel}>/mês</Text>
</Text>

<View style={styles.divider} />

{/* Detalhes do plano */}
<View style={styles.planDetails}>
<View style={styles.detailRow}>
<Feather name="database" size={18} color={colors.accent} />
<Text style={styles.detailText}>
{currentPlan.dataGB} GB de dados
</Text>
</View>
<View style={styles.detailRow}>
<Feather name="message-square" size={18} color={colors.accent} />
<Text style={styles.detailText}>
{currentPlan.smsQuantity} SMS
</Text>
</View>
<View style={styles.detailRow}>
<Feather name="phone" size={18} color={colors.accent} />
<Text style={styles.detailText}>
{currentPlan.voiceMinutes === null ? 'Minutos ilimitados' : `${currentPlan.voiceMinutes} minutos`}
</Text>
</View>
<View style={styles.detailRow}>
<Feather name="calendar" size={18} color={colors.accent} />
<Text style={styles.detailText}>
Renova em {formatDate(currentPlan.renewalDate)}
</Text>
</View>
</View>

{/* Apps inclusos */}
{currentPlan.includedApps.length > 0 && (
<>
<View style={styles.divider} />
<Text style={styles.subsectionTitle}>Apps sem desconto da franquia</Text>
<View style={styles.appsRow}>
{currentPlan.includedApps.map((app: string) => (
<View key={app} style={styles.appChip}>
<Feather
name={(appIcons[app] || 'smartphone') as any}
size={14}
color={colors.accent}
/>
<Text style={styles.appChipText}>{app}</Text>
</View>
))}
</View>
</>
)}
</SKYCard>

{/* Botão trocar plano */}
<SKYButton
title="Trocar de plano"
onPress={openChangePlan}
size="large"
icon={<Feather name="repeat" size={18} color="#FFF" />}
style={{ marginBottom: spacing.lg } as any}
/>

{/* Outros botões */}
<SKYCard
onPress={() => navigation.navigate('BuyData')}
style={styles.actionCard}
>
<View style={styles.actionCardContent}>
<View style={styles.actionCardIcon}>
<Feather name="plus-circle" size={22} color={colors.accent} />
</View>
<View style={styles.actionCardText}>
<Text style={styles.actionCardTitle}>Comprar dados extras</Text>
<Text style={styles.actionCardSubtitle}>Pacotes a partir de R$ 9,90</Text>
</View>
<Feather name="chevron-right" size={20} color={colors.textSecondary} />
</View>
</SKYCard>

<SKYCard
onPress={() => navigation.navigate('ChipActivation')}
style={styles.actionCard}
>
<View style={styles.actionCardContent}>
<View style={styles.actionCardIcon}>
<Feather name="cpu" size={22} color={colors.success} />
</View>
<View style={styles.actionCardText}>
<Text style={styles.actionCardTitle}>Ativar novo chip</Text>
<Text style={styles.actionCardSubtitle}>Ativação rápida pelo app</Text>
</View>
<Feather name="chevron-right" size={20} color={colors.textSecondary} />
</View>
</SKYCard>

<View style={{ height: 24 }} />
</ScrollView>

{/* Modal de troca de plano */}
<Modal visible={showChangePlan} animationType="slide" transparent>
<View style={styles.modalOverlay}>
<View style={styles.modalContent}>
<View style={styles.modalHeader}>
<Text style={styles.modalTitle}>Trocar de plano</Text>
<TouchableOpacity onPress={() => setShowChangePlan(false)}>
<Feather name="x" size={24} color={colors.textPrimary} />
</TouchableOpacity>
</View>

<FlatList
data={availablePlans}
keyExtractor={(p) => p.id}
showsVerticalScrollIndicator={false}
renderItem={({ item: plan }) => {
const isCurrent = plan.id === currentPlan?.id;
return (
<TouchableOpacity
style={[styles.planOption, isCurrent && styles.planOptionCurrent]}
onPress={() => !isCurrent && confirmChangePlan(plan)}
disabled={isCurrent || changingPlan}
>
<View style={styles.planOptionHeader}>
<Text style={styles.planOptionName}>{plan.name}</Text>
{plan.highlight && (
<StatusBadge label={plan.highlight} variant="success" />
)}
{isCurrent && (
<StatusBadge label="Atual" variant="info" />
)}
</View>
<Text style={styles.planOptionPrice}>
{formatCurrency(plan.monthlyPrice)}/mês
</Text>
<View style={styles.planOptionDetails}>
<Text style={styles.planOptionDetail}>
{plan.dataGB}GB • {plan.smsQuantity} SMS • {plan.voiceMinutes === null ? 'Ilimitado' : `${plan.voiceMinutes}min`}
</Text>
</View>
{plan.includedApps.length > 0 && (
<Text style={styles.planOptionApps}>
Apps: {plan.includedApps.join(', ')}
</Text>
)}
</TouchableOpacity>
);
}}
/>
</View>
</View>
</Modal>
</SafeAreaView>
);
}

const getStyles = () => StyleSheet.create({
container: {
flex: 1,
backgroundColor: colors.background,
},
header: {
paddingHorizontal: spacing.xl,
paddingVertical: spacing.lg,
backgroundColor: colors.surface,
borderBottomWidth: 1,
borderBottomColor: colors.divider,
},
headerTitle: {
...typography.h2,
},
scrollView: {
flex: 1,
},
content: {
padding: spacing.xl,
},
planCard: {
marginBottom: spacing.lg,
},
planBadge: {
marginBottom: spacing.md,
},
planName: {
...typography.h1,
marginBottom: spacing.xs,
},
planPrice: {
fontSize: 28,
fontWeight: '700',
color: colors.accent,
},
planPriceLabel: {
fontSize: 16,
fontWeight: '400',
color: colors.textSecondary,
},
divider: {
height: 1,
backgroundColor: colors.divider,
marginVertical: spacing.lg,
},
planDetails: {
gap: spacing.md,
},
detailRow: {
flexDirection: 'row',
alignItems: 'center',
gap: spacing.md,
},
detailText: {
...typography.body,
},
subsectionTitle: {
...typography.bodySmall,
fontWeight: '600',
color: colors.textPrimary,
marginBottom: spacing.md,
},
appsRow: {
flexDirection: 'row',
flexWrap: 'wrap',
gap: spacing.sm,
},
appChip: {
flexDirection: 'row',
alignItems: 'center',
gap: 6,
backgroundColor: colors.surfaceElevated,
paddingHorizontal: spacing.md,
paddingVertical: spacing.sm,
borderRadius: borderRadius.full,
},
appChipText: {
fontSize: 13,
fontWeight: '500',
color: colors.accent,
},
actionCard: {
marginBottom: spacing.md,
},
actionCardContent: {
flexDirection: 'row',
alignItems: 'center',
},
actionCardIcon: {
width: 44,
height: 44,
borderRadius: 12,
backgroundColor: colors.background,
alignItems: 'center',
justifyContent: 'center',
marginRight: spacing.md,
},
actionCardText: {
flex: 1,
},
actionCardTitle: {
...typography.body,
fontWeight: '600',
},
actionCardSubtitle: {
...typography.caption,
marginTop: 2,
},
/** Modal */
modalOverlay: {
flex: 1,
backgroundColor: colors.overlay,
justifyContent: 'flex-end',
},
modalContent: {
backgroundColor: colors.surface,
borderTopLeftRadius: borderRadius.xl,
borderTopRightRadius: borderRadius.xl,
padding: spacing.xxl,
maxHeight: '85%',
},
modalHeader: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
marginBottom: spacing.xl,
},
modalTitle: {
...typography.h2,
},
planOption: {
backgroundColor: colors.background,
borderRadius: borderRadius.md,
padding: spacing.lg,
marginBottom: spacing.md,
borderWidth: 2,
borderColor: 'transparent',
},
planOptionCurrent: {
borderColor: colors.accent,
backgroundColor: colors.surfaceElevated,
},
planOptionHeader: {
flexDirection: 'row',
alignItems: 'center',
gap: spacing.sm,
marginBottom: spacing.xs,
},
planOptionName: {
...typography.h3,
fontSize: 16,
flex: 1,
},
planOptionPrice: {
fontSize: 20,
fontWeight: '700',
color: colors.accent,
marginBottom: spacing.xs,
},
planOptionDetails: {
marginBottom: 4,
},
planOptionDetail: {
...typography.bodySmall,
},
planOptionApps: {
...typography.caption,
color: colors.accent,
},
});
