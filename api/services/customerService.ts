/**
 * CustomerService - Serviço de Cliente
 * 
 * Operações relacionadas ao perfil do cliente.
 * 
 * INTEGRAÇÃO FUTURA:
 * - GET /api/v1/customers/{id}/profile - Buscar perfil
 * - PUT /api/v1/customers/{id}/profile - Atualizar perfil
 * - Autenticação: Bearer token JWT
 * 
 * @module api/services/customerService
 */

import { USE_MOCK } from '../client';
import {
  CustomerProfile,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from '../types/customer';
import { mockCustomerProfile, simulateDelay } from '../../mocks/mockApiResponses';

/**
 * Busca dados do perfil do cliente
 * 
 * @param customerId - ID único do cliente no sistema SKY
 * @returns Dados completos do cliente incluindo linhas móveis
 * 
 * ENDPOINT REAL: GET /api/v1/customers/{customerId}/profile
 */
export async function getCustomerProfile(customerId: string): Promise<CustomerProfile> {
  if (USE_MOCK) {
    await simulateDelay();
    return mockCustomerProfile;
  }
  // TODO: Substituir pela chamada real
  throw { code: 'NOT_IMPLEMENTED', message: 'API real não configurada.' };
}

/**
 * Atualiza dados do perfil do cliente
 * 
 * @param customerId - ID do cliente
 * @param data - Campos a serem atualizados (parcial)
 * @returns Confirmação da atualização
 * 
 * ENDPOINT REAL: PUT /api/v1/customers/{customerId}/profile
 */
export async function updateCustomerProfile(
  customerId: string,
  data: UpdateProfileRequest
): Promise<UpdateProfileResponse> {
  if (USE_MOCK) {
    await simulateDelay();
    return { success: true, message: 'Perfil atualizado com sucesso!' };
  }
  // TODO: Substituir pela chamada real
  throw { code: 'NOT_IMPLEMENTED', message: 'API real não configurada.' };
}