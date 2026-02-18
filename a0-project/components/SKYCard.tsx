/**
* SKYCard - Card padrão SKY Móvel
* 
* Card com sombra suave e border-radius 16px.
* 
* @module components/SKYCard
*/

import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { colors, borderRadius, shadows, spacing, useThemeMode } from '../lib/theme';

interface SKYCardProps {
children: React.ReactNode;
style?: ViewStyle;
onPress?: () => void;
noPadding?: boolean;
}

export default function SKYCard({ children, style, onPress, noPadding }: SKYCardProps) {
  const { mode: themeMode } = useThemeMode();
  const styles = getStyles();

  /** Estilos combinados do card */
  const cardStyle = [styles.card, noPadding ? styles.noPaddingCard : undefined, style];

  /**
   * Quando onPress é definido, aplica os estilos diretamente no TouchableOpacity
   * para que width/height/flexBasis participem corretamente do layout flex.
   * Sem isso, o TouchableOpacity colapsa e o card interno fica menor.
   */
  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={cardStyle}>
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
}

const getStyles = () => StyleSheet.create({
card: {
backgroundColor: colors.surface,
borderRadius: borderRadius.lg,
padding: spacing.xl,
borderWidth: 1,
borderColor: colors.border,
...shadows.card,
},
noPaddingCard: {
padding: 0,
},
});