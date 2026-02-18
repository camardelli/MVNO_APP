/**
 * SKY Móvel - Sistema de Temas (Night / Day)
 * 
 * Implementa tema escuro (Night - padrão) e claro (Day)
 * inspirado na identidade visual do SKY+ (skytvmais.com.br).
 * 
 * Night Mode: Fundo escuro premium (#0D0D0D), cards #1A1A1E,
 * CTAs vermelho SKY (#E30613), texto branco.
 * 
 * Day Mode: Fundo claro (#F5F6FA), cards brancos, mesmos
 * acentos de cor.
 * 
 * ARQUITETURA: O objeto `colors` é um proxy reativo que
 * lê do tema ativo. Todas as telas importam `colors` normalmente
 * e recebem as cores do tema correto automaticamente.
 * 
 * @module lib/theme
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

// ─── Tipos ───────────────────────────────────────────────

/** Modos de tema disponíveis */
export type ThemeMode = 'night' | 'day';

/** Estrutura completa de cores do tema */
export interface ThemeColors {
  /** Cor primária (botões, destaques principais) - Vermelho SKY */
  primary: string;
  /** Cor secundária - Azul SKY escuro */
  secondary: string;
  /** Cor de destaque para links e interações */
  accent: string;
  /** Fundo geral do app */
  background: string;
  /** Superfícies (cards, modais) */
  surface: string;
  /** Cards com elevação sutil (usado em cards secundários) */
  surfaceElevated: string;
  /** Texto principal */
  textPrimary: string;
  /** Texto secundário */
  textSecondary: string;
  /** Texto sobre fundo primário (botões vermelhos) */
  textOnPrimary: string;
  /** Cor de sucesso */
  success: string;
  /** Cor de alerta */
  warning: string;
  /** Cor de erro */
  error: string;
  /** Borda padrão */
  border: string;
  /** Divisores e separadores */
  divider: string;
  /** Fundo desabilitado */
  disabled: string;
  /** Texto desabilitado */
  textDisabled: string;
  /** Fundo de badges e tags */
  badgeBackground: string;
  /** Overlay para modais */
  overlay: string;
  /** Fundo de inputs */
  inputBackground: string;
  /** Texto de placeholder em inputs */
  inputPlaceholder: string;
  /** Fundo do tab bar */
  tabBar: string;
  /** Borda do tab bar */
  tabBarBorder: string;
  /** Fundo da status bar (para configuração) */
  statusBarStyle: 'light' | 'dark';
}

// ─── Paletas ─────────────────────────────────────────────

/**
 * Tema Night (Escuro) - PADRÃO
 * 
 * Inspirado no design do SKY+ (skytvmais.com.br):
 * - Fundo quase preto (#0D0D0D)
 * - Cards cinza escuro (#1A1A1E) com borda sutil (#2A2A2E)
 * - CTAs vermelho vibrante (#E30613)
 * - Texto branco para alta legibilidade
 */
const nightColors: ThemeColors = {
  primary: '#E30613',
  secondary: '#00205B',
  accent: '#E30613',
  background: '#0D0D0D',
  surface: '#1A1A1E',
  surfaceElevated: '#242428',
  textPrimary: '#FFFFFF',
  textSecondary: '#9E9EA7',
  textOnPrimary: '#FFFFFF',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  border: '#2A2A2E',
  divider: '#1F1F23',
  disabled: '#3A3A3E',
  textDisabled: '#5A5A5E',
  badgeBackground: '#2A1215',
  overlay: 'rgba(0, 0, 0, 0.7)',
  inputBackground: '#141418',
  inputPlaceholder: '#5A5A5E',
  tabBar: '#111114',
  tabBarBorder: '#1F1F23',
  statusBarStyle: 'light',
};

/**
 * Tema Day (Claro)
 * 
 * Versão clara mantendo identidade SKY:
 * - Fundo cinza muito claro (#F5F6FA)
 * - Cards brancos com borda sutil
 * - Mesmos acentos de cor (vermelho SKY)
 */
const dayColors: ThemeColors = {
  primary: '#E30613',
  secondary: '#00205B',
  accent: '#E30613',
  background: '#F5F6FA',
  surface: '#FFFFFF',
  surfaceElevated: '#F0F1F5',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  textOnPrimary: '#FFFFFF',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  border: '#E5E7EB',
  divider: '#F0F0F0',
  disabled: '#D1D5DB',
  textDisabled: '#9CA3AF',
  badgeBackground: '#FEF2F2',
  overlay: 'rgba(0, 0, 0, 0.5)',
  inputBackground: '#F5F6FA',
  inputPlaceholder: '#9CA3AF',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E5E7EB',
  statusBarStyle: 'dark',
};

/** Mapa de temas */
const themes: Record<ThemeMode, ThemeColors> = {
  night: nightColors,
  day: dayColors,
};

// ─── Estado global do tema (singleton) ───────────────────

/** Tema ativo atual - usado pelo proxy de cores */
let _activeTheme: ThemeMode = 'night';

/** Listeners para mudança de tema (force re-render) */
let _themeListeners: Array<() => void> = [];

/** Retorna as cores do tema ativo */
function getActiveColors(): ThemeColors {
  return themes[_activeTheme];
}

