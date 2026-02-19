/**
* LoginScreen - Tela de autenticação
* 
* Campos: CPF (com máscara), Senha, "Lembrar-me", "Esqueci minha senha".
* Após login bem-sucedido, navega para MainTabs.
* 
* @module screens/LoginScreen
*/

import React, { useState } from 'react';
import {
View, Text, StyleSheet, TextInput, TouchableOpacity,
KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, borderRadius, typography, shadows, useThemeMode } from '../lib/theme';
import { useAppStore } from '../store/useAppStore';
import { applyCPFMask } from '../utils/formatters';
import SKYButton from '../components/SKYButton';

interface LoginScreenProps {
navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  /** Subscreve ao tema para re-render automatico */
  const { mode: themeMode } = useThemeMode();
  const styles = getStyles();
const [cpf, setCpf] = useState('');
const [password, setPassword] = useState('');
const [showPassword, setShowPassword] = useState(false);
const [rememberMe, setRememberMe] = useState(false);
const [error, setError] = useState('');

const login = useAppStore((s) => s.login);
const isLoading = useAppStore((s) => s.isLoading);

/** Handler de login */
const handleLogin = async () => {
setError('');

/** Validação de campos */
const cleanCpf = cpf.replace(/\D/g, '');
if (cleanCpf.length !== 11) {
setError('CPF inválido. Informe 11 dígitos.');
return;
}
if (password.length < 4) {
setError('Senha deve ter no mínimo 4 caracteres.');
return;
}

try {
await login({ cpf: cleanCpf, password, deviceId: 'device-001' });

/** Após login bem-sucedido, oferece ativação de biometria */
try {
  const biometricEnabled = await AsyncStorage.getItem('biometricEnabled');
  if (!biometricEnabled) {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (compatible && enrolled) {
      Alert.alert(
        'Biometria',
        'Deseja ativar o login por biometria (impressão digital ou Face ID)?',
        [
          { text: 'Agora não', style: 'cancel', onPress: () => {
            AsyncStorage.setItem('biometricEnabled', 'declined');
            navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
          }},
          { text: 'Ativar', onPress: async () => {
            await AsyncStorage.setItem('biometricEnabled', 'true');
            navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
          }},
        ]
      );
      return;
    }
  }
} catch (bioErr) {
  // Biometric check failed (e.g. web preview) - proceed normally
  console.log('Biometric check skipped:', bioErr);
}

navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
} catch (err: any) {
setError(err.message || 'Erro ao fazer login. Tente novamente.');
}
};

/** Handler de CPF com máscara */
const handleCpfChange = (text: string) => {
setCpf(applyCPFMask(text));
if (error) setError('');
};

return (
<SafeAreaView style={styles.container}>
<KeyboardAvoidingView
behavior={Platform.OS === 'ios' ? 'padding' : undefined}
style={styles.flex}
>
<ScrollView 
contentContainerStyle={styles.scrollContent}
keyboardShouldPersistTaps="handled"
>
{/* Logo */}
<View style={styles.logoSection}>
<View style={styles.logoBox}>
<Text style={styles.logoSky}>SKY</Text>
<Text style={styles.logoMovel}>Móvel</Text>
</View>
<View style={styles.redLine} />
</View>

{/* Formulário */}
<View style={styles.formSection}>
<Text style={styles.welcomeText}>Bem-vindo de volta!</Text>
<Text style={styles.subtitleText}>Entre com suas credenciais para acessar</Text>

{/* Campo CPF */}
<View style={styles.inputContainer}>
<Text style={styles.label}>CPF</Text>
<View style={[styles.inputWrapper, error ? styles.inputError : undefined]}>
<Feather name="user" size={20} color={colors.textSecondary} style={styles.inputIcon} />
<TextInput
style={styles.input}
placeholder="000.000.000-00"
placeholderTextColor={colors.inputPlaceholder}
value={cpf}
onChangeText={handleCpfChange}
keyboardType="numeric"
maxLength={14}
/>
</View>
</View>

{/* Campo Senha */}
<View style={styles.inputContainer}>
<Text style={styles.label}>Senha</Text>
<View style={[styles.inputWrapper, error ? styles.inputError : undefined]}>
<Feather name="lock" size={20} color={colors.textSecondary} style={styles.inputIcon} />
<TextInput
style={styles.input}
placeholder="Digite sua senha"
placeholderTextColor={colors.inputPlaceholder}
value={password}
onChangeText={(t) => { setPassword(t); if (error) setError(''); }}
secureTextEntry={!showPassword}
/>
<TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
<Feather 
name={showPassword ? 'eye-off' : 'eye'} 
size={20} 
color={colors.textSecondary} 
/>
</TouchableOpacity>
</View>
</View>

{/* Mensagem de erro */}
{error ? (
<View style={styles.errorContainer}>
<Feather name="alert-circle" size={16} color={colors.error} />
<Text style={styles.errorText}>{error}</Text>
</View>
) : null}

{/* Lembrar-me e Esqueci senha */}
<View style={styles.optionsRow}>
<TouchableOpacity 
style={styles.checkboxRow} 
onPress={() => setRememberMe(!rememberMe)}
>
<View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
{rememberMe && <Feather name="check" size={14} color="#FFF" />}
</View>
<Text style={styles.checkboxLabel}>Lembrar-me</Text>
</TouchableOpacity>
<TouchableOpacity onPress={() => Alert.alert('Recuperar senha', 'Funcionalidade será integrada com o Core SKY.')}>
<Text style={styles.forgotText}>Esqueci minha senha</Text>
</TouchableOpacity>
</View>

{/* Botão Entrar */}
<SKYButton
title="Entrar"
onPress={handleLogin}
loading={isLoading}
size="large"
style={{ marginTop: spacing.xxl } as any}
/>

{/* Dica de teste */}
<View style={styles.testHint}>
<Feather name="info" size={14} color={colors.textSecondary} />
<Text style={styles.testHintText}>
Demo: CPF 123.456.789-00 / Senha: 1234
</Text>
</View>
</View>
</ScrollView>
</KeyboardAvoidingView>
</SafeAreaView>
);
}

