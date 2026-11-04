import { describe, it, expect } from 'vitest';
import { calculateFreight, calculateOrderTotal } from './pricing.js';

describe('Testes Unitários de JS (Frontend) - pricing.js', () => {

  describe('calculateFreight()', () => {
    it('deve cobrar R$ 10,00 quando a entrega for por moto (expresso)', () => {
      // 1. Arrange (Preparar)
      const metodoEntrega = 'moto';
      const subtotal = 50;

      // 2. Act (Agir)
      const frete = calculateFreight(metodoEntrega, subtotal);

      // 3. Assert (Verificar)
      expect(frete).toBe(10);
    });

    it('deve conceder frete grátis (R$ 0) para entrega convencional com compras a partir de R$ 30,00', () => {
      expect(calculateFreight('fiorino', 30)).toBe(0);
      expect(calculateFreight('fiorino', 100)).toBe(0);
    });

    it('deve cobrar taxa simbólica de R$ 2,00 para compras abaixo de R$ 30,00 na fiorino', () => {
      expect(calculateFreight('fiorino', 29.90)).toBe(2);
      expect(calculateFreight('fiorino', 15.00)).toBe(2);
    });
  });

  describe('calculateOrderTotal()', () => {
    it('deve somar o subtotal com o frete de moto corretamente', () => {
      const total = calculateOrderTotal(25, 'moto'); // 25 + 10 = 35
      expect(total).toBe(35);
    });

    it('deve calcular o total com frete grátis para compras acima de R$ 30', () => {
      const total = calculateOrderTotal(40, 'fiorino'); // 40 + 0 = 40
      expect(total).toBe(40);
    });
  });

});
