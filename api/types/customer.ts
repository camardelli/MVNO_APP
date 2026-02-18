/**
 * Tipos de dados do Cliente SKY Móvel
 * 
 * Define os contratos de API para operações de perfil do cliente.
 * Esses tipos refletem a estrutura esperada das respostas do Core SKY.
 * 
 * INTEGRAÇÃO FUTURA:
 * - Os campos devem ser mapeados para os campos reais da API do Core SKY
 * - Possíveis transformações de nomes de campos (camelCase <-> snake_case)
 * 
 * @module api/types/customer
 */

/** Tipos de perfil do cliente SKY */
export type ProfileType = 'SKY_MOVEL_SOLO' | 'SKY_MOVEL_COMBO';

/** Status possíveis de uma linha móvel */
export type LineStatus = 'ACTIVE' | 'SUSPENDED' | 'BLOCKED' | 'CANCELLED';

/** Endereço do cliente */
export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

/** Dados de uma linha móvel */
export interface MobileLine {
  /** Número do telefone (MSISDN) */
  msisdn: string;
  /** Identificador do chip (ICCID) */
  iccid: string;
  /** Identificador do assinante (IMSI) */
  imsi: string;
  /** Status atual da linha */
  status: LineStatus;
  /** Data de ativação da linha */
  activationDate: string;
}

/** Perfil completo do cliente */
export interface CustomerProfile {
  id: string;
  fullName: string;
  cpf: string;
  email: string;
  phone: string;
  address: Address;
  mobileLines: MobileLine[];
  profileType: ProfileType;
}

/** Request para atualização de perfil */
export interface UpdateProfileRequest {
  email?: string;
  phone?: string;
  address?: Partial<Address>;
}

/** Response de atualização de perfil */
export interface UpdateProfileResponse {
  success: boolean;
  message: string;
}