/**
 * Tipos de Plano SKY Móvel
 * 
 * Define os contratos de API para planos móveis.
 * 
 * INTEGRAÇÃO FUTURA:
 * - GET /api/v1/customers/{id}/plan - Plano atual
 * - GET /api/v1/plans/available - Planos disponíveis
 * - POST /api/v1/customers/{id}/plan/change - Troca de plano
 * 
 * @module api/types/plan
 */

/** Plano atual do cliente */
export interface CustomerPlan {
  id: string;
  name: string;
  dataGB: number;
  smsQuantity: number;
  /** null = ilimitado */
  voiceMinutes: number | null;
  /** Apps com dados gratuitos */
  includedApps: string[];
  monthlyPrice: number;
  /** Data de renovação do plano */
  renewalDate: string;
}

/** Plano disponível para contratação */
export interface AvailablePlan {
  id: string;
  name: string;
  dataGB: number;
  smsQuantity: number;
  voiceMinutes: number | null;
  includedApps: string[];
  monthlyPrice: number;
  /** Destaque do plano (ex: "Mais vendido") */
  highlight?: string;
}

/** Request de troca de plano */
export interface ChangePlanRequest {
  newPlanId: string;
  /** null = imediato */
  effectiveDate?: string;
}

/** Response de troca de plano */
export interface ChangePlanResponse {
  requestId: string;
  status: 'PROCESSING' | 'PENDING_APPROVAL' | 'COMPLETED';
  message: string;
}

/** Pacote de dados adicional */
export interface DataPackage {
  id: string;
  dataGB: number;
  price: number;
  validityDays: number;
  description?: string;
}

/** Request de compra de pacote de dados */
export interface PurchaseDataPackageRequest {
  packageId: string;
  paymentMethod: 'CREDIT_CARD' | 'BALANCE' | 'ADD_TO_INVOICE';
  cardToken?: string;
}

/** Response de compra de pacote */
export interface PurchaseResponse {
  transactionId: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  newDataBalance?: number;
  message: string;
}