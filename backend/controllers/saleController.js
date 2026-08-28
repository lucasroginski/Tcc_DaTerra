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

export const getSales = async (req, res) => {
  const { producerId } = req.query;
  
  try {
    let query = `
      SELECT 
        s.id as sale_id, s.sale_date, s.total_value, s.payment_method,
        si.quantity, si.unit_price as price,
        p.id as product_id, p.name as product_name, p.category
      FROM sales s
      JOIN sale_items si ON s.id = si.sale_id
      JOIN products p ON si.product_id = p.id
    `;
    let params = [];
    
    if (producerId) {
      query += ` WHERE p.producer_id = ? `;
      params.push(producerId);
    }
    
    query += ` ORDER BY s.sale_date DESC`;
    
    const [rows] = await db.query(query, params);
    
    // Agrupar itens por venda para o formato esperado pelo frontend
    const salesMap = {};
    
    for (const row of rows) {
      if (!salesMap[row.sale_id]) {
        salesMap[row.sale_id] = {
          id: row.sale_id,
          date: row.sale_date,
          total_value: parseFloat(row.total_value),
          payment_method: row.payment_method,
          items: []
        };
      }
      
      salesMap[row.sale_id].items.push({
        product_id: row.product_id,
        product_name: row.product_name,
        category: row.category,
        quantity: row.quantity,
        price: parseFloat(row.price)
      });
    }
    
    const formattedSales = Object.values(salesMap);
    return res.status(200).json(formattedSales);
    
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    return res.status(500).json({ error: 'Erro interno ao consultar vendas' });
  }
};

export const checkoutSale = async (req, res) => {
  const { items, paymentMethod, deliveryMethod = 'fiorino', freightValue = 0, clientName = '', clientPhone = '', deliveryAddress = '' } = req.body; // Array de itens: [{ product_id, quantity, price }]

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
        `SELECT s.current_quantity, p.price, p.promo_price, p.is_promo 
         FROM stock s
         JOIN products p ON s.product_id = p.id 
         WHERE s.product_id = ? FOR UPDATE`,
        [item.product_id]
      );

      if (stockRows.length === 0) {
        throw new Error(`Produto ID ${item.product_id} não possui registro de estoque.`);
      }

      const dbProduct = stockRows[0];
      const currentQuantity = dbProduct.current_quantity;

      if (currentQuantity < item.quantity) {
        throw new Error(`Estoque insuficiente para o produto ID ${item.product_id}. Disponível: ${currentQuantity}, Solicitado: ${item.quantity}`);
      }

      // Determinar o preço real (verificando promoção) no backend por segurança
      const realPrice = dbProduct.is_promo && dbProduct.promo_price !== null
        ? parseFloat(dbProduct.promo_price)
        : parseFloat(dbProduct.price);
        
      item.price = realPrice; // Substitui o preço enviado pelo client para salvar no histórico

      // Calcula o subtotal acumulado do pedido
      totalValue += realPrice * item.quantity;
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
    // Salvamos a data, valor total (incluindo frete), método de pagamento e dados de entrega.
    // =========================================================================
    totalValue += Number(freightValue);

    const [saleResult] = await connection.query(
      'INSERT INTO sales (total_value, payment_method, tipo_entrega, valor_frete, client_name, client_phone, delivery_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [totalValue, paymentMethod, deliveryMethod, freightValue, clientName, clientPhone, deliveryAddress]
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

export const getDeliveries = async (req, res) => {
  const { producerId } = req.params;
  try {
    const query = `
      SELECT 
        s.id as sale_id, s.sale_date, s.total_value, s.payment_method,
        s.tipo_entrega, s.valor_frete, s.client_name, s.client_phone, s.delivery_address, s.delivery_status,
        si.quantity, si.unit_price as price,
        p.name as product_name
      FROM sales s
      JOIN sale_items si ON s.id = si.sale_id
      JOIN products p ON si.product_id = p.id
      WHERE p.producer_id = ?
      ORDER BY s.sale_date DESC
    `;
    const [rows] = await db.query(query, [producerId]);
    
    const deliveriesMap = {};
    for (const row of rows) {
      if (!deliveriesMap[row.sale_id]) {
        deliveriesMap[row.sale_id] = {
          id: row.sale_id,
          date: row.sale_date,
          total_value: parseFloat(row.total_value),
          payment_method: row.payment_method,
          tipo_entrega: row.tipo_entrega,
          valor_frete: parseFloat(row.valor_frete),
          client_name: row.client_name,
          client_phone: row.client_phone,
          delivery_address: row.delivery_address,
          delivery_status: row.delivery_status,
          items: []
        };
      }
      deliveriesMap[row.sale_id].items.push({
        product_name: row.product_name,
        quantity: row.quantity,
        price: parseFloat(row.price)
      });
    }
    return res.status(200).json(Object.values(deliveriesMap));
  } catch (error) {
    console.error('Erro ao buscar entregas:', error);
    return res.status(500).json({ error: 'Erro interno ao consultar entregas' });
  }
};

export const updateDeliveryStatus = async (req, res) => {
  const { pedido_id } = req.params;
  const { status } = req.body;
  try {
    await db.query('UPDATE sales SET delivery_status = ? WHERE id = ?', [status, pedido_id]);
    return res.status(200).json({ success: true, message: 'Status atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar status da entrega:', error);
    return res.status(500).json({ error: 'Erro ao atualizar status' });
  }
};
