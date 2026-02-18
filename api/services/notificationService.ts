/**
 * NotificationService - Serviço de Notificações
 * 
 * Gerencia listagem e leitura de notificações.
 * 
 * INTEGRAÇÃO FUTURA:
 * - GET /api/v1/customers/{id}/notifications
 * - PUT /api/v1/customers/{id}/notifications/{notifId}/read
 * 
 * @module api/services/notificationService
 */

import { USE_MOCK } from '../client';
import { Notification } from '../types/notification';
import { mockNotifications, simulateDelay } from '../../mocks/mockApiResponses';

/**
 * Busca lista de notificações do cliente
 * ENDPOINT REAL: GET /api/v1/customers/{customerId}/notifications
 */
export async function getNotifications(customerId: string): Promise<Notification[]> {
  if (USE_MOCK) {
    await simulateDelay();
    return mockNotifications;
  }
  throw { code: 'NOT_IMPLEMENTED', message: 'API real não configurada.' };
}

/**
 * Marca notificação como lida
 * ENDPOINT REAL: PUT /api/v1/customers/{id}/notifications/{notifId}/read
 */
export async function markNotificationAsRead(
  customerId: string,
  notificationId: string
): Promise<void> {
  if (USE_MOCK) {
    await simulateDelay(300);
    return;
  }
  throw { code: 'NOT_IMPLEMENTED', message: 'API real não configurada.' };
}