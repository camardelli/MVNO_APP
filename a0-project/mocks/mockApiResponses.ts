/**
 * Mock Data - SKY Móvel
 * 
 * Dados simulados que replicam as respostas reais da API do Core SKY.
 * Utilizados durante o desenvolvimento para evitar dependência do backend.
 * 
 * INTEGRAÇÃO FUTURA:
 * - Estes mocks devem ser substituídos por chamadas reais
 * - Manter este arquivo como referência de formato de dados
 * - Pode ser utilizado como fallback em ambiente de desenvolvimento
 * 
 * @module mocks/mockApiResponses
 */

import { LoginResponse } from '../api/types/auth';
import { CustomerProfile } from '../api/types/customer';
import { ConsumptionResponse } from '../api/types/consumption';
import { CustomerPlan, AvailablePlan, DataPackage } from '../api/types/plan';
import { Invoice } from '../api/types/billing';
import { ServiceRequestHistoryItem } from '../api/types/services';
import { Notification } from '../api/types/notification';

/** Delay simulado de rede (ms) */
export const MOCK_DELAY = 800;

/** Simula latência de rede para dar experiência realista */
export function simulateDelay(ms: number = MOCK_DELAY): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Mock de resposta de login */
export const mockLoginResponse: LoginResponse = {
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token',
  refreshToken: 'mock-refresh-token-12345',
  customer: {
    id: 'cust-001',
    name: 'Carlos Eduardo Silva',
    profileType: 'SKY_MOVEL_SOLO',
  },
};

/** Mock do perfil completo do cliente */
export const mockCustomerProfile: CustomerProfile = {
  id: 'cust-001',
  fullName: 'Carlos Eduardo Silva',
  cpf: '12345678900',
  email: 'carlos.silva@email.com',
  phone: '11987654321',
  address: {
    street: 'Rua das Flores',
    number: '123',
    complement: 'Apto 45',
    neighborhood: 'Jardim Paulista',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234567',
  },
  mobileLines: [
    {
      msisdn: '11999990001',
      iccid: '89550534000000000001',
      imsi: '724050000000001',
      status: 'ACTIVE',
      activationDate: '2026-01-15T10:00:00Z',
    },
  ],
  profileType: 'SKY_MOVEL_SOLO',
};

/** Mock de dados de consumo */
export const mockConsumption: ConsumptionResponse = {
  data: {
    usedBytes: 9126805504,
    totalBytes: 16106127360,
    usedGB: 8.5,
    totalGB: 15,
    percentUsed: 56.67,
  },
  sms: { used: 23, total: 100 },
  voice: { usedMinutes: 45, totalMinutes: null },
  cycleEndDate: '2026-02-15',
  daysRemaining: 7,
};

/** Mock do plano atual do cliente */
export const mockCurrentPlan: CustomerPlan = {
  id: 'plan-2',
  name: 'SKY Móvel 15GB',
  dataGB: 15,
  smsQuantity: 100,
  voiceMinutes: null,
  includedApps: ['WhatsApp', 'Instagram'],
  monthlyPrice: 49.90,
  renewalDate: '2026-02-15',
};

/** Mock de planos disponíveis para troca */
export const mockAvailablePlans: AvailablePlan[] = [
  {
    id: 'plan-1',
    name: 'SKY Móvel 8GB',
    dataGB: 8,
    smsQuantity: 50,
    voiceMinutes: null,
    includedApps: ['WhatsApp'],
    monthlyPrice: 34.90,
  },
  {
    id: 'plan-2',
    name: 'SKY Móvel 15GB',
    dataGB: 15,
    smsQuantity: 100,
    voiceMinutes: null,
    includedApps: ['WhatsApp', 'Instagram'],
    monthlyPrice: 49.90,
  },
  {
    id: 'plan-3',
    name: 'SKY Móvel 25GB',
    dataGB: 25,
    smsQuantity: 150,
    voiceMinutes: null,
    includedApps: ['WhatsApp', 'Instagram', 'Facebook'],
    monthlyPrice: 69.90,
    highlight: 'Mais vendido',
  },
  {
    id: 'plan-4',
    name: 'SKY Móvel 40GB',
    dataGB: 40,
    smsQuantity: 200,
    voiceMinutes: null,
    includedApps: ['WhatsApp', 'Instagram', 'Facebook', 'TikTok'],
    monthlyPrice: 89.90,
    highlight: 'Melhor custo-benefício',
  },
];

