/**
* NotificationsScreen - Tela de Notificações
* 
* Lista de notificações com indicador de não lidas, tipo e swipe-to-delete.
* Inclui configurações de notificação com toggles por tipo.
* 
* @module screens/NotificationsScreen
*/

import React, { useState, useRef } from 'react';
import {
View, Text, StyleSheet, FlatList, TouchableOpacity, Switch, Animated,
Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { colors, spacing, borderRadius, typography, useThemeMode } from '../lib/theme';
import { useAppStore } from '../store/useAppStore';
import { Notification, NotificationType } from '../api/types/notification';
import { formatRelativeDate } from '../utils/formatters';
import EmptyState from '../components/EmptyState';

interface NotificationsScreenProps {
navigation: any;
}

/** Mapeia tipo de notificação para ícone e cor */
function getNotificationMeta(type: NotificationType): { icon: string; color: string } {
switch (type) {
case 'INVOICE': return { icon: 'file-text', color: colors.accent };
case 'CONSUMPTION_ALERT': return { icon: 'alert-triangle', color: colors.warning };
case 'SERVICE_COMPLETED': return { icon: 'check-circle', color: colors.success };
case 'PROMOTION': return { icon: 'gift', color: colors.secondary };
case 'ACTIVATION': return { icon: 'smartphone', color: colors.success };
default: return { icon: 'bell', color: colors.textSecondary };
}
}

/** Labels amigáveis para tipos de notificação (usados nas configs) */
const NOTIF_TYPE_LABELS: Record<NotificationType, string> = {
INVOICE: 'Faturas disponíveis',
CONSUMPTION_ALERT: 'Alertas de consumo',
SERVICE_COMPLETED: 'Solicitações concluídas',
PROMOTION: 'Promoções e ofertas',
ACTIVATION: 'Ativações',
};

export default function NotificationsScreen({ navigation }: NotificationsScreenProps) {
  /** Subscreve ao tema para re-render automatico */
  const { mode: themeMode } = useThemeMode();
  const styles = getStyles();
const notifications = useAppStore((s) => s.notifications);
const markNotificationRead = useAppStore((s) => s.markNotificationRead);

/** Controle de aba: notificações vs configurações */
const [activeTab, setActiveTab] = useState<'list' | 'settings'>('list');

/** Estado local de notificações (para deletar sem afetar store) */
const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

/** Configurações de notificação (mock - seria persistido via API) */
const [notifSettings, setNotifSettings] = useState<Record<NotificationType, boolean>>({
INVOICE: true,
CONSUMPTION_ALERT: true,
SERVICE_COMPLETED: true,
PROMOTION: true,
ACTIVATION: true,
});
const [pushEnabled, setPushEnabled] = useState(true);

/** Refs para fechar swipeables */
const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

/** Notificações visíveis (removendo deletadas) */
const visibleNotifications = notifications.filter((n) => !deletedIds.has(n.id));

const handlePress = (notification: Notification) => {
if (!notification.read) {
markNotificationRead(notification.id);
}
};

/** Handler para deletar notificação */
const handleDelete = (notificationId: string) => {
swipeableRefs.current.get(notificationId)?.close();
setDeletedIds((prev) => new Set(prev).add(notificationId));
};

/** Renderiza ação de swipe (botão deletar) */
const renderRightActions = (notificationId: string) => {
return (
<TouchableOpacity
style={styles.deleteAction}
onPress={() => handleDelete(notificationId)}
>
<Feather name="trash-2" size={20} color="#FFF" />
<Text style={styles.deleteText}>Excluir</Text>
</TouchableOpacity>
);
};

const renderItem = ({ item }: { item: Notification }) => {
const meta = getNotificationMeta(item.type);
return (
<Swipeable
ref={(ref) => { if (ref) swipeableRefs.current.set(item.id, ref); }}
renderRightActions={() => renderRightActions(item.id)}
overshootRight={false}
>
<TouchableOpacity
style={[styles.notifItem, !item.read && styles.notifUnread]}
onPress={() => handlePress(item)}
activeOpacity={0.7}
>
<View style={[styles.notifIcon, { backgroundColor: meta.color + '15' }]}>
<Feather name={meta.icon as any} size={20} color={meta.color} />
</View>
<View style={styles.notifContent}>
<View style={styles.notifHeader}>
<Text style={[styles.notifTitle, !item.read && styles.notifTitleBold]}>
{item.title}
</Text>
{!item.read && <View style={styles.unreadDot} />}
</View>
<Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
<Text style={styles.notifTime}>{formatRelativeDate(item.createdAt)}</Text>
</View>
</TouchableOpacity>
</Swipeable>
);
};

/** Renderiza tela de configurações de notificação */
const renderSettings = () => (
<ScrollableSettings>
<View style={styles.settingsSection}>
<Text style={styles.settingsSectionTitle}>Push Notifications</Text>
<View style={styles.settingRow}>
<View style={styles.settingInfo}>
  <Feather name="bell" size={20} color={colors.textPrimary} />
  <Text style={styles.settingLabel}>Ativar notificações push</Text>
</View>
<Switch
  value={pushEnabled}
  onValueChange={setPushEnabled}
  trackColor={{ false: colors.border, true: colors.accent + '60' }}
  thumbColor={pushEnabled ? colors.accent : colors.disabled}
/>
</View>
</View>

<View style={styles.settingsSection}>
<Text style={styles.settingsSectionTitle}>Tipos de notificação</Text>
{(Object.keys(NOTIF_TYPE_LABELS) as NotificationType[]).map((type) => (
<View key={type} style={styles.settingRow}>
  <View style={styles.settingInfo}>
    <Feather name={getNotificationMeta(type).icon as any} size={18} color={colors.textSecondary} />
    <Text style={styles.settingLabel}>{NOTIF_TYPE_LABELS[type]}</Text>
  </View>
  <Switch
    value={notifSettings[type]}
    onValueChange={(val) => setNotifSettings((prev) => ({ ...prev, [type]: val }))}
    trackColor={{ false: colors.border, true: colors.accent + '60' }}
    thumbColor={notifSettings[type] ? colors.accent : colors.disabled}
  />
</View>
))}
</View>
</ScrollableSettings>
);

return (
<SafeAreaView style={styles.container} edges={['top']}>
{/* Header */}
<View style={styles.header}>
<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
<Feather name="arrow-left" size={24} color={colors.textPrimary} />
</TouchableOpacity>
<Text style={styles.headerTitle}>Notificações</Text>
{/* Botão de configurações */}
<TouchableOpacity
onPress={() => setActiveTab(activeTab === 'list' ? 'settings' : 'list')}
style={styles.backBtn}
>
<Feather
name={activeTab === 'list' ? 'settings' : 'list'}
size={22}
color={colors.textPrimary}
/>
</TouchableOpacity>
</View>

{activeTab === 'list' ? (
<FlatList
data={visibleNotifications}
keyExtractor={(item) => item.id}
renderItem={renderItem}
contentContainerStyle={visibleNotifications.length === 0 ? { flex: 1 } : { paddingBottom: 24 }}
ListEmptyComponent={
<EmptyState
icon="bell-off"
title="Sem notificações"
message="Você não possui notificações no momento."
/>
}
/>
) : (
renderSettings()
)}
</SafeAreaView>
);

function ScrollableSettings({ children }: { children: any }) {
return (
<View style={styles.settingsContainer}>
{children}
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
notifItem: {
flexDirection: 'row',
padding: spacing.lg,
backgroundColor: colors.surface,
borderBottomWidth: 1,
borderBottomColor: colors.divider,
},
notifUnread: {
backgroundColor: colors.surfaceElevated,
},
notifIcon: {
width: 44,
height: 44,
borderRadius: 12,
alignItems: 'center',
justifyContent: 'center',
marginRight: spacing.md,
},
notifContent: {
flex: 1,
},
notifHeader: {
flexDirection: 'row',
alignItems: 'center',
gap: spacing.sm,
},
notifTitle: {
...typography.body,
flex: 1,
},
notifTitleBold: {
fontWeight: '600',
},
unreadDot: {
width: 8,
height: 8,
borderRadius: 4,
backgroundColor: colors.accent,
},
notifMessage: {
...typography.bodySmall,
marginTop: 4,
},
notifTime: {
...typography.caption,
marginTop: 6,
},
/** Ação de swipe para deletar */
deleteAction: {
backgroundColor: colors.error,
justifyContent: 'center',
alignItems: 'center',
width: 80,
paddingHorizontal: spacing.md,
},
deleteText: {
color: colors.textOnPrimary,
fontSize: 11,
fontWeight: '600',
marginTop: 4,
},
/** Configurações */
settingsContainer: {
flex: 1,
padding: spacing.xl,
},
settingsSection: {
marginBottom: spacing.xxl,
},
settingsSectionTitle: {
...typography.h3,
fontSize: 16,
marginBottom: spacing.lg,
},
settingRow: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
backgroundColor: colors.surface,
padding: spacing.lg,
borderRadius: borderRadius.md,
marginBottom: spacing.sm,
},
settingInfo: {
flexDirection: 'row',
alignItems: 'center',
gap: spacing.md,
flex: 1,
},
settingLabel: {
...typography.body,
fontSize: 14,
},
});
