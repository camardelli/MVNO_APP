/**
 * Store Global - SKY Móvel (Zustand)
 * 
 * Estado global do aplicativo com persistência em AsyncStorage.
 * Gerencia autenticação, dados do cliente, consumo e notificações.
 * 
 * @module store/useAppStore
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CustomerProfile, ProfileType } from '../api/types/customer';
import { ConsumptionResponse } from '../api/types/consumption';
import { CustomerPlan } from '../api/types/plan';
import { Notification } from '../api/types/notification';
import { LoginRequest } from '../api/types/auth';
import * as authService from '../api/services/authService';
import * as customerService from '../api/services/customerService';
import * as consumptionService from '../api/services/consumptionService';
import * as planService from '../api/services/planService';
import * as notificationService from '../api/services/notificationService';

/** Interface do estado global do app */
interface AppState {
  /** Estado de autenticação */
  isAuthenticated: boolean;
  accessToken: string | null;
  customerId: string | null;
  customerName: string | null;
  profileType: ProfileType | null;
  isLoading: boolean;
  hasSeenOnboarding: boolean;
  error: string | null;

  /** Dados do cliente */
  customer: CustomerProfile | null;
  consumption: ConsumptionResponse | null;
  currentPlan: CustomerPlan | null;
  notifications: Notification[];
  unreadNotifications: number;
  isRefreshing: boolean;
  lastConsumptionUpdate: number | null;
  lastCustomerUpdate: number | null;

  /** Actions */
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  setOnboardingSeen: () => Promise<void>;
  loadCustomerData: () => Promise<void>;
  refreshConsumption: () => Promise<void>;
  refreshPlan: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  setRefreshing: (value: boolean) => void;
  clearError: () => void;
  setError: (error: string) => void;
  setLoading: (value: boolean) => void;
  setCustomer: (customer: CustomerProfile) => void;
  setConsumption: (consumption: ConsumptionResponse) => void;
  restoreSession: () => Promise<boolean>;
}

/**
 * Store Zustand principal.
 * Todas as actions de API estão centralizadas aqui para
 * facilitar gerenciamento de estado e tratamento de erros.
 */
export const useAppStore = create<AppState>((set, get) => ({
  /** Estado inicial */
  isAuthenticated: false,
  accessToken: null,
  customerId: null,
  customerName: null,
  profileType: null,
  isLoading: false,
  hasSeenOnboarding: false,
  error: null,
  customer: null,

  /** Dados carregados */
  consumption: null,
  currentPlan: null,
  notifications: [],
  unreadNotifications: 0,
  isRefreshing: false,
  lastConsumptionUpdate: null,
  lastCustomerUpdate: null,

  /**
   * Login do cliente
   * Autentica e salva tokens no AsyncStorage
   */
  login: async (credentials: LoginRequest) => {
    try {
      set({ isLoading: true, error: null });

      const response = await authService.login(credentials);

      await AsyncStorage.setItem('accessToken', response.accessToken);
      await AsyncStorage.setItem('refreshToken', response.refreshToken);
      await AsyncStorage.setItem('customerId', response.customer.id);

      set({
        isAuthenticated: true,
        accessToken: response.accessToken,
        customerId: response.customer.id,
        customerName: response.customer.name,
        profileType: response.customer.profileType,
        isLoading: false,
      });
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Erro ao fazer login' });
      throw error;
    }
  },

  /**
   * Logout do cliente
   * Limpa tokens e estado do app
   */
  logout: async () => {
    try {
      await authService.logout();
    } catch (_) {
      // Ignora erros de logout
    }

    await AsyncStorage.multiRemove([
      'accessToken',
      'refreshToken',
      'customerId',
    ]);

    set({
      isAuthenticated: false,
      accessToken: null,
      customerId: null,
      customerName: null,
      profileType: null,
      customer: null,
      consumption: null,
      currentPlan: null,
      notifications: [],
      unreadNotifications: 0,
    });
  },

  /**
   * Verifica se há sessão ativa salva
   */
  checkAuth: async () => {
    const token = await AsyncStorage.getItem('accessToken');
    const customerId = await AsyncStorage.getItem('customerId');
    const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');

    if (token && customerId) {
      set({
        isAuthenticated: true,
        accessToken: token,
        customerId,
        hasSeenOnboarding: hasSeenOnboarding === 'true',
      });
      return true;
    }

    set({ hasSeenOnboarding: hasSeenOnboarding === 'true' });
    return false;
  },

  /**
   * Marca onboarding como visto
   */
  setOnboardingSeen: async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    set({ hasSeenOnboarding: true });
  },

  /**
   * Carrega todos os dados do cliente (perfil, consumo, plano, notificações)
   */
  loadCustomerData: async () => {
    const { customerId } = get();
    if (!customerId) return;

    try {
      set({ isLoading: true });

      const [customer, consumption, plan, notifs] = await Promise.all([
        customerService.getCustomerProfile(customerId),
        consumptionService.getConsumption(customerId),
        planService.getCurrentPlan(customerId),
        notificationService.getNotifications(customerId),
      ]);

      set({
        customer,
        customerName: customer.fullName,
        profileType: customer.profileType,
        consumption,
        currentPlan: plan,
        notifications: notifs,
        unreadNotifications: notifs.filter((n: Notification) => !n.read).length,
        isLoading: false,
        lastConsumptionUpdate: Date.now(),
        lastCustomerUpdate: Date.now(),
      });
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Erro ao carregar dados' });
    }
  },

  /**
   * Atualiza dados de consumo
   */
  refreshConsumption: async () => {
    const { customerId } = get();
    if (!customerId) return;

    try {
      const consumption = await consumptionService.getConsumption(customerId);
      set({ consumption, lastConsumptionUpdate: Date.now() });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  /**
   * Atualiza dados do plano
   */
  refreshPlan: async () => {
    const { customerId } = get();
    if (!customerId) return;

    try {
      const plan = await planService.getCurrentPlan(customerId);
      set({ currentPlan: plan });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  /**
   * Atualiza notificações
   */
  refreshNotifications: async () => {
    const { customerId } = get();
    if (!customerId) return;

    try {
      const notifs = await notificationService.getNotifications(customerId);
      set({
        notifications: notifs,
        unreadNotifications: notifs.filter((n: Notification) => !n.read).length,
      });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  /**
   * Marca notificação como lida
   */
  markNotificationRead: async (notificationId: string) => {
    const { customerId } = get();
    if (!customerId) return;

    try {
      await notificationService.markNotificationAsRead(customerId, notificationId);

      set((state: AppState) => ({
        notifications: state.notifications.map((n: Notification) =>
          n.id === notificationId ? { ...n, read: true } : n
        ),
        unreadNotifications: Math.max(0, state.unreadNotifications - 1),
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  /** Helpers de estado */
  setRefreshing: (value: boolean) => set({ isRefreshing: value }),
  clearError: () => set({ error: null }),
  setError: (error: string) => set({ error }),
  setLoading: (value: boolean) => set({ isLoading: value }),
  setCustomer: (customer: CustomerProfile) => set({ customer }),
  setConsumption: (consumption: ConsumptionResponse) => set({ consumption }),

  /**
   * Restaura sessão salva (alias para checkAuth)
   * Utilizado pelo SplashScreen na inicialização
   */
  restoreSession: async () => {
    return get().checkAuth();
  },
}));