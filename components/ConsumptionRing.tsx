/**
* ConsumptionRing - Gráfico circular (donut) de consumo
* 
* Exibe o consumo de dados em um anel colorido:
* - Verde: < 70%
* - Amarelo: 70-90%
* - Vermelho: > 90%
* 
* @module components/ConsumptionRing
*/

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, typography, useThemeMode } from '../lib/theme';

interface ConsumptionRingProps {
usedGB: number;
totalGB: number;
percentUsed: number;
size?: number;
}

/** Retorna a cor baseada no percentual de uso */
function getConsumptionColor(percent: number): string {
if (percent < 70) return colors.success;
if (percent < 90) return colors.warning;
return colors.error;
}

export default function ConsumptionRing({ 
usedGB, totalGB, percentUsed, size = 160 
}: ConsumptionRingProps) {
const { mode: themeMode } = useThemeMode();
const styles = getStyles();
const strokeWidth = 12;
const radius = (size - strokeWidth) / 2;
const circumference = 2 * Math.PI * radius;
const progress = Math.min(percentUsed / 100, 1);
const strokeDashoffset = circumference * (1 - progress);
const ringColor = getConsumptionColor(percentUsed);

return (
<View style={[styles.container, { width: size, height: size }]}>
<Svg width={size} height={size} style={styles.svg}>
{/* Anel de fundo */}
<Circle
cx={size / 2}
cy={size / 2}
r={radius}
stroke={colors.border}
strokeWidth={strokeWidth}
fill="none"
/>
{/* Anel de progresso */}
<Circle
cx={size / 2}
cy={size / 2}
r={radius}
stroke={ringColor}
strokeWidth={strokeWidth}
fill="none"
strokeDasharray={`${circumference}`}
strokeDashoffset={strokeDashoffset}
strokeLinecap="round"
transform={`rotate(-90 ${size / 2} ${size / 2})`}
/>
</Svg>
{/* Texto central */}
<View style={styles.textContainer}>
<Text style={styles.usedText}>{usedGB.toFixed(1)}</Text>
<Text style={styles.totalText}>de {totalGB} GB</Text>
</View>
</View>
);
}

const getStyles = () => StyleSheet.create({
container: {
alignItems: 'center',
justifyContent: 'center',
},
svg: {
position: 'absolute',
},
textContainer: {
alignItems: 'center',
},
usedText: {
fontSize: 28,
fontWeight: '700',
color: colors.textPrimary,
letterSpacing: -1,
},
totalText: {
...typography.bodySmall,
marginTop: 2,
},
});
