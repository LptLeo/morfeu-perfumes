/**
 * Máscara de moeda estilo Pix/banco: cada dígito digitado entra como centavo.
 *
 * Fluxo do exemplo "100 reais":
 *   digita 1     → 0,01
 *   digita 0     → 0,10
 *   digita 0     → 1,00
 *   (…continua)  → 10,00 → 100,00
 */

/** Converte a sequência de dígitos brutos para centavos (inteiro). */
export function digitsToCents(digits: string): number {
  const clean = digits.replace(/\D/g, '').slice(0, 9); // até R$ 9.999.999,99
  return Number.parseInt(clean || '0', 10);
}

/** Formata centavos como exibição BRL: 10000 → "R$ 100,00". */
export function centsToDisplay(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    cents / 100
  );
}

/**
 * Aplica a máscara sobre o valor digitado.
 * `raw` é tudo que veio do input; extraímos só os dígitos e reinterpretamos
 * como centavos — comportamento idêntico ao campo de valor dos bancos.
 */
export function maskPriceInput(raw: string): { digits: string; display: string; cents: number } {
  const clean = raw.replace(/\D/g, '');
  const cents = digitsToCents(clean);
  return { digits: clean, display: centsToDisplay(cents), cents };
}
