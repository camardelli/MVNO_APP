/**
* ChipSwapScreen - Troca de Chip
* 
* Formulário de troca de chip com motivo, tipo e endereço de entrega (se chip físico).
* 
* INTEGRAÇÃO FUTURA:
* - POST /api/v1/service-requests com type CHIP_SWAP
* - Se PHYSICAL, incluir endereço de entrega
* - Se ESIM, gerar QR Code para download do perfil
* 
* @module screens/ChipSwapScreen
*/

import React, { useState } from 'react';
import {
View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, useThemeMode } from '../lib/theme';
import { useAppStore } from '../store/useAppStore';
import { ChipSwapReason, ChipType } from '../api/types/services';
import * as serviceRequestService from '../api/services/serviceRequestService';
import SKYButton from '../components/SKYButton';

interface ChipSwapScreenProps {
navigation: any;
}

const REASONS: { value: ChipSwapReason; label: string; icon: string }[] = [
{ value: 'LOST', label: 'Perda', icon: 'search' },
{ value: 'STOLEN', label: 'Roubo', icon: 'alert-triangle' },
{ value: 'DEFECTIVE', label: 'Defeito', icon: 'x-circle' },
{ value: 'ESIM_UPGRADE', label: 'Upgrade eSIM', icon: 'trending-up' },
];

const CHIP_TYPES: { value: ChipType; label: string; icon: string }[] = [
{ value: 'PHYSICAL', label: 'Chip físico', icon: 'cpu' },
{ value: 'ESIM', label: 'eSIM', icon: 'smartphone' },
];

