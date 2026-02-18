/**
* CancellationScreen - Fluxo de Cancelamento
* 
* Fluxo completo em steps conforme spec:
* 1. Confirmar intenção (mostra benefícios atuais para retenção)
* 2. Oferta de retenção
* 3. Informar sobre multa/fidelidade (se houver)
* 4. Motivo do cancelamento
* 5. Confirmação final e protocolo
* 
* @module screens/CancellationScreen
*/

import React, { useState } from 'react';
import {
View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, useThemeMode } from '../lib/theme';
import { useAppStore } from '../store/useAppStore';
import * as serviceRequestService from '../api/services/serviceRequestService';
import SKYCard from '../components/SKYCard';
import SKYButton from '../components/SKYButton';
import { formatCurrency } from '../utils/formatters';

interface CancellationScreenProps {
navigation: any;
}

/** Motivos de cancelamento disponíveis */
const CANCELLATION_REASONS = [
'Preço alto',
'Cobertura insatisfatória',
'Mudança para outra operadora',
'Não uso mais',
'Problemas com atendimento',
'Outro',
];

/**
 * Mock de dados de fidelidade do cliente.
 * INTEGRAÇÃO FUTURA: Buscar via API GET /api/v1/customers/{id}/contract
 */
const MOCK_FIDELITY = {
hasFidelity: true,
endDate: '2026-07-15',
penaltyAmount: 150.00,
remainingMonths: 5,
};

