/**
* LoadingScreen - Tela de carregamento padrão
* @module components/LoadingScreen
*/

import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { colors, typography, useThemeMode } from '../lib/theme';

interface LoadingScreenProps {
message?: string;
}

export default function LoadingScreen({ message }: LoadingScreenProps) {
  const { mode: themeMode } = useThemeMode();
  const styles = getStyles();
return (
<View style={styles.container}>
<ActivityIndicator size="large" color={colors.accent} />
{message && <Text style={styles.message}>{message}</Text>}
</View>
);
}

const getStyles = () => StyleSheet.create({
container: {
flex: 1,
justifyContent: 'center',
alignItems: 'center',
backgroundColor: colors.background,
},
message: {
...typography.bodySmall,
marginTop: 16,
},
});
