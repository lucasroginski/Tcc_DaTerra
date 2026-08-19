// =========================================================================
//                   CONTROLADOR DE VENDAS COM TRANSAÇÕES ACID
// =========================================================================
// O que faz: Processa a finalização de compras e atualiza o estoque.
// Por que foi implementado assim: Este é um dos pontos mais importantes do TCC.
// O processo de checkout de vendas exige consistência absoluta nos dados.
// Se vendermos um produto sem estoque ou se o sistema cair no meio da inserção,
// geraremos inconsistência financeira e furos de estoque.
// Para mitigar isso, aplicamos uma Transação de Banco de Dados que garante as
// propriedades ACID (Atomicidade, Consistência, Isolamento e Durabilidade).

import db from '../config/database.js';

export const checkoutSale = async (req, res) => {
  const { items, paymentMethod } = req.body; // Array de itens: [{ product_id, quantity, price }]

  if (!items || items.length === 0 || !paymentMethod) {
    return res.status(400).json({ error: 'Carrinho de compras vazio ou dados ausentes' });
  }

  let connection;

  try {
    // 1. OBTENÇÃO DA CONEXÃO & INÍCIO DA TRANSAÇÃO
    // =========================================================================
    // Abrimos uma conexão isolada do pool para podermos gerenciar o estado da 
    // transação. Damos o "beginTransaction" para travar as alterações até o commit.
    // =========================================================================
    connection = await db.getConnection();
    await connection.beginTransaction();

    let totalValue = 0;

    // 2. VALIDAÇÃO DE ESTOQUE COM BLOQUEIO PESSIMISTA (SELECT FOR UPDATE)
    // =========================================================================
    // Para cada item no carrinho, verificamos se há estoque físico disponível.
    // Usamos 'FOR UPDATE' na query para travar as linhas consultadas no banco.
    // Isso evita que outra venda simultânea (concorrência) leia a mesma quantidade
    // e provoque venda dupla de um produto que só tinha uma unidade.
    // =========================================================================
    for (const item of items) {
      const [stockRows] = await connection.query(
        'SELECT current_quantity FROM stock WHERE product_id = ? FOR UPDATE',
        [item.product_id]
      );

      if (stockRows.length === 0) {
        throw new Error(`Produto ID ${item.product_id} não possui registro de estoque.`);
      }

      const currentQuantity = stockRows[0].current_quantity;

      if (currentQuantity < item.quantity) {
        // Se qualquer um dos itens tiver estoque insuficiente, abortamos toda a transação
        throw new Error(`Estoque insuficiente para o produto ID ${item.product_id}. Disponível: ${currentQuantity}, Solicitado: ${item.quantity}`);
      }

      // Calcula o subtotal acumulado do pedido
      totalValue += item.price * item.quantity;
    }

    // 3. DEDUÇÃO DO ESTOQUE (UPDATE)
    // =========================================================================
    // Atualizamos as quantidades subtraindo o volume comprado da tabela stock.
    // =========================================================================
    for (const item of items) {
      await connection.query(
        'UPDATE stock SET current_quantity = current_quantity - ? WHERE product_id = ?',
        [item.quantity, item.product_id]
      );
    }

    // 4. REGISTRO DO CABEÇALHO DA VENDA (INSERT SALES)
    // =========================================================================
    // Salvamos a data, valor total e método de pagamento.
    // =========================================================================
    const [saleResult] = await connection.query(
      'INSERT INTO sales (total_value, payment_method) VALUES (?, ?)',
      [totalValue, paymentMethod]
    );
    const saleId = saleResult.insertId;

    // 5. REGISTRO DETALHADO DOS ITENS COMPRADOS (INSERT SALE_ITEMS)
    // =========================================================================
    // Gravamos cada produto vendido no histórico com preço unitário congelado.
    // =========================================================================
    for (const item of items) {
      await connection.query(
        'INSERT INTO sale_items (sale_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
        [saleId, item.product_id, item.quantity, item.price]
      );
    }

    // 6. COMMIT DA TRANSAÇÃO
    // =========================================================================
    // Se o código chegou até aqui sem erros, aplicamos o COMMIT.
    // Todas as operações (dedução do estoque + insert da venda + insert itens)
    // são salvas definitivamente no banco em conjunto.
    // =========================================================================
    await connection.commit();

    return res.status(200).json({
      success: true,
      message: 'Venda confirmada e estoque atualizado com sucesso!',
      saleId,
      total: totalValue
    });

  } catch (error) {
    // 7. TRATAMENTO DE FALHA COM ROLLBACK (ATOMICIDADE GARANTIDA)
    // =========================================================================
    // Caso ocorra QUALQUER erro no processo (falha de estoque, timeout de banco,
    // erro de sintaxe, etc.), o bloco catch captura a exceção e executa o ROLLBACK.
    // O Rollback desfaz automaticamente todas as alterações parciais feitas na
    // conexão corrente, deixando o estoque e as tabelas intocadas, impedindo
    // "furos de estoque" e inconsistências financeiras.
    // =========================================================================
    if (connection) {
      await connection.rollback();
    }
    console.error('Falha na transação de venda. Efetuando Rollback:', error.message);
    
    return res.status(400).json({
      success: false,
      error: 'Falha ao processar venda',
      message: error.message
    });

  } finally {
    // Sempre devolve a conexão de volta para o pool de conexões livres
    if (connection) {
      connection.release();
    }
  }
};
