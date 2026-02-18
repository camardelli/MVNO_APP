/**
 * Endpoints da API SKY Móvel
 * 
 * Centraliza todas as URLs de endpoint em um único arquivo.
 * Facilita a manutenção e alteração de rotas.
 * 
 * INTEGRAÇÃO FUTURA:
 * - Atualizar os caminhos conforme documentação real da API SKY
 * - Considerar versionamento de API (/v1, /v2)
 * 
 * @module api/endpoints
 */

/** Endpoints de autenticação */
export const AUTH = {
  LOGIN: '/auth/login',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
} as const;

/** Endpoints de cliente */
export const CUSTOMER = {
  PROFILE: (customerId: string) => `/customers/${customerId}/profile`,
  UPDATE_PROFILE: (customerId: string) => `/customers/${customerId}/profile`,
} as const;

/** Endpoints de consumo */
export const CONSUMPTION = {
  GET: (customerId: string) => `/customers/${customerId}/consumption`,
} as const;

/** Endpoints de plano */
export const PLAN = {
  CURRENT: (customerId: string) => `/customers/${customerId}/plan`,
  AVAILABLE: '/plans/available',
  CHANGE: (customerId: string) => `/customers/${customerId}/plan/change`,
} as const;

/** Endpoints de faturamento */
export const BILLING = {
  INVOICES: (customerId: string) => `/customers/${customerId}/invoices`,
  CHANGE_DUE_DATE: (customerId: string) => `/customers/${customerId}/billing/due-date`,
  CHANGE_PAYMENT_METHOD: (customerId: string) => `/customers/${customerId}/billing/payment-method`,
} as const;

/** Endpoints de pacotes de dados */
export const DATA_PACKAGES = {
  AVAILABLE: '/data-packages/available',
  PURCHASE: (customerId: string) => `/customers/${customerId}/data-packages/purchase`,
} as const;

/** Endpoints de serviços */
export const SERVICES = {
  CREATE_REQUEST: '/service-requests',
  HISTORY: (customerId: string) => `/customers/${customerId}/service-requests`,
  VALIDATE_CHIP: '/activation/validate-chip',
  ACTIVATE_CHIP: '/activation/activate',
} as const;

/** Endpoints de notificações */
export const NOTIFICATIONS = {
  LIST: (customerId: string) => `/customers/${customerId}/notifications`,
  MARK_READ: (customerId: string, notificationId: string) =>
    `/customers/${customerId}/notifications/${notificationId}/read`,
} as const;