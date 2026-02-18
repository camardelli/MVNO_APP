/**
* PortabilityScreen - Formulário de Portabilidade
* 
* Permite solicitar portabilidade de número de outra operadora.
* Campos: número a portar (com DDD), operadora de origem, data desejada (mín 3 dias úteis).
* 
* INTEGRAÇÃO FUTURA:
* - POST /api/v1/service-requests com type PORTABILITY
* - Validar disponibilidade da data no backend
* 
* @module screens/PortabilityScreen
*/

import React, { useState, useMemo } from 'react';
import {
View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, useThemeMode } from '../lib/theme';
import { useAppStore } from '../store/useAppStore';
import * as serviceRequestService from '../api/services/serviceRequestService';
import { formatDate } from '../utils/formatters';
import SKYButton from '../components/SKYButton';

interface PortabilityScreenProps {
navigation: any;
}

/** Lista de operadoras para seleção */
const OPERATORS = ['Vivo', 'Claro', 'TIM', 'Oi', 'Outra'];

/**
 * Calcula datas disponíveis para portabilidade (mínimo 3 dias úteis)
 * Retorna 5 opções de datas futuras em dias úteis.
 */
function getAvailableDates(): Date[] {
const dates: Date[] = [];
const today = new Date();
let businessDays = 0;
let currentDate = new Date(today);

/** Avança até encontrar 5 datas válidas (a partir de 3 dias úteis) */
while (dates.length < 5) {
currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
const dayOfWeek = currentDate.getDay();
/** Pula sábado (6) e domingo (0) */
if (dayOfWeek !== 0 && dayOfWeek !== 6) {
businessDays++;
if (businessDays >= 3) {
  dates.push(new Date(currentDate));
}
}
}
return dates;
}

export default function PortabilityScreen({ navigation }: PortabilityScreenProps) {
  /** Subscreve ao tema para re-render automatico */
  const { mode: themeMode } = useThemeMode();
  const styles = getStyles();
const customer = useAppStore((s) => s.customer);
const [phoneNumber, setPhoneNumber] = useState('');
const [selectedOperator, setSelectedOperator] = useState('');
const [selectedDate, setSelectedDate] = useState<Date | null>(null);
const [loading, setLoading] = useState(false);

/** Datas disponíveis calculadas (mín 3 dias úteis) */
const availableDates = useMemo(() => getAvailableDates(), []);

/** Solicita portabilidade */
const handleSubmit = async () => {
if (!phoneNumber || phoneNumber.replace(/\D/g, '').length < 10) {
Alert.alert('Erro', 'Informe o número com DDD.');
return;
}
if (!selectedOperator) {
Alert.alert('Erro', 'Selecione a operadora de origem.');
return;
}
if (!selectedDate) {
Alert.alert('Erro', 'Selecione a data desejada para portabilidade.');
return;
}

setLoading(true);
try {
const response = await serviceRequestService.createServiceRequest({
type: 'PORTABILITY',
customerId: customer!.id,
lineId: customer!.mobileLines[0]?.msisdn || '',
details: {
numberToPort: phoneNumber.replace(/\D/g, ''),
currentOperator: selectedOperator,
desiredDate: selectedDate.toISOString(),
},
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

/** Formata data curta para seleção: "Seg, 10/02" */
const formatShortDate = (date: Date) => {
const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const day = days[date.getDay()];
return `${day}, ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
};

return (
<SafeAreaView style={styles.container} edges={['top']}>
<View style={styles.header}>
<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
<Feather name="arrow-left" size={24} color={colors.textPrimary} />
</TouchableOpacity>
<Text style={styles.headerTitle}>Portabilidade</Text>
<View style={{ width: 40 }} />
</View>

<ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
<Text style={styles.description}>
Traga seu número de outra operadora para a SKY Móvel. O processo leva em média 3 dias úteis.
</Text>

{/* Campo: Número a portar */}
<View style={styles.inputGroup}>
<Text style={styles.label}>Número a portar (com DDD)</Text>
<TextInput
style={styles.input}
placeholder="(11) 99999-9999"
placeholderTextColor={colors.inputPlaceholder}
value={phoneNumber}
onChangeText={setPhoneNumber}
keyboardType="phone-pad"
/>
</View>

{/* Campo: Operadora de origem */}
<View style={styles.inputGroup}>
<Text style={styles.label}>Operadora de origem</Text>
<View style={styles.operatorsGrid}>
{OPERATORS.map((op) => (
<TouchableOpacity
key={op}
style={[
styles.operatorChip,
selectedOperator === op && styles.operatorChipActive,
]}
onPress={() => setSelectedOperator(op)}
>
<Text
style={[
styles.operatorChipText,
selectedOperator === op && styles.operatorChipTextActive,
]}
>
{op}
</Text>
</TouchableOpacity>
))}
</View>
</View>

{/* Campo: Data desejada (mín 3 dias úteis) */}
<View style={styles.inputGroup}>
<Text style={styles.label}>Data desejada para portabilidade</Text>
<Text style={styles.dateHint}>Mínimo de 3 dias úteis a partir de hoje</Text>
<View style={styles.datesGrid}>
{availableDates.map((date, idx) => (
<TouchableOpacity
  key={idx}
  style={[
    styles.dateChip,
    selectedDate?.getTime() === date.getTime() && styles.dateChipActive,
  ]}
  onPress={() => setSelectedDate(date)}
>
  <Text
    style={[
      styles.dateChipText,
      selectedDate?.getTime() === date.getTime() && styles.dateChipTextActive,
    ]}
  >
    {formatShortDate(date)}
  </Text>
</TouchableOpacity>
))}
</View>
</View>

<SKYButton
title="Solicitar portabilidade"
onPress={handleSubmit}
loading={loading}
disabled={!phoneNumber || !selectedOperator || !selectedDate}
size="large"
style={{ marginTop: spacing.xxl } as any}
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
description: { ...typography.body, marginBottom: spacing.xxl },
inputGroup: { marginBottom: spacing.xl },
label: { ...typography.bodySmall, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.sm },
input: {
backgroundColor: colors.surface, borderRadius: borderRadius.md, borderWidth: 1,
borderColor: colors.border, paddingHorizontal: spacing.lg, height: 52, fontSize: 15,
color: colors.textPrimary,
},
operatorsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
operatorChip: {
paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
borderRadius: borderRadius.full, borderWidth: 1.5, borderColor: colors.border,
backgroundColor: colors.surface,
},
operatorChipActive: { borderColor: colors.accent, backgroundColor: colors.surfaceElevated },
operatorChipText: { fontSize: 14, fontWeight: '500', color: colors.textSecondary },
operatorChipTextActive: { color: colors.accent },
/** Seletor de data */
dateHint: { ...typography.caption, marginBottom: spacing.md, color: colors.textSecondary },
datesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
dateChip: {
paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
borderRadius: borderRadius.md, borderWidth: 1.5, borderColor: colors.border,
backgroundColor: colors.surface,
},
dateChipActive: { borderColor: colors.accent, backgroundColor: colors.surfaceElevated },
dateChipText: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
dateChipTextActive: { color: colors.accent, fontWeight: '600' },
});
