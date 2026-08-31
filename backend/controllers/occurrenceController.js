import db from '../config/database.js';

export const createOccurrence = async (req, res) => {
  const { pedido_id } = req.params;
  const { reason, details } = req.body;

  if (!reason) {
    return res.status(400).json({ error: 'Motivo da ocorrência é obrigatório' });
  }

  try {
    // Verifica se a venda existe
    const [sales] = await db.query('SELECT id FROM sales WHERE id = ?', [pedido_id]);
    if (sales.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    const [result] = await db.query(
      'INSERT INTO occurrences (sale_id, reason, details) VALUES (?, ?, ?)',
      [pedido_id, reason, details || '']
    );

    return res.status(201).json({
      success: true,
      message: 'Ocorrência registrada com sucesso',
      occurrenceId: result.insertId
    });
  } catch (error) {
    console.error('Erro ao registrar ocorrência:', error);
    return res.status(500).json({ error: 'Erro interno ao registrar ocorrência' });
  }
};

export const getProducerOccurrences = async (req, res) => {
  const { producerId } = req.params;
  try {
    const query = `
      SELECT 
        o.id as occurrence_id, o.reason, o.details, o.created_at,
        s.id as sale_id, s.client_name, s.client_phone
      FROM occurrences o
      JOIN sales s ON o.sale_id = s.id
      JOIN sale_items si ON s.id = si.sale_id
      JOIN products p ON si.product_id = p.id
      WHERE p.producer_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;
    const [rows] = await db.query(query, [producerId]);
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar ocorrências:', error);
    return res.status(500).json({ error: 'Erro ao buscar ocorrências' });
  }
};

export const resolveOccurrence = async (req, res) => {
  const { occurrence_id } = req.params;
  try {
    // Apaga a ocorrência do banco
    await db.query('DELETE FROM occurrences WHERE id = ?', [occurrence_id]);
    return res.status(200).json({ success: true, message: 'Ocorrência resolvida com sucesso' });
  } catch (error) {
    console.error('Erro ao resolver ocorrência:', error);
    return res.status(500).json({ error: 'Erro ao resolver ocorrência' });
  }
};
