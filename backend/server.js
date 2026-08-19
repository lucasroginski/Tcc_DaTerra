// =========================================================================
//                  SERVER.JS - PORTAL DE ENTRADA DA API REST
// =========================================================================
// O que faz: Inicializa o servidor HTTP Express, define os middlewares
// globais e mapeia as rotas REST que expõem as regras de negócio ao frontend.
// Por que foi implementado assim: O Express é uma biblioteca leve e robusta
// para lidar com chamadas HTTP. Estruturamos rotas semânticas seguindo o padrão
// RESTful: GET para consulta e POST para criação.

import express from 'express';
import cors from 'cors';
import { listProducts, createProduct } from './controllers/productController.js';
import { checkoutSale } from './controllers/saleController.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares Globais
// =========================================================================
// CORS: Permite que nossa aplicação frontend (React) rodando em localhost:5173
// se comunique com este servidor REST sem bloqueios de segurança do navegador.
// express.json(): Middleware que faz o parse de requisições com payload em JSON.
// =========================================================================
app.use(cors());
app.use(express.json());

// =========================================================================
//                              ROTAS DA API REST
// =========================================================================

// Rota de Catálogo: Listagem geral de produtos com quantidades em estoque
// GET /api/products
app.get('/api/products', listProducts);

// Rota de Cadastro de Produto: Criação com validação de limite do plano SaaS
// POST /api/products
app.post('/api/products', createProduct);

// Rota de Transação de Checkout: Venda atômica com baixa no estoque e rollback
// POST /api/sales
app.post('/api/sales', checkoutSale);

// Middleware para tratamento global de erros (Fallback final de segurança)
app.use((err, req, res, next) => {
  console.error('Erro não tratado na API:', err);
  res.status(500).json({ error: 'Ocorreu um erro inesperado no servidor' });
});

// Inicialização do Servidor
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` Servidor DaTerra rodando com sucesso na porta ${PORT}`);
  console.log(` API REST ativa e integrada ao pool MySQL.`);
  console.log(`===================================================`);
});
