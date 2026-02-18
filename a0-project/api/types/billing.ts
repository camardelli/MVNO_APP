/**
 * Tipos de Faturamento SKY Móvel
 * 
 * Define os contratos de API para faturas e pagamentos.
 * 
 * INTEGRAÇÃO FUTURA:
 * - GET /api/v1/customers/{id}/invoices - Lista de faturas
 * - PUT /api/v1/customers/{id}/billing/due-date - Alterar vencimento
 * - PUT /api/v1/customers/{id}/billing/payment-method - Alterar forma
 * 
 * @module api/types/billing
 */

/** Status possíveis de uma fatura */
export type InvoiceStatus = 'PAID' | 'PENDING' | 'OVERDUE';

/** Métodos de pagamento */
export type PaymentMethod = 'BOLETO' | 'CREDIT_CARD' | 'DEBIT_AUTO';

/** Fatura do cliente */
export interface Invoice {
  id: string;
  /** Mês de referência (formato: "YYYY-MM") */
  referenceMonth: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  pdfUrl: string;
  /** Código de barras do boleto */
  barcode?: string;
  /** Código Pix copia e cola */
  pixCode?: string;
}

/** Request para alterar dia de vencimento */
export interface ChangeDueDateRequest {
  /** Dia do mês (1-28) */
  newDueDay: number;
}

/** Request para alterar forma de pagamento */
export interface ChangePaymentMethodRequest {
  method: PaymentMethod;
  cardToken?: string;
}

/** Response genérica de operação de billing */
export interface BillingOperationResponse {
  success: boolean;
  message: string;
}