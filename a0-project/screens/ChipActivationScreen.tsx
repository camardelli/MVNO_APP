/**
* ChipActivationScreen - Ativação de Chip (Fluxo em Steps)
* 
* Steps: 1) ICCID, 2) Confirmar dados, 3) Escolher plano,
* 4) Termos, 5) Resumo, 6) Sucesso
* 
* @module screens/ChipActivationScreen
*/

import React, { useState, useEffect } from 'react';
import {
View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, useThemeMode } from '../lib/theme';
import { AvailablePlan } from '../api/types/plan';
import * as planService from '../api/services/planService';
import * as serviceRequestService from '../api/services/serviceRequestService';
import { useAppStore } from '../store/useAppStore';
import { formatCurrency, formatPhone } from '../utils/formatters';
import SKYButton from '../components/SKYButton';
import SKYCard from '../components/SKYCard';

interface ChipActivationScreenProps {
navigation: any;
}

export default function ChipActivationScreen({ navigation }: ChipActivationScreenProps) {
  /** Subscreve ao tema para re-render automatico */
  const { mode: themeMode } = useThemeMode();
  const styles = getStyles();
const customer = useAppStore((s) => s.customer);
const [step, setStep] = useState(1);
const [iccid, setIccid] = useState('');
const [validating, setValidating] = useState(false);
const [plans, setPlans] = useState<AvailablePlan[]>([]);
const [selectedPlan, setSelectedPlan] = useState<AvailablePlan | null>(null);
const [acceptedTerms, setAcceptedTerms] = useState(false);
const [activating, setActivating] = useState(false);
const [activatedNumber, setActivatedNumber] = useState('');

/** Carrega planos disponíveis */
useEffect(() => {
planService.getAvailablePlans().then(setPlans).catch(() => {});
}, []);

/** Step 1: Validar ICCID */
const validateIccid = async () => {
if (iccid.length < 19) {
Alert.alert('Erro', 'O ICCID deve ter pelo menos 19 dígitos.');
return;
}
setValidating(true);
try {
const result = await serviceRequestService.validateChip({ iccid });
if (result.valid) {
setStep(2);
} else {
Alert.alert('Chip inválido', result.errorMessage || 'ICCID não reconhecido.');
}
} catch {
Alert.alert('Erro', 'Não foi possível validar o chip.');
} finally {
setValidating(false);
}
};

/** Step 5: Ativar chip */
const activateChip = async () => {
if (!customer || !selectedPlan) return;
setActivating(true);
try {
const result = await serviceRequestService.activateChip({
iccid,
customerId: customer.id,
planId: selectedPlan.id,
acceptedTermsVersion: '1.0',
});
setActivatedNumber(result.msisdn);
setStep(6);
} catch {
Alert.alert('Erro', 'Não foi possível ativar o chip.');
} finally {
setActivating(false);
}
};

/** Renderiza conteúdo baseado no step */
const renderStep = () => {
switch (step) {
case 1:
return (
<View style={styles.stepContent}>
<View style={styles.stepIconCircle}>
<Feather name="cpu" size={32} color={colors.accent} />
</View>
<Text style={styles.stepTitle}>Código do chip</Text>
<Text style={styles.stepDescription}>
Insira o ICCID de 19-20 dígitos impresso no chip
</Text>
<TextInput
style={styles.iccidInput}
placeholder="89550534000000000001"
placeholderTextColor={colors.inputPlaceholder}
value={iccid}
onChangeText={(t) => setIccid(t.replace(/\D/g, ''))}
keyboardType="numeric"
maxLength={20}
/>
<SKYButton
title="Validar chip"
onPress={validateIccid}
loading={validating}
size="large"
style={{ marginTop: spacing.xl } as any}
/>
</View>
);

case 2:
return (
<View style={styles.stepContent}>
<Text style={styles.stepTitle}>Confirmar dados</Text>
<Text style={styles.stepDescription}>
Verifique se seus dados estão corretos
</Text>
<SKYCard style={styles.confirmCard}>
<ConfirmRow label="Nome" value={customer?.fullName || ''} />
<ConfirmRow label="E-mail" value={customer?.email || ''} />
<ConfirmRow label="Telefone" value={formatPhone(customer?.phone || '')} />
<ConfirmRow label="ICCID" value={iccid} />
</SKYCard>
<SKYButton
title="Dados estão corretos"
onPress={() => setStep(3)}
size="large"
style={{ marginTop: spacing.xl } as any}
/>
</View>
);

case 3:
return (
<View style={styles.stepContent}>
<Text style={styles.stepTitle}>Escolha um plano</Text>
<Text style={styles.stepDescription}>
Selecione o plano para sua nova linha
</Text>
<ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
{plans.map((plan) => (
<TouchableOpacity
key={plan.id}
style={[
styles.planOption,
selectedPlan?.id === plan.id && styles.planOptionSelected,
]}
onPress={() => setSelectedPlan(plan)}
>
<View style={styles.planOptionRow}>
<View style={styles.radioCircle}>
{selectedPlan?.id === plan.id && <View style={styles.radioFill} />}
</View>
<View style={{ flex: 1 }}>
<Text style={styles.planOptionName}>{plan.name}</Text>
<Text style={styles.planOptionDetail}>
{plan.dataGB}GB • {plan.smsQuantity} SMS
</Text>
</View>
<Text style={styles.planOptionPrice}>
{formatCurrency(plan.monthlyPrice)}
</Text>
</View>
</TouchableOpacity>
))}
</ScrollView>
<SKYButton
title="Continuar"
onPress={() => setStep(4)}
disabled={!selectedPlan}
size="large"
style={{ marginTop: spacing.xl } as any}
/>
</View>
);

case 4:
return (
<View style={styles.stepContent}>
<Text style={styles.stepTitle}>Termos e condições</Text>
<ScrollView style={styles.termsBox}>
<Text style={styles.termsText}>
TERMOS E CONDIÇÕES DE USO - SKY MÓVEL{'\n\n'}
1. OBJETO{'\n'}
Os presentes Termos regulam a prestação dos serviços de telecomunicações
móveis pela SKY Móvel, operadora virtual (MVNO).{'\n\n'}
2. SERVIÇOS{'\n'}
A SKY Móvel oferece serviços de telefonia móvel incluindo voz, dados e SMS,
de acordo com o plano contratado pelo cliente.{'\n\n'}
3. OBRIGAÇÕES DO CLIENTE{'\n'}
O cliente se compromete a fornecer informações verdadeiras, manter seus dados
atualizados e utilizar os serviços conforme a legislação vigente.{'\n\n'}
4. PAGAMENTO{'\n'}
O pagamento é mensal, conforme valor do plano contratado, com vencimento na
data escolhida pelo cliente.{'\n\n'}
5. CANCELAMENTO{'\n'}
O cancelamento pode ser solicitado a qualquer momento pelo app ou central de
atendimento. Multa de fidelidade pode ser aplicada conforme contrato.
</Text>
</ScrollView>
<TouchableOpacity
style={styles.termsCheckRow}
onPress={() => setAcceptedTerms(!acceptedTerms)}
>
<View style={[styles.checkbox, acceptedTerms && styles.checkboxActive]}>
{acceptedTerms && <Feather name="check" size={14} color="#FFF" />}
</View>
<Text style={styles.termsCheckText}>Li e aceito os termos e condições</Text>
</TouchableOpacity>
<SKYButton
title="Continuar"
onPress={() => setStep(5)}
disabled={!acceptedTerms}
size="large"
style={{ marginTop: spacing.lg } as any}
/>
</View>
);

case 5:
return (
<View style={styles.stepContent}>
<Text style={styles.stepTitle}>Resumo da ativação</Text>
<SKYCard style={styles.confirmCard}>
<ConfirmRow label="ICCID" value={iccid} />
<ConfirmRow label="Plano" value={selectedPlan?.name || ''} />
<ConfirmRow label="Valor" value={formatCurrency(selectedPlan?.monthlyPrice || 0)} />
<ConfirmRow label="Dados" value={`${selectedPlan?.dataGB || 0}GB`} />
</SKYCard>
<SKYButton
title="Ativar chip"
onPress={activateChip}
loading={activating}
size="large"
style={{ marginTop: spacing.xl } as any}
/>
</View>
);

case 6:
return (
<View style={[styles.stepContent, styles.successContent]}>
<View style={styles.successIcon}>
<Feather name="check-circle" size={64} color={colors.success} />
</View>
<Text style={styles.successTitle}>Chip ativado!</Text>
<Text style={styles.successMessage}>
Sua nova linha está pronta para uso
</Text>
<SKYCard style={styles.successCard}>
<Text style={styles.successNumber}>
{formatPhone(activatedNumber)}
</Text>
<Text style={styles.successPlan}>{selectedPlan?.name}</Text>
</SKYCard>
<Text style={styles.successHint}>
Reinicie seu dispositivo para completar a configuração da rede.
</Text>
<SKYButton
title="Ir para Home"
onPress={() => navigation.navigate('Home')}
size="large"
style={{ marginTop: spacing.xxl } as any}
/>
</View>
);
}
};

return (
<SafeAreaView style={styles.container} edges={['top']}>
{/* Header */}
<View style={styles.header}>
{step < 6 && (
<TouchableOpacity
onPress={() => step > 1 ? setStep(step - 1) : navigation.goBack()}
style={styles.backBtn}
>
<Feather name="arrow-left" size={24} color={colors.textPrimary} />
</TouchableOpacity>
)}
<Text style={styles.headerTitle}>
{step < 6 ? `Ativação de chip` : ''}
</Text>
<View style={{ width: step < 6 ? 40 : 0 }} />
</View>

{/* Stepper */}
{step < 6 && (
<View style={styles.stepper}>
{[1, 2, 3, 4, 5].map((s) => (
<View key={s} style={[styles.stepDot, s <= step && styles.stepDotActive]} />
))}
</View>
)}

<ScrollView
contentContainerStyle={styles.scrollContent}
showsVerticalScrollIndicator={false}
keyboardShouldPersistTaps="handled"
>
{renderStep()}
</ScrollView>
</SafeAreaView>
);

/** Helper component: confirmation row */
function ConfirmRow({ label, value }: { label: string; value: string }) {
return (
<View style={styles.confirmRow}>
<Text style={styles.confirmLabel}>{label}</Text>
<Text style={styles.confirmValue}>{value}</Text>
</View>
);
}
}

