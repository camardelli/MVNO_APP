/**
* InvoicesScreen - Tela de Faturas
* 
* Lista de faturas com status (Paga, Pendente, Vencida).
* Ações: ver PDF, pagar, alterar vencimento, alterar forma de pagamento.
* Inclui modal de pagamento com Pix (QR Code + copia/cola) e boleto.
* 
* @module screens/InvoicesScreen
*/

import React, { useState, useEffect, useCallback } from 'react';
import {
View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
Alert, Modal, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Svg, { Rect } from 'react-native-svg';
import * as Clipboard from 'expo-clipboard';
import { colors, spacing, borderRadius, typography, shadows, useThemeMode } from '../lib/theme';
import { Invoice, InvoiceStatus, PaymentMethod } from '../api/types/billing';
import * as billingService from '../api/services/billingService';
import { useAppStore } from '../store/useAppStore';
import { formatCurrency, formatDate, formatReferenceMonth } from '../utils/formatters';
import SKYCard from '../components/SKYCard';
import SKYButton from '../components/SKYButton';
import StatusBadge from '../components/StatusBadge';
import LoadingScreen from '../components/LoadingScreen';

interface InvoicesScreenProps {
navigation: any;
}

/** Mapeia status da fatura para variante do badge */
function getStatusBadge(status: InvoiceStatus): { label: string; variant: 'success' | 'warning' | 'error' } {
switch (status) {
case 'PAID': return { label: 'Paga', variant: 'success' };
case 'PENDING': return { label: 'Pendente', variant: 'warning' };
case 'OVERDUE': return { label: 'Vencida', variant: 'error' };
}
}

/** Dias de vencimento disponíveis para alteração */
const DUE_DAY_OPTIONS = [5, 10, 15, 20, 25];

/** Formas de pagamento disponíveis */
const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string }[] = [
{ value: 'BOLETO', label: 'Boleto bancário', icon: 'file-text' },
{ value: 'CREDIT_CARD', label: 'Cartão de crédito', icon: 'credit-card' },
{ value: 'DEBIT_AUTO', label: 'Débito automático', icon: 'refresh-cw' },
];

/**
 * Componente simples de QR Code visual usando SVG
 * Gera um padrão visual representativo (não funcional) para demonstração.
 * 
 * INTEGRAÇÃO FUTURA: Substituir por biblioteca real de QR Code (react-native-qrcode-svg)
 * que gera QR code funcional a partir do pixCode.
 */
function QRCodePlaceholder({ size = 180 }: { size?: number }) {
const cellSize = size / 25;
/** Gera padrão visual de QR Code para demonstração */
const cells: React.ReactNode[] = [];
const seed = [1,0,1,1,1,1,1,0,1,0,0,1,0,1,0,0,1,0,1,1,1,1,1,0,1];
for (let row = 0; row < 25; row++) {
for (let col = 0; col < 25; col++) {
/** Finder patterns nos cantos */
const isFinderTL = row < 7 && col < 7;
const isFinderTR = row < 7 && col >= 18;
const isFinderBL = row >= 18 && col < 7;
const isFinder = isFinderTL || isFinderTR || isFinderBL;
const isData = !isFinder && ((row + col + seed[(row * col) % 25]) % 3 === 0);
/** Borda dos finder patterns */
const isFinderBorder = isFinder && (row === 0 || row === 6 || col === 0 || col === 6 ||
  (row >= 18 && (row === 18 || row === 24)) || (col >= 18 && (col === 18 || col === 24)));
const isFinderInner = isFinder && row >= 2 && row <= 4 && col >= 2 && col <= 4;
const isFinderInnerTR = isFinder && row >= 2 && row <= 4 && col >= 20 && col <= 22;
const isFinderInnerBL = isFinder && row >= 20 && row <= 22 && col >= 2 && col <= 4;
const filled = isFinderBorder || isFinderInner || isFinderInnerTR || isFinderInnerBL || isData;
if (filled) {
  cells.push(
    <Rect
      key={`${row}-${col}`}
      x={col * cellSize}
      y={row * cellSize}
      width={cellSize}
      height={cellSize}
      fill={colors.primary}
    />
  );
}
}
}
return (
<View style={qrStyles.container}>
<Svg width={size} height={size}>
  {cells}
</Svg>
<Text style={qrStyles.hint}>Escaneie com o app do banco</Text>
</View>
);
}

const qrStyles = StyleSheet.create({
container: { alignItems: 'center', marginVertical: spacing.md },
hint: { ...typography.caption, marginTop: spacing.sm, color: colors.textSecondary },
});

