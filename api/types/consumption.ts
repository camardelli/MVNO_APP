/**
 * Tipos de Consumo SKY Móvel
 * 
 * Define os contratos de API para dados de consumo (dados, SMS, voz).
 * 
 * INTEGRAÇÃO FUTURA:
 * - Endpoint real: GET /api/v1/customers/{id}/consumption
 * - Dados atualizados em tempo real via polling ou push
 * - Considerar cache de 5 minutos
 * 
 * @module api/types/consumption
 */

/** Consumo de dados móveis */
export interface DataConsumption {
  usedBytes: number;
  totalBytes: number;
  usedGB: number;
  totalGB: number;
  percentUsed: number;
}

/** Consumo de SMS */
export interface SmsConsumption {
  used: number;
  total: number;
}

/** Consumo de voz */
export interface VoiceConsumption {
  usedMinutes: number;
  /** null = ilimitado */
  totalMinutes: number | null;
}

/** Response completa de consumo */
export interface ConsumptionResponse {
  data: DataConsumption;
  sms: SmsConsumption;
  voice: VoiceConsumption;
  /** Data de fim do ciclo (ISO date) */
  cycleEndDate: string;
  /** Dias restantes até renovação */
  daysRemaining: number;
}