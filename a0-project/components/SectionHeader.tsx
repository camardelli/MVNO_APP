/**
* SectionHeader - Cabeçalho de seção reutilizável
* @module components/SectionHeader
*/

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, useThemeMode } from '../lib/theme';

interface SectionHeaderProps {
title: string;
actionLabel?: string;
onAction?: () => void;
}

export default function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  const { mode: themeMode } = useThemeMode();
  const styles = getStyles();
return (
<View style={styles.container}>
<Text style={styles.title}>{title}</Text>
{actionLabel && onAction && (
<TouchableOpacity onPress={onAction}>
<Text style={styles.action}>{actionLabel}</Text>
</TouchableOpacity>
)}
</View>
);
}

const getStyles = () => StyleSheet.create({
container: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
marginBottom: spacing.md,
},
title: {
...typography.h3,
},
action: {
...typography.action,
fontSize: 14,
},
});
