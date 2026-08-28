import db from '../config/database.js';

export const logActivity = async (req, res) => {
  const { userId, userName, action, details } = req.body;

  if (!userName || !action || !details) {
    return res.status(400).json({ error: 'Faltam dados obrigatórios para registrar a atividade.' });
  }

  try {
    const query = 'INSERT INTO client_activities (user_id, user_name, action, details) VALUES (?, ?, ?, ?)';
    const params = [userId || null, userName, action, details];
    
    await db.query(query, params);
    
    return res.status(201).json({ message: 'Atividade registrada com sucesso' });
  } catch (error) {
    console.error('Erro ao registrar atividade:', error);
    return res.status(500).json({ error: 'Erro interno ao registrar atividade' });
  }
};

export const getActivities = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM client_activities ORDER BY timestamp DESC');
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar atividades:', error);
    return res.status(500).json({ error: 'Erro interno ao buscar atividades' });
  }
};
