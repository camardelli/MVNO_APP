/**
 * Tipos de Autenticação SKY Móvel
 * 
 * Define os contratos de API para login, logout e gestão de tokens.
 * 
 * INTEGRAÇÃO FUTURA:
 * - Endpoint real: POST /api/v1/auth/login
 * - Autenticação via JWT com refresh token
 * - Integração com sistema de autenticação do Core SKY
 * 
 * @module api/types/auth
 */

import { ProfileType } from './customer';

/** Request de login */
export interface LoginRequest {
  cpf: string;
  password: string;
  deviceId: string;
}

/** Response de login com tokens e dados básicos do cliente */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  customer: {
    id: string;
    name: string;
    profileType: ProfileType;
  };
}

/** Request de refresh do token */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/** Response do refresh de token */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}