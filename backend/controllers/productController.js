// =========================================================================
//                      CONTROLADOR DE PRODUTOS & PLANOS SAAS
// =========================================================================
// O que faz: Gerencia a listagem e o cadastro de produtos.
// Por que foi implementado assim: Aplica o conceito de "Separation of Concerns" (SoC)
// mantendo as regras de negócio isoladas das rotas do Express.
// Aqui também validamos as regras comerciais da plataforma SaaS, garantindo
// que produtores no plano "free" respeitem o limite estipulado de cadastro.

import db from '../config/database.js';

// 1. LISTAGEM DE PRODUTOS COM QUANTIDADES EM ESTOQUE
// =========================================================================
// Por que LEFT JOIN: Garante que o produto apareça no catálogo mesmo se 
// ainda não houver nenhum registro de estoque na tabela associada (stock).
// =========================================================================
export const listProducts = async (req, res) => {
  try {
    const query = `
      SELECT p.*, s.current_quantity, s.harvest_date
      FROM products p
      LEFT JOIN stock s ON p.id = s.product_id
      ORDER BY p.name ASC
    `;
    const [rows] = await db.query(query);
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    return res.status(500).json({ error: 'Erro interno ao consultar o catálogo' });
  }
};

// 2. CADASTRO DE PRODUTO COM VALIDAÇÃO DE LIMITE DE PLANO
// =========================================================================
// Regra SaaS: Um produtor comum tem limite máximo de 10 produtos.
// Se tentar cadastrar o 11º produto, a API bloqueia a criação e sugere o upgrade.
// =========================================================================
export const createProduct = async (req, res) => {
  const { name, category, price, userId } = req.body;

  if (!name || !category || !price || !userId) {
    return res.status(400).json({ error: 'Dados incompletos para cadastro do produto' });
  }

  let connection;

  try {
    // Pegamos uma conexão dedicada do pool para realizar operações encadeadas
    connection = await db.getConnection();

    // Passo 2.1: Obter as informações do plano do usuário (Produtor)
    const [userRows] = await connection.query(
      'SELECT role, plan, product_limit FROM users WHERE id = ?',
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Usuário produtor não localizado' });
    }

    const producer = userRows[0];
    if (producer.role !== 'producer' && producer.role !== 'admin') {
      return res.status(403).json({ error: 'Apenas produtores podem cadastrar itens' });
    }

    // Admins ou produtores com plano VIP podem cadastrar produtos de forma ilimitada
    if (producer.role !== 'admin' && producer.plan !== 'vip') {
      // Passo 2.2: Contar quantos produtos já estão cadastrados na base global
      const [countRows] = await connection.query('SELECT COUNT(*) AS total FROM products');
      const currentProductsCount = countRows[0].total;

      // Se atingiu o limite de limite, bloquear inserção
      if (currentProductsCount >= producer.product_limit) {
        return res.status(403).json({
          error: `Limite de plano excedido (${currentProductsCount}/${producer.product_limit}).`,
          limitExceeded: true,
          message: 'Faça o upgrade para o Plano VIP para desbloquear novos cadastros!'
        });
      }
    }

    // Passo 2.3: Iniciar cadastro (Transação atômica local)
    await connection.beginTransaction();

    // Inserir na tabela de produtos
    const [productResult] = await connection.query(
      'INSERT INTO products (name, category, price) VALUES (?, ?, ?)',
      [name, category, price]
    );
    const newProductId = productResult.insertId;

    // Inserir estoque inicial zerado na tabela stock (consistência referencial 1:1)
    await connection.query(
      'INSERT INTO stock (product_id, current_quantity, harvest_date) VALUES (?, 0, CURDATE())',
      [newProductId]
    );

    // Commit da transação de criação
    await connection.commit();

    return res.status(201).json({
      message: 'Produto cadastrado com sucesso e estoque inicial iniciado!',
      productId: newProductId
    });

  } catch (error) {
    // Caso ocorra qualquer erro no cadastro, desfazemos as inserções parciais
    if (connection) await connection.rollback();
    console.error('Erro ao cadastrar produto:', error);
    return res.status(500).json({ error: 'Erro interno ao realizar cadastro' });
  } finally {
    // Sempre liberamos a conexão de volta ao pool ao finalizar o bloco
    if (connection) connection.release();
  }
};
