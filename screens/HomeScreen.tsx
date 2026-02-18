/**
* HomeScreen - Dashboard principal
* 
* Exibe consumo de dados (anel gráfico), SMS, minutos,
* próxima fatura, plano atual e atalhos rápidos.
* 
* Para clientes COMBO, exibe card adicional do SKY+.
* 
* @module screens/HomeScreen
*/

import React, { useCallback, useState, useEffect } from 'react';
import {
View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows, useThemeMode } from '../lib/theme';
import { useAppStore } from '../store/useAppStore';
import { getFirstName, formatCurrency, formatDate } from '../utils/formatters';
import { Invoice } from '../api/types/billing';
import * as billingService from '../api/services/billingService';
import SKYCard from '../components/SKYCard';
import SKYButton from '../components/SKYButton';
import ConsumptionRing from '../components/ConsumptionRing';

interface HomeScreenProps {
navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  /** Subscreve ao tema para re-render automatico */
  const { mode: themeMode } = useThemeMode();
  const styles = getStyles();
const customer = useAppStore((s) => s.customer);
const consumption = useAppStore((s) => s.consumption);
const currentPlan = useAppStore((s) => s.currentPlan);
const profileType = useAppStore((s) => s.profileType);
const notifications = useAppStore((s) => s.notifications);
const refreshConsumption = useAppStore((s) => s.refreshConsumption);
const loadCustomerData = useAppStore((s) => s.loadCustomerData);

const [refreshing, setRefreshing] = useState(false);
const [nextInvoice, setNextInvoice] = useState<Invoice | null>(null);

/** Carrega dados do cliente ao montar a tela (pós-login ou restore) */
useEffect(() => {
  if (!customer || !consumption) {
    loadCustomerData();
  }
}, []);

/** Carrega próxima fatura pendente */
useEffect(() => {
const loadNextInvoice = async () => {
if (!customer) return;
try {
const invoices = await billingService.getInvoices(customer.id);
/** Busca primeira fatura pendente ou vencida */
const pending = invoices.find((inv) => inv.status === 'PENDING' || inv.status === 'OVERDUE');
setNextInvoice(pending || null);
} catch { }
};
loadNextInvoice();
}, [customer]);

/** Contagem de notificações não lidas */
const unreadCount = notifications.filter((n) => !n.read).length;

/** Pull-to-refresh handler */
const onRefresh = useCallback(async () => {
setRefreshing(true);
await loadCustomerData();
setRefreshing(false);
}, []);

/** Cor da barra de progresso baseada no percentual */
const getProgressColor = (percent: number) => {
if (percent < 70) return colors.success;
if (percent < 90) return colors.warning;
return colors.error;
};

return (
<SafeAreaView style={styles.container} edges={['top']}>
{/* Header */}
<View style={styles.header}>
<View style={styles.headerLeft}>
{/* Avatar com iniciais do usuário */}
<View style={styles.avatar}>
<Text style={styles.avatarText}>
{customer ? customer.fullName.split(' ').map(n => n[0]).slice(0, 2).join('') : ''}
</Text>
</View>
<View>
<Text style={styles.greeting}>
Olá, {customer ? getFirstName(customer.fullName) : ''}!
</Text>
<Text style={styles.subtitle}>Bem-vindo ao SKY Móvel</Text>
</View>
</View>
<View style={styles.headerIcons}>
{/* Ícone de notificações com badge */}
<TouchableOpacity 
style={styles.iconButton}
onPress={() => navigation.navigate('Notifications')}
>
<Feather name="bell" size={22} color={colors.textPrimary} />
{unreadCount > 0 && (
<View style={styles.badge}>
<Text style={styles.badgeText}>{unreadCount}</Text>
</View>
)}
</TouchableOpacity>
</View>
</View>

<ScrollView
style={styles.scrollView}
contentContainerStyle={styles.content}
showsVerticalScrollIndicator={false}
refreshControl={
<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />
}
>
{/* Card Principal - Consumo de Dados */}
{consumption && (
<SKYCard style={styles.mainCard}>
<View style={styles.mainCardHeader}>
<Text style={styles.cardTitle}>Consumo de dados</Text>
<Text style={styles.daysRemaining}>
{consumption.daysRemaining} dias restantes
</Text>
</View>

<View style={styles.consumptionCenter}>
<ConsumptionRing
usedGB={consumption.data.usedGB}
totalGB={consumption.data.totalGB}
percentUsed={consumption.data.percentUsed}
/>
</View>

{/* Barra de progresso */}
<View style={styles.progressBarContainer}>
<View style={styles.progressBarBg}>
<View
style={[
styles.progressBarFill,
{
width: `${Math.min(consumption.data.percentUsed, 100)}%`,
backgroundColor: getProgressColor(consumption.data.percentUsed),
},
]}
/>
</View>
<Text style={styles.percentText}>
{consumption.data.percentUsed.toFixed(0)}% utilizado
</Text>
</View>

<SKYButton
title="Comprar mais dados"
onPress={() => navigation.navigate('BuyData')}
variant="secondary"
size="medium"
icon={<Feather name="plus-circle" size={18} color={colors.accent} />}
style={{ marginTop: spacing.lg } as any}
/>
</SKYCard>
)}

{/* Cards Secundários - Grid 2x2 */}
<View style={styles.grid}>
{/* SMS */}
{consumption && (
<SKYCard style={styles.gridCard}>
<Feather name="message-square" size={22} color={colors.accent} />
<Text style={styles.gridValue}>
{consumption.sms.used}/{consumption.sms.total}
</Text>
<Text style={styles.gridLabel}>SMS</Text>
</SKYCard>
)}

{/* Minutos */}
{consumption && (
<SKYCard style={styles.gridCard}>
<Feather name="phone" size={22} color={colors.success} />
<Text style={styles.gridValue}>
{consumption.voice.totalMinutes === null
? 'Ilimitado'
: `${consumption.voice.usedMinutes}/${consumption.voice.totalMinutes}`}
</Text>
<Text style={styles.gridLabel}>Minutos</Text>
</SKYCard>
)}

{/* Próxima fatura - com valor E data de vencimento */}
<SKYCard
style={styles.gridCard}
onPress={() => navigation.navigate('Faturas')}
>
<Feather name="file-text" size={22} color={colors.warning} />
<Text style={styles.gridValue}>
{nextInvoice ? formatCurrency(nextInvoice.amount) : (currentPlan ? formatCurrency(currentPlan.monthlyPrice) : '--')}
</Text>
<Text style={styles.gridLabel}>
{nextInvoice ? `vence ${formatDate(nextInvoice.dueDate)}` : 'Próxima fatura'}
</Text>
</SKYCard>

{/* Meu plano */}
<SKYCard
style={styles.gridCard}
onPress={() => navigation.navigate('Plano')}
>
<Feather name="wifi" size={22} color={colors.primary} />
<Text style={styles.gridValue} numberOfLines={1}>
{currentPlan ? currentPlan.name.replace('SKY Móvel ', '') : '--'}
</Text>
<Text style={styles.gridLabel}>Meu plano</Text>
</SKYCard>
</View>

{/* Card COMBO (se perfil SKY_MOVEL_COMBO) */}
{profileType === 'SKY_MOVEL_COMBO' && (
<SKYCard style={styles.comboCard}>
<View style={styles.comboContent}>
<View style={styles.comboIcon}>
<Feather name="tv" size={24} color="#FFFFFF" />
</View>
<View style={styles.comboTextContainer}>
<Text style={styles.comboTitle}>SKY+ Ativo</Text>
<Text style={styles.comboSubtitle}>
Seu pacote combo inclui TV e streaming
</Text>
</View>
<Feather name="chevron-right" size={24} color={colors.textSecondary} />
</View>
</SKYCard>
)}

{/* Atalhos rápidos */}
<View style={styles.quickActions}>
<Text style={styles.sectionTitle}>Acesso rápido</Text>
<View style={styles.actionsRow}>
{[
{ icon: 'zap', label: 'Ativar Chip', screen: 'ChipActivation' },
{ icon: 'repeat', label: 'Portabilidade', screen: 'Portability' },
{ icon: 'headphones', label: 'Suporte', screen: 'ServiceHistory' },
].map((action) => (
<TouchableOpacity
key={action.label}
style={styles.actionItem}
onPress={() => navigation.navigate(action.screen)}
>
<View style={styles.actionIcon}>
<Feather name={action.icon as any} size={20} color={colors.accent} />
</View>
<Text style={styles.actionLabel}>{action.label}</Text>
</TouchableOpacity>
))}
</View>
</View>

<View style={{ height: 24 }} />
</ScrollView>
</SafeAreaView>
);
}

