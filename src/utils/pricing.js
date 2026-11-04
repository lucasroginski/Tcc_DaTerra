// =========================================================================
//                   REGRAS DE CÁLCULO DE FRETE E TOTAIS (JS)
// =========================================================================
// Centraliza a lógica de precificação para garantir consistência entre o
// Catálogo, o Marketplace e a finalização de pedidos.

/**
 * Calcula o valor do frete baseado na modalidade e no subtotal.
 * - 'moto': Frete expresso fixo de R$ 10,00.
 * - 'fiorino' (padrão): Frete grátis para compras a partir de R$ 30,00, senão R$ 2,00.
 */
export function calculateFreight(deliveryMethod, subtotal) {
  if (deliveryMethod === 'moto') {
    return 10;
  }
  return subtotal >= 30 ? 0 : 2;
}

/**
 * Calcula o valor total final da compra (subtotal + frete).
 */
export function calculateOrderTotal(subtotal, deliveryMethod = 'fiorino') {
  if (subtotal < 0) return 0;
  const freight = calculateFreight(deliveryMethod, subtotal);
  return subtotal + freight;
}