const getStyles = () => StyleSheet.create({
container: {
flex: 1,
backgroundColor: colors.background,
},
flex: {
flex: 1,
},
scrollContent: {
flexGrow: 1,
},
logoSection: {
alignItems: 'center',
paddingTop: 48,
paddingBottom: 32,
backgroundColor: colors.primary,
borderBottomLeftRadius: borderRadius.xl,
borderBottomRightRadius: borderRadius.xl,
},
logoBox: {
flexDirection: 'row',
alignItems: 'flex-end',
},
logoSky: {
fontSize: 40,
fontWeight: '800',
color: colors.textOnPrimary,
letterSpacing: 2,
},
logoMovel: {
fontSize: 18,
fontWeight: '300',
color: colors.textOnPrimary,
marginLeft: 4,
marginBottom: 5,
},
redLine: {
width: 40,
height: 3,
backgroundColor: colors.secondary,
borderRadius: 2,
marginTop: 8,
},
formSection: {
paddingHorizontal: spacing.xxl,
paddingTop: spacing.xxxl,
},
welcomeText: {
...typography.h1,
marginBottom: spacing.sm,
},
subtitleText: {
...typography.body,
color: colors.textSecondary,
marginBottom: spacing.xxxl,
},
inputContainer: {
marginBottom: spacing.lg,
},
label: {
...typography.bodySmall,
fontWeight: '600',
color: colors.textPrimary,
marginBottom: spacing.sm,
},
inputWrapper: {
flexDirection: 'row',
alignItems: 'center',
backgroundColor: colors.surface,
borderRadius: borderRadius.md,
borderWidth: 1,
borderColor: colors.border,
paddingHorizontal: spacing.lg,
height: 52,
},
inputError: {
borderColor: colors.error,
},
inputIcon: {
marginRight: spacing.md,
},
input: {
flex: 1,
fontSize: 15,
color: colors.textPrimary,
},
errorContainer: {
flexDirection: 'row',
alignItems: 'center',
marginBottom: spacing.md,
},
errorText: {
color: colors.error,
fontSize: 13,
marginLeft: spacing.sm,
},
optionsRow: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
},
checkboxRow: {
flexDirection: 'row',
alignItems: 'center',
},
checkbox: {
width: 22,
height: 22,
borderRadius: 6,
borderWidth: 2,
borderColor: colors.border,
alignItems: 'center',
justifyContent: 'center',
marginRight: spacing.sm,
},
checkboxActive: {
backgroundColor: colors.accent,
borderColor: colors.accent,
},
checkboxLabel: {
...typography.bodySmall,
color: colors.textPrimary,
},
forgotText: {
...typography.action,
fontSize: 13,
},
testHint: {
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'center',
marginTop: spacing.xl,
padding: spacing.md,
backgroundColor: colors.surfaceElevated,
borderRadius: borderRadius.sm,
},
testHintText: {
...typography.caption,
marginLeft: spacing.sm,
color: colors.textSecondary,
},
});
