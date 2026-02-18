/**
 * PlanService - Serviço de Planos
 * 
 * Consulta plano atual, planos disponíveis, troca de plano e pacotes extras.
 * 
 * INTEGRAÇÃO FUTURA:
 * - GET /api/v1/customers/{id}/plan
 * - GET /api/v1/plans/available
 * - POST /api/v1/customers/{id}/plan/change
 * - GET /api/v1/data-packages/available
 * - POST /api/v1/customers/{id}/data-packages/purchase
 * 
 * @module api/services/planService
 */

import { USE_MOCK } from '../client';
import {
  CustomerPlan,
  AvailablePlan,
  ChangePlanRequest,
  ChangePlanResponse,
  DataPackage,
  PurchaseDataPackageRequest,
  PurchaseResponse,
} from '../types/plan';
import {
  mockCurrentPlan,
  mockAvailablePlans,
  mockDataPackages,
  simulateDelay,
} from '../../mocks/mockApiResponses';

/**
 * Busca plano atual do cliente
 * ENDPOINT REAL: GET /api/v1/customers/{customerId}/plan
 */
export async function getCurrentPlan(customerId: string): Promise<CustomerPlan> {
  if (USE_MOCK) {
    await simulateDelay();
    return mockCurrentPlan;
  }
  throw { code: 'NOT_IMPLEMENTED', message: 'API real não configurada.' };
}

/**
 * Busca planos disponíveis para troca
 * ENDPOINT REAL: GET /api/v1/plans/available
 */
export async function getAvailablePlans(): Promise<AvailablePlan[]> {
  if (USE_MOCK) {
    await simulateDelay();
    return mockAvailablePlans;
  }
  throw { code: 'NOT_IMPLEMENTED', message: 'API real não configurada.' };
}

/**
 * Solicita troca de plano
 * ENDPOINT REAL: POST /api/v1/customers/{customerId}/plan/change
 */
export async function changePlan(
  customerId: string,
  request: ChangePlanRequest
): Promise<ChangePlanResponse> {
  if (USE_MOCK) {
    await simulateDelay(1200);
    return {
      requestId: `req-${Date.now()}`,
      status: 'COMPLETED',
      message: 'Plano alterado com sucesso! As mudanças serão aplicadas no próximo ciclo.',
    };
  }
  throw { code: 'NOT_IMPLEMENTED', message: 'API real não configurada.' };
}

/**
 * Busca pacotes de dados extras disponíveis
 * ENDPOINT REAL: GET /api/v1/data-packages/available
 */
export async function getDataPackages(): Promise<DataPackage[]> {
  if (USE_MOCK) {
    await simulateDelay();
    return mockDataPackages;
  }
  throw { code: 'NOT_IMPLEMENTED', message: 'API real não configurada.' };
}

/**
 * Compra pacote de dados extra
 * ENDPOINT REAL: POST /api/v1/customers/{customerId}/data-packages/purchase
 */
export async function purchaseDataPackage(
  customerId: string,
  request: PurchaseDataPackageRequest
): Promise<PurchaseResponse> {
  if (USE_MOCK) {
    await simulateDelay(1500);
    return {
      transactionId: `txn-${Date.now()}`,
      status: 'SUCCESS',
      newDataBalance: 20,
      message: 'Pacote de dados adicionado com sucesso!',
    };
  }
  throw { code: 'NOT_IMPLEMENTED', message: 'API real não configurada.' };
}