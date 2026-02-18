/**
 * Tipos de Solicitações de Serviço SKY Móvel
 * 
 * Define os contratos de API para Central de Serviços.
 * Inclui: Portabilidade, Troca de Chip, Bloqueio, Desbloqueio, Cancelamento.
 * 
 * INTEGRAÇÃO FUTURA:
 * - POST /api/v1/service-requests - Criar solicitação
 * - GET /api/v1/customers/{id}/service-requests - Histórico
 * 
 * @module api/types/services
 */

import { Address } from './customer';

/** Tipos de solicitação de serviço */
export type ServiceRequestType =
  | 'PORTABILITY'
  | 'CHIP_SWAP'
  | 'BLOCK'
  | 'UNBLOCK'
  | 'CANCELLATION';

/** Status de uma solicitação */
export type ServiceRequestStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

/** Detalhes de portabilidade */
export interface PortabilityDetails {
  numberToPort: string;
  currentOperator: string;
  desiredDate: string;
}

/** Motivos de troca de chip */
export type ChipSwapReason = 'LOST' | 'STOLEN' | 'DEFECTIVE' | 'ESIM_UPGRADE';

/** Tipo de chip */
export type ChipType = 'PHYSICAL' | 'ESIM';

/** Detalhes de troca de chip */
export interface ChipSwapDetails {
  reason: ChipSwapReason;
  chipType: ChipType;
  deliveryAddress?: Address;
}

/** Detalhes de bloqueio */
export interface BlockDetails {
  reason?: string;
}

/** Detalhes de cancelamento */
export interface CancellationDetails {
  reason: string;
  feedback?: string;
}

/** Request de criação de solicitação de serviço */
export interface ServiceRequest {
  type: ServiceRequestType;
  customerId: string;
  lineId: string;
  details: PortabilityDetails | ChipSwapDetails | BlockDetails | CancellationDetails;
}

/** Response de criação de solicitação */
export interface ServiceRequestResponse {
  requestId: string;
  protocol: string;
  status: ServiceRequestStatus;
  estimatedCompletion?: string;
  message: string;
}

/** Item do histórico de solicitações */
export interface ServiceRequestHistoryItem {
  id: string;
  protocol: string;
  type: ServiceRequestType;
  status: ServiceRequestStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  description: string;
}

/** Response do histórico de solicitações */
export interface ServiceRequestHistory {
  requests: ServiceRequestHistoryItem[];
}

/** Request de validação de chip (ativação) */
export interface ValidateChipRequest {
  iccid: string;
}

/** Response de validação de chip */
export interface ValidateChipResponse {
  valid: boolean;
  chipStatus: 'NEW' | 'ALREADY_ACTIVE' | 'INVALID';
  errorMessage?: string;
}

/** Request de ativação de chip */
export interface ActivateChipRequest {
  iccid: string;
  customerId: string;
  planId: string;
  acceptedTermsVersion: string;
}

/** Response de ativação de chip */
export interface ActivateChipResponse {
  success: boolean;
  msisdn: string;
  activationDate: string;
  message: string;
}