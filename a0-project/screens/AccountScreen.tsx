/**
* AccountScreen - Minha Conta
* 
* Exibe dados pessoais, informações da linha móvel e opções de conta.
* 
* @module screens/AccountScreen
*/

import React, { useState } from 'react';
import {
View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
Modal, TextInput, RefreshControl, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, useThemeMode } from '../lib/theme';
import { useAppStore } from '../store/useAppStore';
import {
maskCPF, formatPhone, formatZipCode, maskICCID, formatDate,
} from '../utils/formatters';
import * as customerService from '../api/services/customerService';
import SKYCard from '../components/SKYCard';
import SKYButton from '../components/SKYButton';
import StatusBadge from '../components/StatusBadge';

interface AccountScreenProps {
navigation: any;
}

/** Mapeia status da linha para variante de badge */
function getLineStatusBadge(status: string): { label: string; variant: 'success' | 'warning' | 'error' | 'neutral' } {
switch (status) {
case 'ACTIVE': return { label: 'Ativo', variant: 'success' };
case 'SUSPENDED': return { label: 'Suspenso', variant: 'warning' };
case 'BLOCKED': return { label: 'Bloqueado', variant: 'error' };
case 'CANCELLED': return { label: 'Cancelado', variant: 'neutral' };
default: return { label: status, variant: 'neutral' };
}
}