const getStyles = () => StyleSheet.create({
container: { flex: 1, backgroundColor: colors.background },
header: {
flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.divider,
},
backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
headerTitle: { ...typography.h3, color: colors.textPrimary },
stepper: {
flexDirection: 'row', justifyContent: 'center', gap: spacing.sm,
paddingVertical: spacing.lg, backgroundColor: colors.surface,
},
stepDot: {
width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border,
},
stepDotActive: { backgroundColor: colors.accent },
scrollContent: { flexGrow: 1 },
stepContent: { padding: spacing.xxl },
stepIconCircle: {
width: 80, height: 80, borderRadius: 40, backgroundColor: colors.surfaceElevated,
alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: spacing.xl,
},
stepTitle: { ...typography.h2, marginBottom: spacing.sm },
stepDescription: { ...typography.body, marginBottom: spacing.xxl },
iccidInput: {
backgroundColor: colors.inputBackground, borderRadius: borderRadius.md, borderWidth: 1,
borderColor: colors.border, paddingHorizontal: spacing.lg, height: 52, fontSize: 16,
color: colors.textPrimary, letterSpacing: 1, textAlign: 'center',
},
confirmCard: { marginBottom: spacing.md },
confirmRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
confirmLabel: { ...typography.bodySmall, fontWeight: '500' },
confirmValue: { ...typography.body, fontWeight: '600', textAlign: 'right', flex: 1, marginLeft: spacing.md },
planOption: {
backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.lg,
marginBottom: spacing.sm, borderWidth: 2, borderColor: 'transparent',
},
planOptionSelected: { borderColor: colors.accent, backgroundColor: colors.surfaceElevated },
planOptionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
radioCircle: {
width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border,
alignItems: 'center', justifyContent: 'center',
},
radioFill: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.accent },
planOptionName: { ...typography.body, fontWeight: '600' },
planOptionDetail: { ...typography.caption, color: colors.textSecondary },
planOptionPrice: { fontSize: 16, fontWeight: '700', color: colors.accent },
termsBox: {
backgroundColor: colors.inputBackground, borderRadius: borderRadius.md, padding: spacing.lg,
maxHeight: 250, marginBottom: spacing.lg,
},
termsText: { ...typography.bodySmall, lineHeight: 20 },
termsCheckRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
checkbox: {
width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.border,
alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm,
},
checkboxActive: { backgroundColor: colors.accent, borderColor: colors.accent },
termsCheckText: { ...typography.body, flex: 1 },
successContent: { alignItems: 'center', justifyContent: 'center', flex: 1 },
successIcon: { marginBottom: spacing.xl },
successTitle: { ...typography.h1, color: colors.success },
successMessage: { ...typography.body, marginTop: spacing.sm },
successCard: {
alignItems: 'center' as any, marginTop: spacing.xxl, width: '100%' as any,
},
successNumber: { fontSize: 28, fontWeight: '700', color: colors.primary },
successPlan: { ...typography.bodySmall, marginTop: spacing.xs },
successHint: {
...typography.bodySmall, textAlign: 'center', marginTop: spacing.xl, paddingHorizontal: spacing.xxl,
},
});
