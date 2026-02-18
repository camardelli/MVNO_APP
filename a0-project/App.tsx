/**
 * App.tsx - Ponto de entrada do SKY Móvel
 * 
 * Configura a navegação principal do app:
 * - Stack global: Splash, Onboarding, Login, MainTabs
 * - Bottom Tabs: Home, Faturas, Plano, Serviços, Conta
 * - Stack por tab para telas secundárias
 * 
 * @module App
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, Text, TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { colors, ThemeProvider, useThemeMode } from './lib/theme';

/** Telas de autenticação */
import SplashScreen from './screens/SplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/LoginScreen';

/** Telas de tab */
import HomeScreen from './screens/HomeScreen';
import InvoicesScreen from './screens/InvoicesScreen';
import PlanScreen from './screens/PlanScreen';
import ServicesScreen from './screens/ServicesScreen';
import AccountScreen from './screens/AccountScreen';

/** Telas secundárias (stack) */
import BuyDataScreen from './screens/BuyDataScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import ChipActivationScreen from './screens/ChipActivationScreen';
import PortabilityScreen from './screens/PortabilityScreen';
import ChipSwapScreen from './screens/ChipSwapScreen';
import LineBlockScreen from './screens/LineBlockScreen';
import CancellationScreen from './screens/CancellationScreen';
import ServiceHistoryScreen from './screens/ServiceHistoryScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/** Ícones das tabs com mapeamento para Feather */
const TAB_ICONS: Record<string, string> = {
  Home: 'home',
  Faturas: 'file-text',
  Plano: 'wifi',
  Serviços: 'settings',
  Conta: 'user',
};

/**
 * MainTabs - Navegação por tabs (bottom bar)
 * 
 * 5 tabs: Home, Faturas, Plano, Serviços, Conta
 * Cores do tab bar reativas ao tema (Night/Day)
 */
function MainTabs() {
  /** Força re-render quando tema muda */
  const { mode } = useThemeMode();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          const iconName = TAB_ICONS[route.name] || 'circle';
          return <Feather name={iconName as any} size={22} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Faturas" component={InvoicesScreen} options={{ tabBarLabel: 'Faturas' }} />
      <Tab.Screen name="Plano" component={PlanScreen} options={{ tabBarLabel: 'Plano' }} />
      <Tab.Screen name="Serviços" component={ServicesScreen} options={{ tabBarLabel: 'Serviços' }} />
      <Tab.Screen name="Conta" component={AccountScreen} options={{ tabBarLabel: 'Conta' }} />
    </Tab.Navigator>
  );
}

/**
 * RootStack - Navegação raiz (Stack global)
 * 
 * Inclui telas de autenticação e telas secundárias
 * que aparecem sobre os tabs.
 */
function RootStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Splash"
    >
      {/* Telas de autenticação */}
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />

      {/* Tab principal */}
      <Stack.Screen name="MainTabs" component={MainTabs} />

      {/* Telas secundárias (sobre os tabs) */}
      <Stack.Screen name="BuyData" component={BuyDataScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="ChipActivation" component={ChipActivationScreen} />
      <Stack.Screen name="Portability" component={PortabilityScreen} />
      <Stack.Screen name="ChipSwap" component={ChipSwapScreen} />
      <Stack.Screen name="LineBlock" component={LineBlockScreen} />
      <Stack.Screen name="Cancellation" component={CancellationScreen} />
      <Stack.Screen name="ServiceHistory" component={ServiceHistoryScreen} />
    </Stack.Navigator>
  );
}

/**
 * AppContent - Conteúdo principal com acesso ao tema
 * 
 * Separado do App() para poder usar useThemeMode() dentro do ThemeProvider.
 * Configura Text.defaultProps para garantir que TODOS os Text
 * herdem a cor do tema ativo (resolve texto preto em dark mode).
 */
function AppContent() {
  const { isDark } = useThemeMode();

  /**
   * Define cor padrão global para todos os componentes Text e TextInput.
   * Sem isso, React Native usa preto como default, ficando invisível no Night mode.
   */
  if (Text.defaultProps == null) Text.defaultProps = {};
  Text.defaultProps.style = { color: colors.textPrimary };

  if (TextInput.defaultProps == null) TextInput.defaultProps = {};
  TextInput.defaultProps.placeholderTextColor = colors.inputPlaceholder;
  TextInput.defaultProps.style = { color: colors.textPrimary };

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer>
        <RootStack />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}