export default function AccountScreen({ navigation }: AccountScreenProps) {
  /** Subscreve ao tema para re-render automatico */
  const { mode: themeMode, isDark, toggleTheme } = useThemeMode();
  const styles = getStyles();
const customer = useAppStore((s: any) => s.customer);
const logout = useAppStore((s: any) => s.logout);
const loadCustomerData = useAppStore((s: any) => s.loadCustomerData);
const [showEditModal, setShowEditModal] = useState(false);
const [editEmail, setEditEmail] = useState(customer?.email || '');
const [editPhone, setEditPhone] = useState(customer?.phone || '');
const [saving, setSaving] = useState(false);
const [refreshing, setRefreshing] = useState(false);

/** Pull-to-refresh: recarrega dados do cliente */
const handleRefresh = async () => {
  setRefreshing(true);
  try {
    await loadCustomerData();
  } catch {
    // Silencioso - dados do cache permanecem
  } finally {
    setRefreshing(false);
  }
};

/** Salvar alterações de perfil */
const handleSaveProfile = async () => {
if (!customer) return;
setSaving(true);
try {
await customerService.updateCustomerProfile(customer.id, {
email: editEmail,
phone: editPhone,
});
setShowEditModal(false);
Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
} catch {
Alert.alert('Erro', 'Não foi possível atualizar os dados.');
} finally {
setSaving(false);
}
};

/** Handler de logout */
const handleLogout = () => {
Alert.alert('Sair', 'Deseja realmente sair do app?', [
{ text: 'Cancelar', style: 'cancel' },
{
text: 'Sair',
style: 'destructive',
onPress: async () => {
await logout();
navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
},
},
]);
};

if (!customer) return null;

const line = customer.mobileLines[0];
const lineStatus = line ? getLineStatusBadge(line.status) : null;

return (
<SafeAreaView style={styles.container} edges={['top']}>
{/* Header */}
<View style={styles.header}>
<Text style={styles.headerTitle}>Minha Conta</Text>
<TouchableOpacity
style={styles.notifBtn}
onPress={() => navigation.navigate('Notifications')}
>
<Feather name="bell" size={22} color={colors.textPrimary} />
</TouchableOpacity>
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
{/* Dados Pessoais */}
<SKYCard style={styles.sectionCard}>
<View style={styles.sectionHeader}>
<Text style={styles.sectionTitle}>Dados Pessoais</Text>
<TouchableOpacity onPress={() => setShowEditModal(true)}>
<Text style={styles.editLink}>Editar</Text>
</TouchableOpacity>
</View>

<InfoRow label="Nome" value={customer.fullName} />
<InfoRow label="CPF" value={maskCPF(customer.cpf)} />
<InfoRow label="E-mail" value={customer.email} />
<InfoRow label="Telefone" value={formatPhone(customer.phone)} />
<InfoRow
label="Endereço"
value={`${customer.address.street}, ${customer.address.number}${customer.address.complement ? ' - ' + customer.address.complement : ''}\n${customer.address.neighborhood} - ${customer.address.city}/${customer.address.state}\nCEP: ${formatZipCode(customer.address.zipCode)}`}
/>
</SKYCard>

{/* Linha Móvel */}
{line && (
<SKYCard style={styles.sectionCard}>
<Text style={styles.sectionTitle}>Linha Móvel</Text>

<InfoRow label="Número" value={formatPhone(line.msisdn)} />
<View style={styles.statusRow}>
<Text style={styles.infoLabel}>Status</Text>
<StatusBadge label={lineStatus!.label} variant={lineStatus!.variant} />
</View>
<InfoRow label="ICCID" value={maskICCID(line.iccid)} />
<InfoRow label="Ativação" value={formatDate(line.activationDate)} />
</SKYCard>
)}

{/* Opções */}
<View style={styles.options}>
{/* Toggle de tema Night/Day */}
<View style={styles.optionItem}>
<View style={styles.optionIcon}>
<Feather name={isDark ? 'moon' : 'sun'} size={20} color={colors.textPrimary} />
</View>
<Text style={styles.optionLabel}>{isDark ? 'Modo Escuro' : 'Modo Claro'}</Text>
<Switch
value={isDark}
onValueChange={toggleTheme}
trackColor={{ false: colors.border, true: colors.primary }}
thumbColor={colors.surface}
/>
</View>

{[
{ icon: 'bell', label: 'Notificações', screen: 'Notifications' },
{ icon: 'shield', label: 'Segurança', screen: null },
{ icon: 'help-circle', label: 'Ajuda', screen: null },
{ icon: 'info', label: 'Sobre o app', screen: null },
].map((opt) => (
<TouchableOpacity
key={opt.label}
style={styles.optionItem}
onPress={() => {
if (opt.screen) navigation.navigate(opt.screen);
else Alert.alert(opt.label, 'Funcionalidade será integrada em breve.');
}}
>
<View style={styles.optionIcon}>
<Feather name={opt.icon as any} size={20} color={colors.textPrimary} />
</View>
<Text style={styles.optionLabel}>{opt.label}</Text>
<Feather name="chevron-right" size={20} color={colors.textSecondary} />
</TouchableOpacity>
))}
</View>

{/* Botão Sair */}
<SKYButton
title="Sair da conta"
onPress={handleLogout}
variant="danger"
size="large"
icon={<Feather name="log-out" size={18} color={colors.textOnPrimary} />}
style={{ marginTop: spacing.xl } as any}
/>

<Text style={styles.version}>SKY Móvel v1.0.0</Text>
<View style={{ height: 24 }} />
</ScrollView>

{/* Modal de edição */}
<Modal visible={showEditModal} animationType="slide" transparent>
<View style={styles.modalOverlay}>
<View style={styles.modalContent}>
<View style={styles.modalHeader}>
<Text style={styles.modalTitle}>Editar dados</Text>
<TouchableOpacity onPress={() => setShowEditModal(false)}>
<Feather name="x" size={24} color={colors.textPrimary} />
</TouchableOpacity>
</View>

<View style={styles.inputGroup}>
<Text style={styles.inputLabel}>E-mail</Text>
<TextInput
style={styles.input}
value={editEmail}
onChangeText={setEditEmail}
keyboardType="email-address"
autoCapitalize="none"
/>
</View>

<View style={styles.inputGroup}>
<Text style={styles.inputLabel}>Telefone</Text>
<TextInput
style={styles.input}
value={editPhone}
onChangeText={setEditPhone}
keyboardType="phone-pad"
/>
</View>

<SKYButton
title="Salvar alterações"
onPress={handleSaveProfile}
loading={saving}
size="large"
style={{ marginTop: spacing.lg } as any}
/>
</View>
</View>
</Modal>
</SafeAreaView>
);

function InfoRow({ label, value }: { label: string; value: string }) {
return (
<View style={styles.infoRow}>
<Text style={styles.infoLabel}>{label}</Text>
<Text style={styles.infoValue}>{value}</Text>
</View>
);
}
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
notifBtn: {
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
sectionCard: {
marginBottom: spacing.lg,
},
sectionHeader: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
marginBottom: spacing.lg,
},
sectionTitle: {
...typography.h3,
marginBottom: spacing.md,
},
editLink: {
...typography.action,
fontSize: 14,
marginBottom: spacing.md,
},
infoRow: {
marginBottom: spacing.md,
},
statusRow: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
marginBottom: spacing.md,
},
infoLabel: {
...typography.caption,
fontWeight: '500',
marginBottom: 2,
},
infoValue: {
...typography.body,
lineHeight: 22,
},
options: {
backgroundColor: colors.surface,
borderRadius: borderRadius.lg,
overflow: 'hidden',
},
optionItem: {
flexDirection: 'row',
alignItems: 'center',
padding: spacing.lg,
borderBottomWidth: 1,
borderBottomColor: colors.divider,
},
optionIcon: {
width: 36,
height: 36,
borderRadius: 10,
backgroundColor: colors.background,
alignItems: 'center',
justifyContent: 'center',
marginRight: spacing.md,
},
optionLabel: {
...typography.body,
fontWeight: '500',
flex: 1,
},
version: {
...typography.caption,
textAlign: 'center',
marginTop: spacing.xl,
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
inputGroup: {
marginBottom: spacing.lg,
},
inputLabel: {
...typography.bodySmall,
fontWeight: '600',
color: colors.textPrimary,
marginBottom: spacing.sm,
},
input: {
backgroundColor: colors.background,
borderRadius: borderRadius.md,
borderWidth: 1,
borderColor: colors.border,
paddingHorizontal: spacing.lg,
height: 48,
fontSize: 15,
color: colors.textPrimary,
},
});
