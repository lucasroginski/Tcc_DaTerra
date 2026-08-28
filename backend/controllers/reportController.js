import db from '../config/database.js';

export const getProducerReport = async (req, res) => {
  const { id } = req.params; // Producer ID

  try {
    const currentMonth = new Date().toISOString().slice(0, 7) + '%'; // YYYY-MM%

    // 1. Total faturado no mês (apenas a parcela deste produtor)
    // Uma venda pode ter itens de vários produtores, então somamos (quantidade * preco_unitario)
    const [revenueRows] = await db.query(
      `SELECT SUM(si.quantity * si.unit_price) as total_revenue
       FROM sales s
       JOIN sale_items si ON s.id = si.sale_id
       JOIN products p ON si.product_id = p.id
       WHERE p.producer_id = ? AND s.sale_date LIKE ?`,
      [id, currentMonth]
    );
    const totalRevenue = revenueRows[0].total_revenue || 0;

    // 2. Quantidade de Vendas Únicas deste produtor no mês
    const [salesCountRows] = await db.query(
      `SELECT COUNT(DISTINCT s.id) as sales_count
       FROM sales s
       JOIN sale_items si ON s.id = si.sale_id
       JOIN products p ON si.product_id = p.id
       WHERE p.producer_id = ? AND s.sale_date LIKE ?`,
      [id, currentMonth]
    );
    const salesCount = salesCountRows[0].sales_count || 0;

    // 3. Produtos Mais Vendidos (Top 5)
    const [topProducts] = await db.query(
      `SELECT p.name, SUM(si.quantity) as total_sold
       FROM sale_items si
       JOIN products p ON si.product_id = p.id
       WHERE p.producer_id = ?
       GROUP BY p.id
       ORDER BY total_sold DESC
       LIMIT 5`,
      [id]
    );

    // 4. Estoque Crítico
    const [lowStock] = await db.query(
      `SELECT p.name, s.current_quantity 
       FROM stock s
       JOIN products p ON s.product_id = p.id
       WHERE p.producer_id = ? AND s.current_quantity < 5
       ORDER BY s.current_quantity ASC`,
      [id]
    );

    return res.status(200).json({
      totalRevenue: parseFloat(totalRevenue),
      salesCount: parseInt(salesCount),
      topProducts,
      lowStock
    });
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return res.status(500).json({ error: 'Erro interno ao gerar relatório' });
  }
};