/** Mock de faturas */
export const mockInvoices: Invoice[] = [
  {
    id: 'inv-1',
    referenceMonth: '2026-01',
    amount: 49.90,
    dueDate: '2026-02-10',
    status: 'PENDING',
    pdfUrl: '/invoices/inv-1.pdf',
    barcode: '12345.67890 12345.678901 12345.678901 1 12340000004990',
    pixCode: '00020126580014BR.GOV.BCB.PIX0136a1b2c3d4-e5f6-7890-abcd-ef1234567890520400005303986540549.905802BR5925SKY SERVICOS DE BANDA LA6009SAO PAULO62070503***6304ABCD',
  },
  {
    id: 'inv-2',
    referenceMonth: '2025-12',
    amount: 49.90,
    dueDate: '2026-01-10',
    status: 'PAID',
    pdfUrl: '/invoices/inv-2.pdf',
  },
  {
    id: 'inv-3',
    referenceMonth: '2025-11',
    amount: 49.90,
    dueDate: '2025-12-10',
    status: 'PAID',
    pdfUrl: '/invoices/inv-3.pdf',
  },
  {
    id: 'inv-4',
    referenceMonth: '2025-10',
    amount: 34.90,
    dueDate: '2025-11-10',
    status: 'PAID',
    pdfUrl: '/invoices/inv-4.pdf',
  },
  {
    id: 'inv-5',
    referenceMonth: '2025-09',
    amount: 34.90,
    dueDate: '2025-10-10',
    status: 'PAID',
    pdfUrl: '/invoices/inv-5.pdf',
  },
];

/** Mock de pacotes de dados extras */
export const mockDataPackages: DataPackage[] = [
  { id: 'pkg-1', dataGB: 1, price: 9.90, validityDays: 7, description: 'Pacote emergencial' },
  { id: 'pkg-2', dataGB: 2, price: 14.90, validityDays: 15 },
  { id: 'pkg-3', dataGB: 5, price: 29.90, validityDays: 30, description: 'Mais popular' },
  { id: 'pkg-4', dataGB: 10, price: 49.90, validityDays: 30 },
];

/** Mock de histórico de solicitações */
export const mockServiceRequests: ServiceRequestHistoryItem[] = [
  {
    id: 'sr-001',
    protocol: 'SKY20260201001',
    type: 'PORTABILITY',
    status: 'IN_PROGRESS',
    createdAt: '2026-02-01T14:30:00Z',
    updatedAt: '2026-02-02T09:00:00Z',
    description: 'Portabilidade do número (21) 98765-4321',
  },
  {
    id: 'sr-002',
    protocol: 'SKY20260115002',
    type: 'CHIP_SWAP',
    status: 'COMPLETED',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-18T16:00:00Z',
    completedAt: '2026-01-18T16:00:00Z',
    description: 'Troca de chip - Motivo: Defeito',
  },
];

/** Mock de notificações */
export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'INVOICE',
    title: 'Fatura disponível',
    message: 'Sua fatura de janeiro/2026 no valor de R$ 49,90 já está disponível.',
    createdAt: '2026-02-01T08:00:00Z',
    read: false,
  },
  {
    id: 'notif-2',
    type: 'CONSUMPTION_ALERT',
    title: 'Consumo em 80%',
    message: 'Você já utilizou 80% da sua franquia de dados. Considere adquirir um pacote adicional.',
    createdAt: '2026-01-28T15:30:00Z',
    read: false,
  },
  {
    id: 'notif-3',
    type: 'PROMOTION',
    title: 'Oferta especial!',
    message: 'Faça upgrade para o SKY Móvel 25GB e ganhe 3 meses com 50% de desconto!',
    createdAt: '2026-01-25T10:00:00Z',
    read: true,
  },
  {
    id: 'notif-4',
    type: 'SERVICE_COMPLETED',
    title: 'Troca de chip concluída',
    message: 'Sua solicitação de troca de chip foi concluída com sucesso.',
    createdAt: '2026-01-18T16:00:00Z',
    read: true,
  },
  {
    id: 'notif-5',
    type: 'ACTIVATION',
    title: 'Linha ativada!',
    message: 'Bem-vindo à SKY Móvel! Sua linha (11) 99999-0001 está ativa.',
    createdAt: '2026-01-15T10:05:00Z',
    read: true,
  },
];