export default function CancellationScreen({ navigation }: CancellationScreenProps) {
  /** Subscreve ao tema para re-render automatico */
  const { mode: themeMode } = useThemeMode();
  const styles = getStyles();
const customer = useAppStore((s) => s.customer);
const currentPlan = useAppStore((s) => s.currentPlan);
const [step, setStep] = useState(1);
const [reason, setReason] = useState('');
const [feedback, setFeedback] = useState('');
const [loading, setLoading] = useState(false);
const [protocol, setProtocol] = useState('');

/** Executa cancelamento via API */
const handleCancel = async () => {
Alert.alert(
'Cancelamento definitivo',
'Esta ação não pode ser desfeita. Deseja realmente cancelar sua linha?',
[
{ text: 'Não, voltar', style: 'cancel' },
{
text: 'Sim, cancelar',
style: 'destructive',
onPress: async () => {
setLoading(true);
try {
const response = await serviceRequestService.createServiceRequest({
type: 'CANCELLATION',
customerId: customer!.id,
lineId: customer!.mobileLines[0]?.msisdn || '',
details: { reason, feedback },
});
setProtocol(response.protocol);
setStep(5);
} catch {
Alert.alert('Erro', 'Não foi possível processar o cancelamento.');
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
<TouchableOpacity onPress={() => {
if (step === 5) navigation.navigate('Home');
else if (step > 1) setStep(step - 1);
else navigation.goBack();
}} style={styles.backBtn}>
<Feather name="arrow-left" size={24} color={colors.textPrimary} />
</TouchableOpacity>
<Text style={styles.headerTitle}>Cancelamento</Text>
<View style={{ width: 40 }} />
</View>

{/* Stepper (oculto no step final) */}
{step < 5 && (
<View style={styles.stepper}>
{[1, 2, 3, 4].map((s) => (
<View key={s} style={[styles.stepDot, s <= step && styles.stepDotActive]} />
))}
</View>
)}

<ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
{/* Step 1: Confirmar intenção + Mostrar benefícios atuais */}
{step === 1 && (
<>
<View style={styles.warningBox}>
<Feather name="alert-triangle" size={24} color={colors.warning} />
<Text style={styles.warningTitle}>Tem certeza?</Text>
<Text style={styles.warningText}>
Ao cancelar, você perderá os seguintes benefícios:
</Text>
</View>

<SKYCard style={styles.benefitsCard}>
<Text style={styles.benefitsTitle}>Seus benefícios atuais</Text>
<View style={styles.benefitRow}>
<Feather name="database" size={16} color={colors.accent} />
<Text style={styles.benefitText}>{currentPlan?.dataGB}GB de dados</Text>
</View>
<View style={styles.benefitRow}>
<Feather name="message-square" size={16} color={colors.accent} />
<Text style={styles.benefitText}>{currentPlan?.smsQuantity} SMS</Text>
</View>
<View style={styles.benefitRow}>
<Feather name="phone" size={16} color={colors.accent} />
<Text style={styles.benefitText}>Minutos ilimitados</Text>
</View>
<View style={styles.benefitRow}>
<Feather name="tag" size={16} color={colors.accent} />
<Text style={styles.benefitText}>
Por apenas {formatCurrency(currentPlan?.monthlyPrice || 0)}/mês
</Text>
</View>
</SKYCard>

<SKYButton
title="Continuar com cancelamento"
onPress={() => setStep(2)}
variant="ghost"
size="large"
style={{ marginTop: spacing.lg } as any}
/>
</>
)}

{/* Step 2: Oferta de retenção */}
{step === 2 && (
<>
<SKYCard style={styles.retentionCard}>
<View style={styles.retentionIconCircle}>
<Feather name="gift" size={32} color={colors.accent} />
</View>
<Text style={styles.retentionTitle}>Oferta especial para você!</Text>
<Text style={styles.retentionText}>
Antes de cancelar, que tal aproveitar uma condição exclusiva?
</Text>
<View style={styles.retentionOffer}>
<Text style={styles.retentionOfferTitle}>SKY Móvel 25GB</Text>
<Text style={styles.retentionOfferPrice}>
{formatCurrency(34.95)}/mês
</Text>
<Text style={styles.retentionOfferDetail}>
50% de desconto por 3 meses
</Text>
</View>
<SKYButton
title="Aceitar oferta"
onPress={() => {
Alert.alert('Oferta aceita!', 'Entraremos em contato para finalizar.', [
{ text: 'OK', onPress: () => navigation.goBack() },
]);
}}
size="large"
style={{ marginTop: spacing.md } as any}
/>
</SKYCard>

<SKYButton
title="Não tenho interesse, continuar"
onPress={() => setStep(3)}
variant="ghost"
size="medium"
style={{ marginTop: spacing.xl } as any}
/>
</>
)}

{/* Step 3: Informar sobre multa/fidelidade */}
{step === 3 && (
<>
<Text style={styles.sectionTitle}>Fidelidade e multa</Text>

{MOCK_FIDELITY.hasFidelity ? (
<SKYCard style={styles.fidelityCard}>
<View style={styles.fidelityHeader}>
<Feather name="alert-circle" size={22} color={colors.warning} />
<Text style={styles.fidelityTitle}>Contrato com fidelidade</Text>
</View>
<Text style={styles.fidelityDescription}>
Seu contrato possui fidelidade até {new Date(MOCK_FIDELITY.endDate).toLocaleDateString('pt-BR')}.
O cancelamento antecipado implica em multa proporcional.
</Text>
<View style={styles.fidelityDetails}>
<View style={styles.fidelityRow}>
<Text style={styles.fidelityLabel}>Meses restantes</Text>
<Text style={styles.fidelityValue}>{MOCK_FIDELITY.remainingMonths} meses</Text>
</View>
<View style={styles.fidelityRow}>
<Text style={styles.fidelityLabel}>Multa estimada</Text>
<Text style={[styles.fidelityValue, { color: colors.error }]}>
  {formatCurrency(MOCK_FIDELITY.penaltyAmount)}
</Text>
</View>
<View style={styles.fidelityRow}>
<Text style={styles.fidelityLabel}>Fim da fidelidade</Text>
<Text style={styles.fidelityValue}>
  {new Date(MOCK_FIDELITY.endDate).toLocaleDateString('pt-BR')}
</Text>
</View>
</View>
</SKYCard>
) : (
<SKYCard style={styles.noFidelityCard}>
<Feather name="check-circle" size={22} color={colors.success} />
<Text style={styles.noFidelityText}>
Seu contrato não possui fidelidade. Nenhuma multa será cobrada.
</Text>
</SKYCard>
)}

<SKYButton
title="Estou ciente, continuar"
onPress={() => setStep(4)}
variant="danger"
size="large"
style={{ marginTop: spacing.xxl } as any}
/>
</>
)}

{/* Step 4: Motivo do cancelamento */}
{step === 4 && (
<>
<Text style={styles.sectionTitle}>Motivo do cancelamento</Text>
{CANCELLATION_REASONS.map((r) => (
<TouchableOpacity
key={r}
style={[styles.reasonOption, reason === r && styles.reasonOptionActive]}
onPress={() => setReason(r)}
>
<View style={[styles.radio, reason === r && styles.radioActive]}>
{reason === r && <View style={styles.radioFill} />}
</View>
<Text style={styles.reasonText}>{r}</Text>
</TouchableOpacity>
))}

<View style={styles.inputGroup}>
<Text style={styles.label}>Comentário (opcional)</Text>
<TextInput
style={styles.textArea}
placeholder="Conte-nos mais sobre sua decisão..."
placeholderTextColor={colors.inputPlaceholder}
value={feedback}
onChangeText={setFeedback}
multiline
numberOfLines={4}
textAlignVertical="top"
/>
</View>

<SKYButton
title="Solicitar cancelamento"
onPress={handleCancel}
variant="danger"
loading={loading}
disabled={!reason}
size="large"
style={{ marginTop: spacing.xl } as any}
/>
</>
)}

{/* Step 5: Protocolo de cancelamento (confirmação final) */}
{step === 5 && (
<View style={styles.protocolContainer}>
<View style={styles.protocolIconCircle}>
<Feather name="check" size={40} color={colors.surface} />
</View>
<Text style={styles.protocolTitle}>Cancelamento registrado</Text>
<Text style={styles.protocolMessage}>
Sua solicitação de cancelamento foi registrada e será processada em até 5 dias úteis.
</Text>

<SKYCard style={styles.protocolCard}>
<Text style={styles.protocolLabel}>Número do protocolo</Text>
<Text style={styles.protocolNumber}>{protocol}</Text>
<Text style={styles.protocolHint}>
Guarde este número para acompanhamento
</Text>
</SKYCard>

<Text style={styles.protocolInfo}>
Você receberá uma confirmação por e-mail e SMS.
{MOCK_FIDELITY.hasFidelity && `\nA multa de ${formatCurrency(MOCK_FIDELITY.penaltyAmount)} será cobrada na próxima fatura.`}
</Text>

<SKYButton
title="Voltar para Home"
onPress={() => navigation.navigate('Home')}
size="large"
style={{ marginTop: spacing.xxl } as any}
/>
</View>
)}
</ScrollView>
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
stepper: {
flexDirection: 'row', justifyContent: 'center', gap: spacing.sm,
paddingVertical: spacing.md, backgroundColor: colors.surface,
},
stepDot: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border },
stepDotActive: { backgroundColor: colors.accent },
content: { padding: spacing.xxl },
/** Step 1: Warning + benefícios */
warningBox: {
alignItems: 'center', backgroundColor: colors.badgeBackground, borderRadius: borderRadius.lg,
padding: spacing.xl, marginBottom: spacing.xl,
},
warningTitle: { ...typography.h3, marginTop: spacing.sm, color: colors.warning },
warningText: { ...typography.bodySmall, color: colors.warning, textAlign: 'center', marginTop: spacing.xs },
benefitsCard: { marginBottom: spacing.lg },
benefitsTitle: { ...typography.h3, fontSize: 16, marginBottom: spacing.md , color: colors.textPrimary },
benefitRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xs },
benefitText: { ...typography.body , color: colors.textPrimary },
/** Step 2: Oferta de retenção */
retentionCard: { alignItems: 'center' as any, paddingVertical: spacing.xxl },
retentionIconCircle: {
width: 64, height: 64, borderRadius: 32, backgroundColor: colors.surfaceElevated,
alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg,
},
retentionTitle: { ...typography.h2, textAlign: 'center', marginBottom: spacing.sm , color: colors.textPrimary },
retentionText: { ...typography.body, textAlign: 'center', marginBottom: spacing.xl },
retentionOffer: {
backgroundColor: colors.background, borderRadius: borderRadius.md,
padding: spacing.lg, alignItems: 'center', width: '100%' as any, marginBottom: spacing.sm,
},
retentionOfferTitle: { ...typography.h3, color: colors.accent },
retentionOfferPrice: { fontSize: 24, fontWeight: '700', color: colors.accent, marginTop: spacing.xs },
retentionOfferDetail: { ...typography.bodySmall, color: colors.success, fontWeight: '600', marginTop: spacing.xs },
/** Step 3: Fidelidade */
sectionTitle: { ...typography.h3, marginBottom: spacing.lg , color: colors.textPrimary },
fidelityCard: { marginBottom: spacing.md },
fidelityHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
fidelityTitle: { ...typography.h3, fontSize: 16, color: colors.warning },
fidelityDescription: { ...typography.body, lineHeight: 22, marginBottom: spacing.lg },
fidelityDetails: { backgroundColor: colors.background, borderRadius: borderRadius.md, padding: spacing.md },
fidelityRow: {
flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm,
borderBottomWidth: 1, borderBottomColor: colors.divider,
},
fidelityLabel: { ...typography.bodySmall, fontWeight: '500' , color: colors.textPrimary },
fidelityValue: { ...typography.body, fontWeight: '600' , color: colors.textPrimary },
noFidelityCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
noFidelityText: { ...typography.body, flex: 1, color: colors.textSecondary },
/** Step 4: Motivos */
reasonOption: {
flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
borderRadius: borderRadius.md, padding: spacing.lg, marginBottom: spacing.sm,
borderWidth: 2, borderColor: 'transparent',
},
reasonOptionActive: { borderColor: colors.accent, backgroundColor: colors.surfaceElevated },
radio: {
width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border,
alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
},
radioActive: { borderColor: colors.accent },
radioFill: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.accent },
reasonText: { ...typography.body , color: colors.textPrimary },
inputGroup: { marginTop: spacing.xl },
label: { ...typography.bodySmall, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.sm },
textArea: {
backgroundColor: colors.surface, borderRadius: borderRadius.md, borderWidth: 1,
borderColor: colors.border, paddingHorizontal: spacing.lg, paddingTop: spacing.md,
height: 100, fontSize: 15, color: colors.textPrimary,
},
/** Step 5: Protocolo final */
protocolContainer: { alignItems: 'center', paddingTop: spacing.xxl },
protocolIconCircle: {
width: 72, height: 72, borderRadius: 36, backgroundColor: colors.warning,
alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl,
},
protocolTitle: { ...typography.h1, textAlign: 'center' , color: colors.textPrimary },
protocolMessage: { ...typography.body, textAlign: 'center', marginTop: spacing.md, lineHeight: 22 },
protocolCard: { alignItems: 'center' as any, marginTop: spacing.xxl, width: '100%' as any },
protocolLabel: { ...typography.caption, textTransform: 'uppercase', letterSpacing: 1 , color: colors.textSecondary },
protocolNumber: { fontSize: 20, fontWeight: '700', color: colors.primary, marginTop: spacing.xs },
protocolHint: { ...typography.caption, marginTop: spacing.sm , color: colors.textSecondary },
protocolInfo: { ...typography.bodySmall, textAlign: 'center', marginTop: spacing.xl, lineHeight: 20 , color: colors.textPrimary },
});

