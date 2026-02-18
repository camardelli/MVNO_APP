/**
* ServicesScreen - Central de Serviços
* 
* Lista de serviços disponíveis: Portabilidade, Troca de Chip,
* Bloqueio/Desbloqueio, Cancelamento. Acesso ao histórico de solicitações.
* 
* @module screens/ServicesScreen
*/

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, useThemeMode } from '../lib/theme';
import SKYCard from '../components/SKYCard';

interface ServicesScreenProps {
navigation: any;
}

/** Definição dos serviços disponíveis */
const SERVICES = [
{
id: 'portability',
icon: 'repeat',
title: 'Portabilidade',
description: 'Trazer número de outra operadora',
screen: 'Portability',
iconColor: colors.accent,
},
{
id: 'chip_swap',
icon: 'cpu',
title: 'Troca de Chip',
description: 'Solicitar novo chip ou eSIM',
screen: 'ChipSwap',
iconColor: colors.success,
},
{
id: 'chip_activation',
icon: 'zap',
title: 'Ativação de Chip',
description: 'Ativar um novo chip SKY Móvel',
screen: 'ChipActivation',
iconColor: colors.warning,
},
{
id: 'block',
icon: 'lock',
title: 'Bloqueio de Linha',
description: 'Bloquear temporariamente sua linha',
screen: 'LineBlock',
iconColor: colors.error,
},
{
id: 'cancel',
icon: 'x-circle',
title: 'Cancelamento',
description: 'Solicitar cancelamento da linha',
screen: 'Cancellation',
iconColor: colors.textSecondary,
},
];

export default function ServicesScreen({ navigation }: ServicesScreenProps) {
  /** Subscreve ao tema para re-render automatico */
  const { mode: themeMode } = useThemeMode();
  const styles = getStyles();
return (
<SafeAreaView style={styles.container} edges={['top']}>
{/* Header */}
<View style={styles.header}>
<Text style={styles.headerTitle}>Serviços</Text>
</View>

<ScrollView
style={styles.scrollView}
contentContainerStyle={styles.content}
showsVerticalScrollIndicator={false}
>
{/* Histórico de solicitações */}
<SKYCard
onPress={() => navigation.navigate('ServiceHistory')}
style={styles.historyCard}
>
<View style={styles.historyContent}>
<View style={styles.historyIcon}>
<Feather name="clock" size={22} color={colors.accent} />
</View>
<View style={styles.historyText}>
<Text style={styles.historyTitle}>Histórico de solicitações</Text>
<Text style={styles.historySubtitle}>Acompanhe suas solicitações</Text>
</View>
<Feather name="chevron-right" size={20} color={colors.textSecondary} />
</View>
</SKYCard>

{/* Lista de serviços */}
<Text style={styles.sectionTitle}>Serviços disponíveis</Text>

{SERVICES.map((service) => (
<TouchableOpacity
key={service.id}
style={styles.serviceItem}
onPress={() => navigation.navigate(service.screen)}
activeOpacity={0.7}
>
<View style={[styles.serviceIcon, { backgroundColor: service.iconColor + '15' }]}>
<Feather name={service.icon as any} size={22} color={service.iconColor} />
</View>
<View style={styles.serviceText}>
<Text style={styles.serviceTitle}>{service.title}</Text>
<Text style={styles.serviceDescription}>{service.description}</Text>
</View>
<Feather name="chevron-right" size={20} color={colors.textSecondary} />
</TouchableOpacity>
))}

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
historyCard: {
marginBottom: spacing.xl,
},
historyContent: {
flexDirection: 'row',
alignItems: 'center',
},
historyIcon: {
width: 44,
height: 44,
borderRadius: 12,
backgroundColor: colors.surfaceElevated,
alignItems: 'center',
justifyContent: 'center',
marginRight: spacing.md,
},
historyText: {
flex: 1,
},
historyTitle: {
...typography.body,
fontWeight: '600',
},
historySubtitle: {
...typography.caption,
marginTop: 2,
},
sectionTitle: {
...typography.h3,
marginBottom: spacing.lg,
},
serviceItem: {
flexDirection: 'row',
alignItems: 'center',
backgroundColor: colors.surface,
borderRadius: borderRadius.lg,
padding: spacing.lg,
marginBottom: spacing.md,
},
serviceIcon: {
width: 48,
height: 48,
borderRadius: 14,
alignItems: 'center',
justifyContent: 'center',
marginRight: spacing.md,
},
serviceText: {
flex: 1,
},
serviceTitle: {
...typography.body,
fontWeight: '600',
},
serviceDescription: {
...typography.caption,
marginTop: 2,
},
});
