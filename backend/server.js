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
import { listProducts, createProduct, updateProduct, deleteProduct, updateStock } from './controllers/productController.js';
import { checkoutSale, getSales, getDeliveries, updateDeliveryStatus, getClientOrders, hideClientOrder } from './controllers/saleController.js';
import { login, register, upgradePlan } from './controllers/authController.js';
import { createOccurrence, getProducerOccurrences, resolveOccurrence } from './controllers/occurrenceController.js';
import { sendMessage, getConversation, getInbox } from './controllers/chatController.js';
import { logActivity, getActivities } from './controllers/activityController.js';
import { getProducerReport } from './controllers/reportController.js';

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

// Rotas de Autenticação e Usuários
app.post('/api/auth/login', login);
app.post('/api/auth/register', register);
app.put('/api/users/:id/upgrade', upgradePlan);

// Rota de Catálogo: Listagem geral de produtos com quantidades em estoque
// GET /api/products
app.get('/api/products', listProducts);

// Rota de Cadastro de Produto: Criação com validação de limite do plano SaaS
// POST /api/products
app.post('/api/products', createProduct);

// Edição e Deleção de Produto
app.put('/api/products/:id', updateProduct);
app.delete('/api/products/:id', deleteProduct);

// Reposição de Estoque
app.put('/api/products/:id/stock', updateStock);

// Rota de Transação de Checkout: Venda atômica com baixa no estoque e rollback
// POST /api/sales
app.post('/api/sales', checkoutSale);

// GET /api/sales - Buscar vendas
app.get('/api/sales', getSales);

// Rotas de Entregas Logísticas
app.get('/api/entregas/produtor/:producerId', getDeliveries);
app.patch('/api/entregas/:pedido_id/status', updateDeliveryStatus);

// Rotas do Cliente e Produtor (Pedidos e Ocorrências)
app.get('/api/pedidos/cliente/:cliente_id', getClientOrders);
app.patch('/api/pedidos/:pedido_id/ocultar', hideClientOrder);
app.post('/api/pedidos/:pedido_id/ocorrencia', createOccurrence);
app.get('/api/ocorrencias/produtor/:producerId', getProducerOccurrences);
app.delete('/api/ocorrencias/:occurrence_id', resolveOccurrence);

// Rotas de Mensageria (Chat Interno)
app.post('/api/chat/send', sendMessage);
app.get('/api/chat/conversation/:userId/:otherUserId', getConversation);
app.get('/api/chat/inbox/:userId', getInbox);

// Rotas de Atividades (Auditoria)
app.post('/api/activities', logActivity);
app.get('/api/activities', getActivities);

// Rotas de Relatórios (Producer)
app.get('/api/reports/producer/:id', getProducerReport);

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
