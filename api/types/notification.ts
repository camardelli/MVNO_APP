/**
 * Tipos de Notificações SKY Móvel
 * 
 * @module api/types/notification
 */

/** Tipos de notificação */
export type NotificationType =
  | 'INVOICE'
  | 'CONSUMPTION_ALERT'
  | 'SERVICE_COMPLETED'
  | 'PROMOTION'
  | 'ACTIVATION';

/** Notificação do cliente */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}