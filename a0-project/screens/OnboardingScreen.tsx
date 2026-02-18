/**
* OnboardingScreen - Tela de boas-vindas (primeiro acesso)
* 
* 3 slides explicativos com ilustrações.
* Botão "Pular" e "Começar" no último slide.
* 
* @module screens/OnboardingScreen
*/

import React, { useState, useRef } from 'react';
import {
View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, useThemeMode } from '../lib/theme';
import { useAppStore } from '../store/useAppStore';
import SKYButton from '../components/SKYButton';

const { width } = Dimensions.get('window');

/** Dados dos slides de onboarding */
const SLIDES = [
{
icon: 'smartphone',
title: 'Gerencie sua linha',
description: 'Consulte seu consumo de dados, SMS e minutos em tempo real. Tudo na palma da mão.',
},
{
icon: 'credit-card',
title: 'Faturas e pagamentos',
description: 'Acesse suas faturas, pague via Pix ou boleto e configure o débito automático.',
},
{
icon: 'settings',
title: 'Serviços completos',
description: 'Troque de plano, ative chips, solicite portabilidade e muito mais pelo app.',
},
];

interface OnboardingScreenProps {
navigation: any;
}

export default function OnboardingScreen({ navigation }: OnboardingScreenProps) {
  /** Subscreve ao tema para re-render automatico */
  const { mode: themeMode } = useThemeMode();
  const styles = getStyles();
const [currentIndex, setCurrentIndex] = useState(0);
const flatListRef = useRef<FlatList>(null);
const setOnboardingSeen = useAppStore((s) => s.setOnboardingSeen);

/** Navega para tela de login */
const goToLogin = () => {
  setOnboardingSeen();
  navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
};

/** Avança para próximo slide */
const nextSlide = () => {
if (currentIndex < SLIDES.length - 1) {
flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
} else {
goToLogin();
}
};

const renderSlide = ({ item }: { item: (typeof SLIDES)[number] }) => (
<View style={styles.slide}>
<View style={styles.iconCircle}>
<Feather name={item.icon as any} size={48} color={colors.accent} />
</View>
<Text style={styles.slideTitle}>{item.title}</Text>
<Text style={styles.slideDescription}>{item.description}</Text>
</View>
);

return (
<SafeAreaView style={styles.container}>
{/* Botão Pular no topo */}
<View style={styles.header}>
<TouchableOpacity onPress={goToLogin}>
<Text style={styles.skipText}>Pular</Text>
</TouchableOpacity>
</View>

{/* Slides */}
<FlatList
ref={flatListRef}
data={SLIDES}
renderItem={renderSlide}
horizontal
pagingEnabled
showsHorizontalScrollIndicator={false}
keyExtractor={(_, i) => String(i)}
onMomentumScrollEnd={(e) => {
const index = Math.round(e.nativeEvent.contentOffset.x / width);
setCurrentIndex(index);
}}
/>

{/* Indicadores e botão */}
<View style={styles.footer}>
<View style={styles.dots}>
{SLIDES.map((_, i) => (
<View
key={i}
style={[styles.dot, i === currentIndex && styles.dotActive]}
/>
))}
</View>

<SKYButton
title={currentIndex === SLIDES.length - 1 ? 'Começar' : 'Próximo'}
onPress={nextSlide}
size="large"
style={{ width: '100%' } as any}
/>
</View>
</SafeAreaView>
);
}

const getStyles = () => StyleSheet.create({
container: {
flex: 1,
backgroundColor: colors.background,
},
header: {
alignItems: 'flex-end',
paddingHorizontal: spacing.xl,
paddingTop: spacing.md,
},
skipText: {
...typography.action,
fontSize: 16,
},
slide: {
width,
alignItems: 'center',
justifyContent: 'center',
paddingHorizontal: spacing.xxxl,
},
iconCircle: {
width: 100,
height: 100,
borderRadius: 50,
backgroundColor: colors.surfaceElevated,
alignItems: 'center',
justifyContent: 'center',
marginBottom: spacing.xxl,
},
slideTitle: {
...typography.h1,
textAlign: 'center',
marginBottom: spacing.lg,
},
slideDescription: {
...typography.body,
textAlign: 'center',
color: colors.textSecondary,
lineHeight: 24,
},
footer: {
paddingHorizontal: spacing.xxl,
paddingBottom: spacing.xxl,
alignItems: 'center',
},
dots: {
flexDirection: 'row',
marginBottom: spacing.xxl,
},
dot: {
width: 8,
height: 8,
borderRadius: 4,
backgroundColor: colors.disabled,
marginHorizontal: 4,
},
dotActive: {
backgroundColor: colors.accent,
width: 24,
},
});

// ... existing code ...