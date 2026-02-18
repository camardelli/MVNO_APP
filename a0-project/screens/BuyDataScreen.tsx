/**
* BuyDataScreen - Comprar Dados Adicionais
* 
* Grid de pacotes de dados extras com fluxo de compra.
* 
* @module screens/BuyDataScreen
*/

import React, { useState, useEffect } from 'react';
import {
View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, useThemeMode } from '../lib/theme';
import { DataPackage } from '../api/types/plan';
import * as planService from '../api/services/planService';
import { useAppStore } from '../store/useAppStore';
import { formatCurrency } from '../utils/formatters';
import SKYCard from '../components/SKYCard';
import SKYButton from '../components/SKYButton';
import LoadingScreen from '../components/LoadingScreen';

interface BuyDataScreenProps {
navigation: any;
}

export default function BuyDataScreen({ navigation }: BuyDataScreenProps) {
  /** Subscreve ao tema para re-render automatico */
  const { mode: themeMode } = useThemeMode();
  const styles = getStyles();
const customer = useAppStore((s) => s.customer);
const [packages, setPackages] = useState<DataPackage[]>([]);
const [loading, setLoading] = useState(true);
const [purchasing, setPurchasing] = useState<string | null>(null);

useEffect(() => {
const load = async () => {
try {
const data = await planService.getDataPackages();
setPackages(data);
} catch {
Alert.alert('Erro', 'Não foi possível carregar os pacotes.');
} finally {
setLoading(false);
}
};
load();
}, []);

/** Handler de compra */
const handlePurchase = (pkg: DataPackage) => {
Alert.alert(
'Confirmar compra',
`Deseja comprar ${pkg.dataGB}GB por ${formatCurrency(pkg.price)}?\nValidade: ${pkg.validityDays} dias\nSerá cobrado na próxima fatura.`,
[
{ text: 'Cancelar', style: 'cancel' },
{
text: 'Comprar',
onPress: async () => {
setPurchasing(pkg.id);
try {
const response = await planService.purchaseDataPackage(customer!.id, {
packageId: pkg.id,
paymentMethod: 'ADD_TO_INVOICE',
});
Alert.alert('Sucesso!', response.message, [
{ text: 'OK', onPress: () => navigation.goBack() },
]);
} catch {
Alert.alert('Erro', 'Não foi possível completar a compra.');
} finally {
setPurchasing(null);
}
},
},
]
);
};

if (loading) return <LoadingScreen message="Carregando pacotes..." />;

return (
<SafeAreaView style={styles.container} edges={['top']}>
{/* Header com voltar */}
<View style={styles.header}>
<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
<Feather name="arrow-left" size={24} color={colors.textPrimary} />
</TouchableOpacity>
<Text style={styles.headerTitle}>Comprar dados</Text>
<View style={{ width: 40 }} />
</View>

<ScrollView
style={styles.scrollView}
contentContainerStyle={styles.content}
showsVerticalScrollIndicator={false}
>
<Text style={styles.subtitle}>
Escolha um pacote de dados adicional para sua linha
</Text>

<View style={styles.grid}>
{packages.map((pkg) => (
<TouchableOpacity
key={pkg.id}
style={styles.packageCard}
onPress={() => handlePurchase(pkg)}
disabled={purchasing === pkg.id}
activeOpacity={0.7}
>
{pkg.description && (
<View style={styles.packageBadge}>
<Text style={styles.packageBadgeText}>{pkg.description}</Text>
</View>
)}

<Text style={styles.packageGB}>{pkg.dataGB}GB</Text>
<Text style={styles.packagePrice}>{formatCurrency(pkg.price)}</Text>
<Text style={styles.packageValidity}>
Validade: {pkg.validityDays} dias
</Text>

{purchasing === pkg.id ? (
<ActivityIndicator color={colors.accent} style={{ marginTop: spacing.md }} />
) : (
<View style={styles.buyBtn}>
<Text style={styles.buyBtnText}>Comprar</Text>
</View>
)}
</TouchableOpacity>
))}
</View>
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
paddingVertical: spacing.md,
backgroundColor: colors.surface,
borderBottomWidth: 1,
borderBottomColor: colors.divider,
},
backBtn: {
width: 40,
height: 40,
alignItems: 'center',
justifyContent: 'center',
},
headerTitle: {
...typography.h3,
},
scrollView: {
flex: 1,
},
content: {
padding: spacing.xl,
},
subtitle: {
...typography.body,
color: colors.textSecondary,
marginBottom: spacing.xl,
},
grid: {
flexDirection: 'row',
flexWrap: 'wrap',
gap: spacing.md,
},
packageCard: {
width: '48%' as any,
flexBasis: '47%',
flexGrow: 1,
backgroundColor: colors.surface,
borderRadius: borderRadius.lg,
padding: spacing.lg,
alignItems: 'center',
borderWidth: 1,
borderColor: colors.border,
},
packageBadge: {
backgroundColor: colors.success + '15',
paddingHorizontal: spacing.sm,
paddingVertical: 2,
borderRadius: borderRadius.full,
marginBottom: spacing.sm,
},
packageBadgeText: {
fontSize: 11,
fontWeight: '600',
color: colors.success,
},
packageGB: {
fontSize: 28,
fontWeight: '700',
color: colors.primary,
},
packagePrice: {
fontSize: 18,
fontWeight: '600',
color: colors.accent,
marginTop: spacing.xs,
},
packageValidity: {
...typography.caption,
marginTop: spacing.xs,
},
buyBtn: {
backgroundColor: colors.accent,
paddingHorizontal: spacing.lg,
paddingVertical: spacing.sm,
borderRadius: borderRadius.full,
marginTop: spacing.md,
},
buyBtnText: {
color: colors.textOnPrimary,
fontSize: 13,
fontWeight: '600',
},
});