const getStyles = () => StyleSheet.create({
container: {
flex: 1,
backgroundColor: colors.background,
},
header: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
paddingHorizontal: spacing.xl,
paddingVertical: spacing.lg,
backgroundColor: colors.surface,
borderBottomWidth: 1,
borderBottomColor: colors.divider,
},
headerLeft: {
flexDirection: 'row',
alignItems: 'center',
gap: spacing.md,
},
avatar: {
width: 44,
height: 44,
borderRadius: 22,
backgroundColor: colors.primary,
alignItems: 'center',
justifyContent: 'center',
},
avatarText: {
color: colors.textOnPrimary,
fontSize: 16,
fontWeight: '700',
},
greeting: {
...typography.h2,
fontSize: 20,
},
subtitle: {
...typography.bodySmall,
marginTop: 2,
},
headerIcons: {
flexDirection: 'row',
gap: 12,
},
iconButton: {
width: 44,
height: 44,
borderRadius: 22,
backgroundColor: colors.background,
alignItems: 'center',
justifyContent: 'center',
},
badge: {
position: 'absolute',
top: 4,
right: 4,
backgroundColor: colors.secondary,
borderRadius: 10,
minWidth: 18,
height: 18,
alignItems: 'center',
justifyContent: 'center',
paddingHorizontal: 4,
},
badgeText: {
color: colors.textOnPrimary,
fontSize: 10,
fontWeight: '700',
},
scrollView: {
flex: 1,
},
content: {
padding: spacing.xl,
},
mainCard: {
marginBottom: spacing.lg,
},
mainCardHeader: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
marginBottom: spacing.lg,
},
cardTitle: {
...typography.h3,
},
daysRemaining: {
...typography.caption,
color: colors.accent,
fontWeight: '600',
},
consumptionCenter: {
  alignItems: 'center',
  marginBottom: spacing.lg,
  height: 280,
},
progressBarContainer: {
alignItems: 'flex-end',
},
progressBarBg: {
width: '100%',
height: 6,
backgroundColor: colors.border,
borderRadius: 3,
overflow: 'hidden',
},
progressBarFill: {
height: '100%',
borderRadius: 3,
},
percentText: {
...typography.caption,
marginTop: spacing.xs,
},
grid: {
flexDirection: 'row',
flexWrap: 'wrap',
gap: spacing.md,
marginBottom: spacing.lg,
},
gridCard: {
  width: '47%' as any,
  height: 95,
  flexBasis: '47%',
  justifyContent: 'center' as any,
  alignItems: 'flex-start' as any,
},
gridValue: {
fontSize: 18,
fontWeight: '700',
color: colors.textPrimary,
marginTop: spacing.sm,
},
gridLabel: {
...typography.caption,
marginTop: 2,
},
comboCard: {
marginBottom: spacing.lg,
backgroundColor: colors.primary,
},
comboContent: {
flexDirection: 'row',
alignItems: 'center',
},
comboIcon: {
width: 44,
height: 44,
borderRadius: 12,
backgroundColor: 'rgba(255,255,255,0.15)',
alignItems: 'center',
justifyContent: 'center',
marginRight: spacing.md,
},
comboTextContainer: {
flex: 1,
},
comboTitle: {
color: colors.textOnPrimary,
fontSize: 16,
fontWeight: '700',
},
comboSubtitle: {
color: 'rgba(255,255,255,0.7)',
fontSize: 13,
marginTop: 2,
},
sectionTitle: {
...typography.h3,
marginBottom: spacing.lg,
},
quickActions: {
marginTop: spacing.sm,
},
actionsRow: {
flexDirection: 'row',
justifyContent: 'space-around',
},
actionItem: {
alignItems: 'center',
width: 80,
},
actionIcon: {
width: 52,
height: 52,
borderRadius: 16,
backgroundColor: colors.surfaceElevated,
alignItems: 'center',
justifyContent: 'center',
marginBottom: spacing.sm,
},
actionLabel: {
...typography.caption,
color: colors.textPrimary,
fontWeight: '500',
textAlign: 'center',
},
});