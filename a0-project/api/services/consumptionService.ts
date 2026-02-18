/**
 * ConsumptionService - Serviço de Consumo
 * 
 * Consulta dados de consumo de dados, SMS e voz.
 * 
 * INTEGRAÇÃO FUTURA:
 * - GET /api/v1/customers/{id}/consumption
 * - Cache recomendado: 5 minutos
 * - Considerar polling periódico para atualização
 * 
 * @module api/services/consumptionService
 */

import { USE_MOCK } from '../client';
import { ConsumptionResponse } from '../types/consumption';
import { mockConsumption, simulateDelay } from '../../mocks/mockApiResponses';

/**
 * Busca dados de consumo do cliente
 * 
 * @param customerId - ID do cliente
 * @returns Dados de consumo (dados, SMS, voz) e info do ciclo
 * 
 * ENDPOINT REAL: GET /api/v1/customers/{customerId}/consumption
 */
export async function getConsumption(customerId: string): Promise<ConsumptionResponse> {
  if (USE_MOCK) {
    await simulateDelay();
    return mockConsumption;
  }
  // TODO: Substituir pela chamada real
  throw { code: 'NOT_IMPLEMENTED', message: 'API real não configurada.' };
}