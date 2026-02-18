/**
 * BillingService - Serviço de Faturamento
 * 
 * Gerencia faturas, pagamentos e configurações de billing.
 * 
 * INTEGRAÇÃO FUTURA:
 * - GET /api/v1/customers/{id}/invoices
 * - PUT /api/v1/customers/{id}/billing/due-date
 * - PUT /api/v1/customers/{id}/billing/payment-method
 * 
 * @module api/services/billingService
 */

import { USE_MOCK } from '../client';
import {
  Invoice,
  ChangeDueDateRequest,
  ChangePaymentMethodRequest,
  BillingOperationResponse,
} from '../types/billing';
import { mockInvoices, simulateDelay } from '../../mocks/mockApiResponses';

/**
 * Busca lista de faturas do cliente
 * ENDPOINT REAL: GET /api/v1/customers/{customerId}/invoices
 */
export async function getInvoices(customerId: string): Promise<Invoice[]> {
  if (USE_MOCK) {
    await simulateDelay();
    return mockInvoices;
  }
  throw { code: 'NOT_IMPLEMENTED', message: 'API real não configurada.' };
}

/**
 * Altera dia de vencimento das faturas
 * ENDPOINT REAL: PUT /api/v1/customers/{customerId}/billing/due-date
 */
export async function changeDueDate(
  customerId: string,
  request: ChangeDueDateRequest
): Promise<BillingOperationResponse> {
  if (USE_MOCK) {
    await simulateDelay();
    return {
      success: true,
      message: `Vencimento alterado para dia ${request.newDueDay} com sucesso!`,
    };
  }
  throw { code: 'NOT_IMPLEMENTED', message: 'API real não configurada.' };
}

/**
 * Altera forma de pagamento
 * ENDPOINT REAL: PUT /api/v1/customers/{customerId}/billing/payment-method
 */
export async function changePaymentMethod(
  customerId: string,
  request: ChangePaymentMethodRequest
): Promise<BillingOperationResponse> {
  if (USE_MOCK) {
    await simulateDelay();
    return {
      success: true,
      message: 'Forma de pagamento alterada com sucesso!',
    };
  }
  throw { code: 'NOT_IMPLEMENTED', message: 'API real não configurada.' };
}