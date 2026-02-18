/**
* StatusBadge - Badge de status colorido
* 
* Exibe status com cores correspondentes:
* - success: verde (Ativo, Paga, Concluída)
* - warning: amarelo (Pendente, Em análise)
* - error: vermelho (Vencida, Bloqueado, Cancelada)
* - info: azul (Processando)
* 
* @module components/StatusBadge
*/

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing, useThemeMode } from '../lib/theme';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusBadgeProps {
label: string;
variant: BadgeVariant;
}

/** Mapeamento de variantes para cores */
const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
success: { bg: '#D1FAE5', text: '#065F46' },
warning: { bg: '#FEF3C7', text: '#92400E' },
error: { bg: '#FEE2E2', text: '#991B1B' },
info: { bg: '#DBEAFE', text: '#1E40AF' },
neutral: { bg: '#F3F4F6', text: '#4B5563' },
};

export default function StatusBadge({ label, variant }: StatusBadgeProps) {
  const { mode: themeMode, isDark } = useThemeMode();
  const styles = getStyles();

  /** Cores de badge adaptadas ao tema ativo */
  const getVariantColors = (): Record<BadgeVariant, { bg: string; text: string }> => ({
    success: isDark
      ? { bg: 'rgba(16, 185, 129, 0.15)', text: '#34D399' }
      : { bg: '#D1FAE5', text: '#065F46' },
    warning: isDark
      ? { bg: 'rgba(251, 191, 36, 0.15)', text: '#FBBF24' }
      : { bg: '#FEF3C7', text: '#92400E' },
    error: isDark
      ? { bg: 'rgba(248, 113, 113, 0.15)', text: '#F87171' }
      : { bg: '#FEE2E2', text: '#991B1B' },
    info: isDark
      ? { bg: 'rgba(96, 165, 250, 0.15)', text: '#60A5FA' }
      : { bg: '#DBEAFE', text: '#1E40AF' },
    neutral: isDark
      ? { bg: 'rgba(158, 158, 167, 0.15)', text: '#9E9EA7' }
      : { bg: '#F3F4F6', text: '#4B5563' },
  });

  const colorScheme = getVariantColors()[variant];

  return (
    <View style={[styles.badge, { backgroundColor: colorScheme.bg }]}>
      <Text style={[styles.text, { color: colorScheme.text }]}>{label}</Text>
    </View>
  );
}

const getStyles = () => StyleSheet.create({
badge: {
paddingHorizontal: spacing.md,
paddingVertical: spacing.xs,
borderRadius: borderRadius.full,
alignSelf: 'flex-start',
},
text: {
fontSize: 12,
fontWeight: '600',
},
});