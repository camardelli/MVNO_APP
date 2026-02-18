/**
 * AuthService - Serviço de Autenticação
 * 
 * Gerencia login, logout e refresh de tokens.
 * 
 * INTEGRAÇÃO FUTURA:
 * - Endpoint base: [A DEFINIR PELO TIME SKY]
 * - Autenticação: POST com CPF + senha, retorna JWT
 * - Refresh: POST com refresh token
 * 
 * @module api/services/authService
 */

import { USE_MOCK } from '../client';
import { LoginRequest, LoginResponse } from '../types/auth';
import { mockLoginResponse, simulateDelay } from '../../mocks/mockApiResponses';

/**
 * Realiza login do cliente
 * 
 * @param credentials - CPF, senha e ID do dispositivo
 * @returns Tokens de acesso e dados básicos do cliente
 * 
 * ENDPOINT REAL: POST /api/v1/auth/login
 * BODY: { cpf, password, deviceId }
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  if (USE_MOCK) {
    await simulateDelay();
    /** Simula validação de CPF/senha. CPF mock: 12345678900 */
    const cleanCpf = credentials.cpf.replace(/\D/g, '');
    if (cleanCpf === '12345678900' && credentials.password.length >= 4) {
      return mockLoginResponse;
    }
    throw { code: 'AUTH_INVALID', message: 'CPF ou senha inválidos.' };
  }

  // TODO: Implementar chamada real
  // const response = await apiClient<LoginResponse>(AUTH.LOGIN, {
  //   method: 'POST',
  //   body: JSON.stringify(credentials),
  // });
  // return response;
  throw { code: 'NOT_IMPLEMENTED', message: 'API real não configurada.' };
}

/**
 * Realiza logout do cliente
 * 
 * ENDPOINT REAL: POST /api/v1/auth/logout
 * HEADERS: Authorization: Bearer {token}
 */
export async function logout(): Promise<void> {
  if (USE_MOCK) {
    await simulateDelay(300);
    return;
  }
  // TODO: Invalidar tokens no backend
}