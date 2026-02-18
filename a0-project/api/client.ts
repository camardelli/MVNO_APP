/**
 * Cliente HTTP Base - SKY Móvel
 * 
 * Camada de abstração para chamadas HTTP. Centraliza:
 * - Configuração de headers (Authorization, Content-Type)
 * - Interceptor de erros
 * - Refresh automático de token
 * - Logging de requests/responses para debugging
 * 
 * INTEGRAÇÃO FUTURA:
 * - Substituir BASE_URL pela URL real do gateway SKY
 * - Configurar certificado SSL pinning se necessário
 * - Adicionar interceptors de telemetria/analytics
 * 
 * @module api/client
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/** Erro padronizado de API */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string>;
}

/**
 * URL base da API. 
 * TODO: Substituir pela URL real do gateway SKY em produção.
 */
const BASE_URL = 'https://api.skymovel.com.br/api/v1';

/**
 * Flag global para alternar entre mock e API real.
 * Quando true, os serviços retornam dados mock.
 * Quando false, as chamadas HTTP reais são feitas.
 */
export const USE_MOCK = true;

/**
 * Realiza uma chamada HTTP autenticada
 * 
 * @param endpoint - Caminho do endpoint (ex: "/customers/123/profile")
 * @param options - Opções do fetch (method, body, headers extras)
 * @returns Promise com os dados parseados do JSON
 * @throws ApiError em caso de erro da API
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  /** Recupera o token de acesso do storage seguro */
  const token = await AsyncStorage.getItem('accessToken');

  /** Monta os headers padrão */
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    /** Verifica se o response é um erro */
    if (!response.ok) {
      /** Se 401, tenta refresh do token */
      if (response.status === 401) {
        // TODO: Implementar refresh automático de token
        throw { code: 'AUTH_EXPIRED', message: 'Sessão expirada. Faça login novamente.' };
      }

      const errorData = await response.json().catch(() => ({}));
      throw {
        code: errorData.code || `HTTP_${response.status}`,
        message: errorData.message || 'Erro ao comunicar com o servidor.',
        details: errorData.details,
      } as ApiError;
    }

    return await response.json();
  } catch (error) {
    /** Se já é um ApiError, repassa */
    if ((error as ApiError).code) {
      throw error;
    }

    /** Erro de rede */
    throw {
      code: 'NETWORK_ERROR',
      message: 'Sem conexão com a internet. Verifique sua conexão e tente novamente.',
    } as ApiError;
  }
}