/**
 * Proxy reativo de cores
 * 
 * Permite que todas as telas continuem usando:
 *   import { colors } from '../lib/theme';
 *   colors.primary // retorna cor do tema ativo
 * 
 * Sem precisar mudar nenhuma importação existente.
 */
export const colors: ThemeColors = new Proxy({} as ThemeColors, {
  get(_target, prop: string) {
    return getActiveColors()[prop as keyof ThemeColors];
  },
});

// ─── Espaçamentos ────────────────────────────────────────

/** Espaçamentos padronizados (independente de tema) */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// ─── Raios de borda ──────────────────────────────────────

/** Raios de borda */
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

// ─── Tipografia ──────────────────────────────────────────

/**
 * Tipografia padrão do app
 * 
 * NOTA: Usa getter dinâmico para incluir color baseado no tema ativo.
 * Ao usar ...typography.h1, o color já vem incluso automaticamente.
 * Para sobrescrever, basta adicionar color: após o spread.
 * 
 * @example
 *   title: { ...typography.h1 }, // já inclui color: colors.textPrimary
 *   subtitle: { ...typography.bodySmall, color: colors.textSecondary }, // override
 */
const _typographyBase = {
  /** Display grande - hero sections */
  display: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  /** Heading 1 - títulos principais */
  h1: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32 },
  /** Heading 2 - subtítulos */
  h2: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  /** Heading 3 - seções */
  h3: { fontSize: 17, fontWeight: '600' as const, lineHeight: 24 },
  /** Body - texto padrão */
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  /** Body small - texto auxiliar */
  bodySmall: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  /** Caption - legendas e labels pequenos */
  caption: { fontSize: 11, fontWeight: '400' as const, lineHeight: 16 },
  /** Action - botões e links */
  action: { fontSize: 15, fontWeight: '600' as const, lineHeight: 22 },
};

/**
 * Proxy que injeta color dinâmico em cada estilo de tipografia.
 * h1, h2, h3, body, display, action -> textPrimary
 * bodySmall, caption -> textSecondary
 */
const _secondaryTypo = new Set(['bodySmall', 'caption']);
/** action type usa accent (vermelho) para links e botões */
const _accentTypo = new Set(['action']);

export const typography = new Proxy(_typographyBase, {
  get(target, prop: string) {
    const base = target[prop as keyof typeof _typographyBase];
    if (!base) return base;
    let textColor: string;
    if (_accentTypo.has(prop)) {
      textColor = colors.accent;
    } else if (_secondaryTypo.has(prop)) {
      textColor = colors.textSecondary;
    } else {
      textColor = colors.textPrimary;
    }
    return { ...base, color: textColor };
  },
}) as typeof _typographyBase;

// ─── Sombras ─────────────────────────────────────────────

/**
 * Sombras para cards e elevações
 * 
 * No tema Night, sombras são mais sutis (opacidade menor)
 * pois o fundo já é escuro.
 */
export const shadows = {
  /** Sombra suave para cards */
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  /** Sombra para elementos elevados (modais, bottom sheets) */
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  /** Sombra mínima para separação sutil */
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
};

// ─── Context / Provider / Hook ───────────────────────────

/** Tipo do contexto de tema */
interface ThemeContextType {
  /** Modo de tema atual */
  mode: ThemeMode;
  /** Alterna entre night e day */
  toggleTheme: () => void;
  /** Define o tema diretamente */
  setTheme: (mode: ThemeMode) => void;
  /** Se está no modo escuro */
  isDark: boolean;
}

/** Context React para o tema */
const ThemeContext = createContext<ThemeContextType>({
  mode: 'night',
  toggleTheme: () => {},
  setTheme: () => {},
  isDark: true,
});

/**
 * ThemeProvider - Provedor de tema para o app
 * 
 * Envolve o app e gerencia o estado de tema.
 * Deve ser colocado no App.tsx envolvendo NavigationContainer.
 * 
 * @example
 * <ThemeProvider>
 *   <NavigationContainer>
 *     <RootStack />
 *   </NavigationContainer>
 * </ThemeProvider>
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('night');

  /** Atualiza o tema e o singleton global */
  const setTheme = useCallback((newMode: ThemeMode) => {
    _activeTheme = newMode;
    setModeState(newMode);
  }, []);

  /** Alterna entre night e day */
  const toggleTheme = useCallback(() => {
    const newMode = _activeTheme === 'night' ? 'day' : 'night';
    setTheme(newMode);
  }, [setTheme]);

  const value = useMemo(() => ({
    mode,
    toggleTheme,
    setTheme,
    isDark: mode === 'night',
  }), [mode, toggleTheme, setTheme]);

  return React.createElement(ThemeContext.Provider, { value }, children);
}

/**
 * useThemeMode - Hook para acessar e controlar o tema
 * 
 * @returns {ThemeContextType} Objeto com mode, toggleTheme, setTheme, isDark
 * 
 * @example
 * const { isDark, toggleTheme } = useThemeMode();
 * // isDark ? 'Modo escuro' : 'Modo claro'
 * // toggleTheme() para alternar
 */
export function useThemeMode(): ThemeContextType {
  return useContext(ThemeContext);
}