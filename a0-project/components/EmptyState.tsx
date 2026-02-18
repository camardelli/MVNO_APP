/**
* EmptyState - Componente de estado vazio
* @module components/EmptyState
*/

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, useThemeMode } from '../lib/theme';
import { Feather } from '@expo/vector-icons';

interface EmptyStateProps {
icon: string;
title: string;
message: string;
}

export default function EmptyState({ icon, title, message }: EmptyStateProps) {
  const { mode: themeMode } = useThemeMode();
  const styles = getStyles();
return (
<View style={styles.container}>
<Feather name={icon as any} size={48} color={colors.disabled} />
<Text style={styles.title}>{title}</Text>
<Text style={styles.message}>{message}</Text>
</View>
);
}

const getStyles = () => StyleSheet.create({
container: {
flex: 1,
justifyContent: 'center',
alignItems: 'center',
paddingHorizontal: spacing.xxxl,
paddingVertical: 60,
},
title: {
...typography.h3,
marginTop: spacing.lg,
textAlign: 'center',
},
message: {
...typography.bodySmall,
marginTop: spacing.sm,
textAlign: 'center',
},
});
