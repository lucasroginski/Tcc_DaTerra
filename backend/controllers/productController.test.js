import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProduct } from './productController.js';
import db from '../config/database.js';

// Mockamos o módulo de banco de dados para o teste unitário ser isolado,
// rápido e não precisar do MySQL estar rodando.
vi.mock('../config/database.js', () => ({
  default: {
    getConnection: vi.fn(),
    query: vi.fn(),
  }
}));

describe('Testes Unitários do Backend - productController.js', () => {
  let req;
  let res;

  // Antes de cada teste, preparamos objetos simulados de Requisição e Resposta do Express
  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      body: {}
    };

    res = {
      status: vi.fn().mockReturnThis(), // permite encadear .status(400).json(...)
      json: vi.fn().mockReturnThis()
    };
  });

  describe('createProduct()', () => {

    it('deve retornar status 400 se faltarem campos obrigatórios', async () => {
      // 1. Arrange (Preparar requisição com campos faltando)
      req.body = {
        name: 'Mel Puro',
        // faltando category, price e userId
      };

      // 2. Act (Executar o controller)
      await createProduct(req, res);

      // 3. Assert (Verificar que a API barrou a requisição)
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Dados incompletos para cadastro do produto'
      });
    });

    it('deve bloquear o cadastro com status 403 se o produtor atingiu o limite do plano', async () => {
      // 1. Arrange: Dados completos na requisição
      req.body = {
        name: 'Geleia de Morango',
        category: 'Geleias',
        price: 18.50,
        userId: 1
      };

      // Simular a conexão do banco de dados e suas queries
      const mockConnection = {
        query: vi.fn(),
        beginTransaction: vi.fn(),
        commit: vi.fn(),
        rollback: vi.fn(),
        release: vi.fn()
      };

      // 1ª query: busca o usuário (plano free, limite de 10)
      // 2ª query: conta produtos cadastrados (já tem 10)
      mockConnection.query
        .mockResolvedValueOnce([[{ id: 1, role: 'producer', plan: 'free', product_limit: 10 }]]) // userRows
        .mockResolvedValueOnce([[{ total: 10 }]]); // countRows

      db.getConnection.mockResolvedValue(mockConnection);

      // 2. Act
      await createProduct(req, res);

      // 3. Assert: Deve retornar 403 avisando que o limite foi excedido
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          limitExceeded: true
        })
      );
    });

  });
});