export default function ChipSwapScreen({ navigation }: ChipSwapScreenProps) {
  /** Subscreve ao tema para re-render automatico */
  const { mode: themeMode } = useThemeMode();
  const styles = getStyles();
const customer = useAppStore((s) => s.customer);
const [reason, setReason] = useState<ChipSwapReason | null>(null);
const [chipType, setChipType] = useState<ChipType | null>(null);
const [loading, setLoading] = useState(false);

/** Endereço de entrega (para chip físico) */
const [useRegisteredAddress, setUseRegisteredAddress] = useState(true);
const [deliveryStreet, setDeliveryStreet] = useState('');
const [deliveryNumber, setDeliveryNumber] = useState('');
const [deliveryComplement, setDeliveryComplement] = useState('');
const [deliveryNeighborhood, setDeliveryNeighborhood] = useState('');
const [deliveryCity, setDeliveryCity] = useState('');
const [deliveryState, setDeliveryState] = useState('');
const [deliveryZipCode, setDeliveryZipCode] = useState('');

const handleSubmit = async () => {
if (!reason || !chipType) {
Alert.alert('Erro', 'Selecione o motivo e o tipo de chip.');
return;
}

/** Validar endereço se chip físico e endereço diferente */
if (chipType === 'PHYSICAL' && !useRegisteredAddress) {
if (!deliveryStreet || !deliveryNumber || !deliveryCity || !deliveryState || !deliveryZipCode) {
Alert.alert('Erro', 'Preencha todos os campos obrigatórios do endereço.');
return;
}
}

setLoading(true);
try {
const deliveryAddress = chipType === 'PHYSICAL' && !useRegisteredAddress ? {
street: deliveryStreet,
number: deliveryNumber,
complement: deliveryComplement || undefined,
neighborhood: deliveryNeighborhood,
city: deliveryCity,
state: deliveryState,
zipCode: deliveryZipCode.replace(/\D/g, ''),
} : chipType === 'PHYSICAL' ? customer?.address : undefined;

const response = await serviceRequestService.createServiceRequest({
type: 'CHIP_SWAP',
customerId: customer!.id,
lineId: customer!.mobileLines[0]?.msisdn || '',
details: { reason, chipType, deliveryAddress },
});
Alert.alert('Solicitação enviada!', `Protocolo: ${response.protocol}\n${response.message}`, [
{ text: 'OK', onPress: () => navigation.goBack() },
]);
} catch {
Alert.alert('Erro', 'Não foi possível registrar a solicitação.');
} finally {
setLoading(false);
}
};

return (
<SafeAreaView style={styles.container} edges={['top']}>
<View style={styles.header}>
<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
<Feather name="arrow-left" size={24} color={colors.textPrimary} />
</TouchableOpacity>
<Text style={styles.headerTitle}>Troca de chip</Text>
<View style={{ width: 40 }} />
</View>

<ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
{/* Motivo da troca */}
<Text style={styles.sectionTitle}>Motivo da troca</Text>
<View style={styles.optionsGrid}>
{REASONS.map((r) => (
<TouchableOpacity
key={r.value}
style={[styles.optionCard, reason === r.value && styles.optionActive]}
onPress={() => setReason(r.value)}
>
<Feather name={r.icon as any} size={22} color={reason === r.value ? colors.accent : colors.textSecondary} />
<Text style={[styles.optionLabel, reason === r.value && { color: colors.accent }]}>{r.label}</Text>
</TouchableOpacity>
))}
</View>

{/* Tipo de chip */}
<Text style={[styles.sectionTitle, { marginTop: spacing.xxl }]}>Tipo de chip</Text>
<View style={styles.optionsGrid}>
{CHIP_TYPES.map((c) => (
<TouchableOpacity
key={c.value}
style={[styles.optionCard, chipType === c.value && styles.optionActive]}
onPress={() => setChipType(c.value)}
>
<Feather name={c.icon as any} size={22} color={chipType === c.value ? colors.accent : colors.textSecondary} />
<Text style={[styles.optionLabel, chipType === c.value && { color: colors.accent }]}>{c.label}</Text>
</TouchableOpacity>
))}
</View>

{/* Endereço de entrega (somente chip físico) */}
{chipType === 'PHYSICAL' && (
<View style={styles.addressSection}>
<Text style={[styles.sectionTitle, { marginTop: spacing.xxl }]}>Endereço de entrega</Text>

{/* Toggle para usar endereço cadastrado */}
<TouchableOpacity
style={[styles.addressToggle, useRegisteredAddress && styles.addressToggleActive]}
onPress={() => setUseRegisteredAddress(true)}
>
<View style={[styles.radio, useRegisteredAddress && styles.radioActive]}>
{useRegisteredAddress && <View style={styles.radioFill} />}
</View>
<View style={{ flex: 1 }}>
<Text style={styles.addressToggleTitle}>Endereço cadastrado</Text>
<Text style={styles.addressToggleDetail}>
{customer?.address.street}, {customer?.address.number} - {customer?.address.city}/{customer?.address.state}
</Text>
</View>
</TouchableOpacity>

<TouchableOpacity
style={[styles.addressToggle, !useRegisteredAddress && styles.addressToggleActive]}
onPress={() => setUseRegisteredAddress(false)}
>
<View style={[styles.radio, !useRegisteredAddress && styles.radioActive]}>
{!useRegisteredAddress && <View style={styles.radioFill} />}
</View>
<Text style={styles.addressToggleTitle}>Outro endereço</Text>
</TouchableOpacity>

{/* Formulário de endereço alternativo */}
{!useRegisteredAddress && (
<View style={styles.addressForm}>
<View style={styles.inputGroup}>
<Text style={styles.inputLabel}>CEP *</Text>
<TextInput
style={styles.input}
placeholder="00000-000"
placeholderTextColor={colors.inputPlaceholder}
value={deliveryZipCode}
onChangeText={setDeliveryZipCode}
keyboardType="numeric"
maxLength={9}
/>
</View>
<View style={styles.inputGroup}>
<Text style={styles.inputLabel}>Rua *</Text>
<TextInput
style={styles.input}
placeholder="Nome da rua"
placeholderTextColor={colors.inputPlaceholder}
value={deliveryStreet}
onChangeText={setDeliveryStreet}
/>
</View>
<View style={styles.inputRow}>
<View style={[styles.inputGroup, { flex: 1 }]}>
<Text style={styles.inputLabel}>Número *</Text>
<TextInput
  style={styles.input}
  placeholder="123"
  placeholderTextColor={colors.inputPlaceholder}
  value={deliveryNumber}
  onChangeText={setDeliveryNumber}
  keyboardType="numeric"
/>
</View>
<View style={[styles.inputGroup, { flex: 2, marginLeft: spacing.md }]}>
<Text style={styles.inputLabel}>Complemento</Text>
<TextInput
  style={styles.input}
  placeholder="Apto, sala..."
  placeholderTextColor={colors.inputPlaceholder}
  value={deliveryComplement}
  onChangeText={setDeliveryComplement}
/>
</View>
</View>
<View style={styles.inputGroup}>
<Text style={styles.inputLabel}>Bairro *</Text>
<TextInput
style={styles.input}
placeholder="Bairro"
placeholderTextColor={colors.inputPlaceholder}
value={deliveryNeighborhood}
onChangeText={setDeliveryNeighborhood}
/>
</View>
<View style={styles.inputRow}>
<View style={[styles.inputGroup, { flex: 2 }]}>
<Text style={styles.inputLabel}>Cidade *</Text>
<TextInput
  style={styles.input}
  placeholder="Cidade"
  placeholderTextColor={colors.inputPlaceholder}
  value={deliveryCity}
  onChangeText={setDeliveryCity}
/>
</View>
<View style={[styles.inputGroup, { flex: 1, marginLeft: spacing.md }]}>
<Text style={styles.inputLabel}>UF *</Text>
<TextInput
  style={styles.input}
  placeholder="SP"
  placeholderTextColor={colors.inputPlaceholder}
  value={deliveryState}
  onChangeText={setDeliveryState}
  maxLength={2}
  autoCapitalize="characters"
/>
</View>
</View>
</View>
)}
</View>
)}

<SKYButton
title="Solicitar troca"
onPress={handleSubmit}
loading={loading}
disabled={!reason || !chipType}
size="large"
style={{ marginTop: spacing.xxxl } as any}
/>
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
content: { padding: spacing.xxl },
sectionTitle: { ...typography.h3, marginBottom: spacing.lg , color: colors.textPrimary },
optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
optionCard: {
width: '47%' as any, flexBasis: '46%', flexGrow: 1,
backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg,
alignItems: 'center', borderWidth: 2, borderColor: 'transparent', gap: spacing.sm,
},
optionActive: { borderColor: colors.accent, backgroundColor: colors.surfaceElevated },
optionLabel: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
/** Endereço de entrega */
addressSection: {},
addressToggle: {
flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
borderRadius: borderRadius.md, padding: spacing.lg, marginBottom: spacing.sm,
borderWidth: 2, borderColor: 'transparent',
},
addressToggleActive: { borderColor: colors.accent, backgroundColor: colors.surfaceElevated },
addressToggleTitle: { ...typography.body, fontWeight: '600' , color: colors.textPrimary },
addressToggleDetail: { ...typography.caption, marginTop: 2 , color: colors.textSecondary },
radio: {
width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border,
alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
},
radioActive: { borderColor: colors.accent },
radioFill: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.accent },
/** Formulário */
addressForm: { marginTop: spacing.md },
inputGroup: { marginBottom: spacing.md },
inputRow: { flexDirection: 'row' },
inputLabel: { ...typography.caption, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs },
input: {
backgroundColor: colors.surface, borderRadius: borderRadius.md, borderWidth: 1,
borderColor: colors.border, paddingHorizontal: spacing.md, height: 44, fontSize: 14,
color: colors.textPrimary,
},
});
