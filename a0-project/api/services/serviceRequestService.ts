/**
 * ServiceRequestService - Serviço de Solicitações
 * 
 * Gerencia portabilidade, troca de chip, bloqueio, desbloqueio e cancelamento.
 * 
 * INTEGRAÇÃO FUTURA:
 * - POST /api/v1/service-requests
 * - GET /api/v1/customers/{id}/service-requests
 * - POST /api/v1/activation/validate-chip
 * - POST /api/v1/activation/activate
 * 
 * @module api/services/serviceRequestService
 */

import { USE_MOCK } from '../client';
import {
  ServiceRequest,
  ServiceRequestResponse,
  ServiceRequestHistory,
  ValidateChipRequest,
  ValidateChipResponse,
  ActivateChipRequest,
  ActivateChipResponse,
} from '../types/services';
import { mockServiceRequests, simulateDelay } from '../../mocks/mockApiResponses';

/**
 * Cria nova solicitação de serviço
 * ENDPOINT REAL: POST /api/v1/service-requests
 */
export async function createServiceRequest(
  request: ServiceRequest
): Promise<ServiceRequestResponse> {
  if (USE_MOCK) {
    await simulateDelay(1200);
    return {
      requestId: `sr-${Date.now()}`,
      protocol: `SKY${new Date().getFullYear()}${String(Date.now()).slice(-6)}`,
      status: 'PENDING',
      estimatedCompletion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      message: 'Solicitação registrada com sucesso!',
    };
  }
  throw { code: 'NOT_IMPLEMENTED', message: 'API real não configurada.' };
}

/**
 * Busca histórico de solicitações do cliente
 * ENDPOINT REAL: GET /api/v1/customers/{customerId}/service-requests
 */
export async function getServiceRequestHistory(
  customerId: string
): Promise<ServiceRequestHistory> {
  if (USE_MOCK) {
    await simulateDelay();
    return { requests: mockServiceRequests };
  }
  throw { code: 'NOT_IMPLEMENTED', message: 'API real não configurada.' };
}

/**
 * Valida ICCID de chip para ativação
 * ENDPOINT REAL: POST /api/v1/activation/validate-chip
 */
export async function validateChip(
  request: ValidateChipRequest
): Promise<ValidateChipResponse> {
  if (USE_MOCK) {
    await simulateDelay();
    if (request.iccid.length === 20 && request.iccid.startsWith('8955')) {
      return { valid: true, chipStatus: 'NEW' };
    }
    return { valid: false, chipStatus: 'INVALID', errorMessage: 'ICCID inválido.' };
  }
  throw { code: 'NOT_IMPLEMENTED', message: 'API real não configurada.' };
}

/**
 * Ativa chip com plano selecionado
 * ENDPOINT REAL: POST /api/v1/activation/activate
 */
export async function activateChip(
  request: ActivateChipRequest
): Promise<ActivateChipResponse> {
  if (USE_MOCK) {
    await simulateDelay(2000);
    return {
      success: true,
      msisdn: '11999990002',
      activationDate: new Date().toISOString(),
      message: 'Chip ativado com sucesso! Sua nova linha está pronta para uso.',
    };
  }
  throw { code: 'NOT_IMPLEMENTED', message: 'API real não configurada.' };
}