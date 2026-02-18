/**
 * Utilitários de Formatação - SKY Móvel
 * 
 * Funções de formatação para CPF, telefone, moeda, datas etc.
 * 
 * @module utils/formatters
 */

/** Formata CPF: 123.456.789-00 */
export function formatCPF(cpf: string): string {
  const clean = cpf.replace(/\D/g, '');
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/** Mascara CPF para exibição: ***.456.789-** */
export function maskCPF(cpf: string): string {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return cpf;
  return `***.${clean.slice(3, 6)}.${clean.slice(6, 9)}-**`;
}

/** Formata telefone: (11) 99999-0001 */
export function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 11) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
  }
  if (clean.length === 10) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  }
  return phone;
}

/** Formata moeda brasileira: R$ 49,90 */
export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/** Formata data ISO para dd/mm/aaaa */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('pt-BR');
}

/** Formata mês de referência: "2026-01" -> "Janeiro 2026" */
export function formatReferenceMonth(refMonth: string): string {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];
  const [year, month] = refMonth.split('-');
  return `${months[parseInt(month, 10) - 1]} ${year}`;
}

/** Formata data relativa: "Há 2 horas", "Ontem" */
export function formatRelativeDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'Agora';
  if (diffHours < 24) return `Há ${diffHours}h`;
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `Há ${diffDays} dias`;
  return formatDate(isoDate);
}

/** Aplica máscara de CPF enquanto digita */
export function applyCPFMask(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 11);
  let formatted = clean;
  if (clean.length > 3) formatted = clean.slice(0, 3) + '.' + clean.slice(3);
  if (clean.length > 6) formatted = formatted.slice(0, 7) + '.' + clean.slice(6);
  if (clean.length > 9) formatted = formatted.slice(0, 11) + '-' + clean.slice(9);
  return formatted;
}

/** Mascara ICCID: ****-****-****-1234 */
export function maskICCID(iccid: string): string {
  if (iccid.length < 4) return iccid;
  return `****-****-****-${iccid.slice(-4)}`;
}

/** Formata CEP: 01234-567 */
export function formatZipCode(zipCode: string): string {
  const clean = zipCode.replace(/\D/g, '');
  if (clean.length === 8) {
    return `${clean.slice(0, 5)}-${clean.slice(5)}`;
  }
  return zipCode;
}

/** Extrai primeiro nome */
export function getFirstName(fullName: string): string {
  return fullName.split(' ')[0];
}