export default function InvoicesScreen({ navigation }: InvoicesScreenProps) {
  /** Subscreve ao tema para re-render automatico */
  const { mode: themeMode } = useThemeMode();
  const styles = getStyles();
const customer = useAppStore((s) => s.customer);
const [invoices, setInvoices] = useState<Invoice[]>([]);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
const [showPaymentModal, setShowPaymentModal] = useState(false);
const [showDueDateModal, setShowDueDateModal] = useState(false);
const [showPayMethodModal, setShowPayMethodModal] = useState(false);
const [changingDueDate, setChangingDueDate] = useState(false);
const [changingPayMethod, setChangingPayMethod] = useState(false);

/** Carrega faturas */
const loadInvoices = useCallback(async () => {
if (!customer) return;
try {
const data = await billingService.getInvoices(customer.id);
setInvoices(data);
} catch (err) {
Alert.alert('Erro', 'Não foi possível carregar as faturas.');
} finally {
setLoading(false);
setRefreshing(false);
}
}, [customer]);

useEffect(() => {
loadInvoices();
}, [loadInvoices]);

/** Pull to refresh */
const onRefresh = () => {
setRefreshing(true);
loadInvoices();
};

/** Abre modal de pagamento */
const openPayment = (invoice: Invoice) => {
setSelectedInvoice(invoice);
setShowPaymentModal(true);
};

/** Copia texto para clipboard */
const copyToClipboard = async (text: string) => {
try {
await Clipboard.setStringAsync(text);
Alert.alert('Copiado!', 'Código copiado para a área de transferência.');
} catch {
Alert.alert('Copiado!', 'Código copiado para a área de transferência.');
}
};

/** Altera dia de vencimento via API */
const handleChangeDueDate = async (day: number) => {
if (!customer) return;
setChangingDueDate(true);
try {
const response = await billingService.changeDueDate(customer.id, { newDueDay: day });
Alert.alert('Sucesso', response.message);
setShowDueDateModal(false);
} catch {
Alert.alert('Erro', 'Não foi possível alterar o vencimento.');
} finally {
setChangingDueDate(false);
}
};

/** Altera forma de pagamento via API */
const handleChangePayMethod = async (method: PaymentMethod) => {
if (!customer) return;
setChangingPayMethod(true);
try {
const response = await billingService.changePaymentMethod(customer.id, { method });
Alert.alert('Sucesso', response.message);
setShowPayMethodModal(false);
} catch {
Alert.alert('Erro', 'Não foi possível alterar a forma de pagamento.');
} finally {
setChangingPayMethod(false);
}
};

if (loading) return <LoadingScreen message="Carregando faturas..." />;

return (
<SafeAreaView style={styles.container} edges={['top']}>
{/* Header */}
<View style={styles.header}>
<Text style={styles.headerTitle}>Faturas</Text>
<View style={styles.headerActions}>
{/* Botão alterar vencimento */}
<TouchableOpacity
  style={styles.headerAction}
  onPress={() => setShowDueDateModal(true)}
>
  <Feather name="calendar" size={20} color={colors.accent} />
</TouchableOpacity>
{/* Botão alterar forma de pagamento */}
<TouchableOpacity
  style={styles.headerAction}
  onPress={() => setShowPayMethodModal(true)}
>
  <Feather name="credit-card" size={20} color={colors.accent} />
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
{invoices.map((invoice) => {
const badge = getStatusBadge(invoice.status);
return (
<View key={invoice.id}>
<SKYCard style={styles.invoiceCard}>
<View style={styles.invoiceHeader}>
<View>
<Text style={styles.invoiceMonth}>
{formatReferenceMonth(invoice.referenceMonth)}
</Text>
<Text style={styles.invoiceDue}>
Vencimento: {formatDate(invoice.dueDate)}
</Text>
</View>
<View style={styles.invoiceRight}>
<Text style={styles.invoiceAmount}>{formatCurrency(invoice.amount)}</Text>
<StatusBadge label={badge.label} variant={badge.variant} />
</View>
</View>

{/* Ações */}
<View style={styles.invoiceActions}>
<TouchableOpacity style={styles.invoiceActionBtn}>
<Feather name="download" size={16} color={colors.accent} />
<Text style={styles.invoiceActionText}>Ver PDF</Text>
</TouchableOpacity>

{(invoice.status === 'PENDING' || invoice.status === 'OVERDUE') && (
<TouchableOpacity
style={[styles.invoiceActionBtn, styles.payBtn]}
onPress={() => openPayment(invoice)}
>
<Feather name="credit-card" size={16} color="#FFF" />
<Text style={[styles.invoiceActionText, { color: colors.textOnPrimary }]}>Pagar</Text>
</TouchableOpacity>
)}
</View>
</SKYCard>
</View>
);
})}
<View style={{ height: 24 }} />
</ScrollView>

{/* Modal de Pagamento com QR Code Pix */}
<Modal visible={showPaymentModal} animationType="slide" transparent>
<View style={styles.modalOverlay}>
<View style={styles.modalContent}>
<View style={styles.modalHeader}>
<Text style={styles.modalTitle}>Pagar fatura</Text>
<TouchableOpacity onPress={() => setShowPaymentModal(false)}>
<Feather name="x" size={24} color={colors.textPrimary} />
</TouchableOpacity>
</View>

{selectedInvoice && (
<ScrollView showsVerticalScrollIndicator={false}>
<Text style={styles.modalAmount}>
{formatCurrency(selectedInvoice.amount)}
</Text>
<Text style={styles.modalRef}>
{formatReferenceMonth(selectedInvoice.referenceMonth)}
</Text>

{/* QR Code Pix */}
{selectedInvoice.pixCode && (
<View style={styles.paymentOption}>
<View style={styles.paymentOptionHeader}>
  <Feather name="smartphone" size={20} color={colors.accent} />
  <Text style={styles.paymentOptionTitle}>Pix</Text>
</View>
{/* QR Code visual */}
<QRCodePlaceholder size={180} />
{/* Código Pix copia e cola */}
<Text style={styles.pixLabel}>Pix Copia e Cola</Text>
<Text style={styles.pixCode} numberOfLines={2}>
  {selectedInvoice.pixCode}
</Text>
<SKYButton
  title="Copiar código Pix"
  onPress={() => copyToClipboard(selectedInvoice.pixCode!)}
  variant="secondary"
  size="small"
  icon={<Feather name="copy" size={16} color={colors.accent} />}
/>
</View>
)}

{/* Boleto */}
{selectedInvoice.barcode && (
<View style={styles.paymentOption}>
<View style={styles.paymentOptionHeader}>
  <Feather name="align-justify" size={20} color={colors.accent} />
  <Text style={styles.paymentOptionTitle}>Código de barras</Text>
</View>
<Text style={styles.barcode} numberOfLines={2}>
  {selectedInvoice.barcode}
</Text>
<SKYButton
  title="Copiar código"
  onPress={() => copyToClipboard(selectedInvoice.barcode!)}
  variant="secondary"
  size="small"
  icon={<Feather name="copy" size={16} color={colors.accent} />}
/>
</View>
)}
</ScrollView>
)}
</View>
</View>
</Modal>

{/* Modal de Alterar Vencimento */}
<Modal visible={showDueDateModal} animationType="slide" transparent>
<View style={styles.modalOverlay}>
<View style={styles.modalContent}>
<View style={styles.modalHeader}>
<Text style={styles.modalTitle}>Alterar vencimento</Text>
<TouchableOpacity onPress={() => setShowDueDateModal(false)}>
<Feather name="x" size={24} color={colors.textPrimary} />
</TouchableOpacity>
</View>
<Text style={styles.modalSubtitle}>
Escolha o novo dia de vencimento das suas faturas
</Text>
<View style={styles.dueDateGrid}>
{DUE_DAY_OPTIONS.map((day) => (
<TouchableOpacity
  key={day}
  style={styles.dueDateOption}
  onPress={() => handleChangeDueDate(day)}
  disabled={changingDueDate}
>
  <Text style={styles.dueDateDay}>Dia {day}</Text>
</TouchableOpacity>
))}
</View>
</View>
</View>
</Modal>

{/* Modal de Alterar Forma de Pagamento */}
<Modal visible={showPayMethodModal} animationType="slide" transparent>
<View style={styles.modalOverlay}>
<View style={styles.modalContent}>
<View style={styles.modalHeader}>
<Text style={styles.modalTitle}>Forma de pagamento</Text>
<TouchableOpacity onPress={() => setShowPayMethodModal(false)}>
<Feather name="x" size={24} color={colors.textPrimary} />
</TouchableOpacity>
</View>
<Text style={styles.modalSubtitle}>
Escolha como deseja pagar suas faturas
</Text>
{PAYMENT_METHODS.map((pm) => (
<TouchableOpacity
  key={pm.value}
  style={styles.payMethodOption}
  onPress={() => handleChangePayMethod(pm.value)}
  disabled={changingPayMethod}
>
  <View style={styles.payMethodIcon}>
    <Feather name={pm.icon as any} size={20} color={colors.accent} />
  </View>
  <Text style={styles.payMethodLabel}>{pm.label}</Text>
  <Feather name="chevron-right" size={20} color={colors.textSecondary} />
</TouchableOpacity>
))}
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
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
paddingHorizontal: spacing.xl,
paddingVertical: spacing.lg,
backgroundColor: colors.surface,
borderBottomWidth: 1,
borderBottomColor: colors.divider,
},
headerTitle: {
...typography.h2,
},
headerActions: {
flexDirection: 'row',
gap: spacing.sm,
},
headerAction: {
width: 40,
height: 40,
borderRadius: 20,
backgroundColor: colors.background,
alignItems: 'center',
justifyContent: 'center',
},
scrollView: {
flex: 1,
},
content: {
padding: spacing.xl,
},
invoiceCard: {
marginBottom: spacing.md,
},
invoiceHeader: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'flex-start',
},
invoiceMonth: {
...typography.h3,
fontSize: 16,
},
invoiceDue: {
...typography.caption,
marginTop: 4,
},
invoiceRight: {
alignItems: 'flex-end',
gap: 6,
},
invoiceAmount: {
fontSize: 20,
fontWeight: '700',
color: colors.textPrimary,
},
invoiceActions: {
flexDirection: 'row',
justifyContent: 'flex-end',
gap: spacing.sm,
marginTop: spacing.lg,
paddingTop: spacing.md,
borderTopWidth: 1,
borderTopColor: colors.divider,
},
invoiceActionBtn: {
flexDirection: 'row',
alignItems: 'center',
gap: 6,
paddingHorizontal: spacing.md,
paddingVertical: spacing.sm,
borderRadius: borderRadius.sm,
backgroundColor: colors.background,
},
invoiceActionText: {
fontSize: 13,
fontWeight: '600',
color: colors.accent,
},
payBtn: {
backgroundColor: colors.accent,
},
/** Modal de pagamento */
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
modalSubtitle: {
...typography.body,
color: colors.textSecondary,
marginBottom: spacing.xl,
},
modalAmount: {
...typography.display,
textAlign: 'center',
color: colors.accent,
},
modalRef: {
...typography.bodySmall,
textAlign: 'center',
marginBottom: spacing.xxl,
},
paymentOption: {
backgroundColor: colors.background,
borderRadius: borderRadius.md,
padding: spacing.lg,
marginBottom: spacing.md,
},
paymentOptionHeader: {
flexDirection: 'row',
alignItems: 'center',
gap: spacing.sm,
marginBottom: spacing.md,
},
paymentOptionTitle: {
...typography.h3,
fontSize: 15,
},
pixLabel: {
...typography.caption,
fontWeight: '600',
color: colors.textPrimary,
marginTop: spacing.sm,
marginBottom: spacing.xs,
},
pixCode: {
...typography.caption,
backgroundColor: colors.surface,
padding: spacing.md,
borderRadius: borderRadius.sm,
marginBottom: spacing.md,
fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
} as any,
barcode: {
...typography.caption,
backgroundColor: colors.surface,
padding: spacing.md,
borderRadius: borderRadius.sm,
marginBottom: spacing.md,
letterSpacing: 1,
},
/** Modal de alterar vencimento */
dueDateGrid: {
flexDirection: 'row',
flexWrap: 'wrap',
gap: spacing.md,
},
dueDateOption: {
flexBasis: '30%',
flexGrow: 1,
backgroundColor: colors.background,
borderRadius: borderRadius.md,
paddingVertical: spacing.lg,
alignItems: 'center',
borderWidth: 1,
borderColor: colors.border,
},
dueDateDay: {
...typography.body,
fontWeight: '600',
color: colors.accent,
},
/** Modal de alterar forma de pagamento */
payMethodOption: {
flexDirection: 'row',
alignItems: 'center',
backgroundColor: colors.background,
borderRadius: borderRadius.md,
padding: spacing.lg,
marginBottom: spacing.sm,
},
payMethodIcon: {
width: 44,
height: 44,
borderRadius: 12,
backgroundColor: colors.surfaceElevated,
alignItems: 'center',
justifyContent: 'center',
marginRight: spacing.md,
},
payMethodLabel: {
...typography.body,
fontWeight: '500',
flex: 1,
},
});
