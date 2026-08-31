import db from '../config/database.js';

export const sendMessage = async (req, res) => {
  const { senderId, receiverId, content } = req.body;
  if (!senderId || !receiverId || !content) {
    return res.status(400).json({ error: 'Dados incompletos para envio da mensagem' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
      [senderId, receiverId, content]
    );
    return res.status(201).json({ success: true, messageId: result.insertId });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
};

export const getConversation = async (req, res) => {
  const { userId, otherUserId } = req.params;
  try {
    // Buscar as mensagens entre os dois usuários, ordenadas pela mais antiga primeiro (cronológico para o chat)
    const [messages] = await db.query(`
      SELECT m.*, u1.name as sender_name, u2.name as receiver_name
      FROM messages m
      JOIN users u1 ON m.sender_id = u1.id
      JOIN users u2 ON m.receiver_id = u2.id
      WHERE (m.sender_id = ? AND m.receiver_id = ?) 
         OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at ASC
    `, [userId, otherUserId, otherUserId, userId]);

    // Marcar como lidas as mensagens recebidas pelo userId atual vindas do otherUserId
    await db.query(`
      UPDATE messages SET is_read = TRUE 
      WHERE receiver_id = ? AND sender_id = ? AND is_read = FALSE
    `, [userId, otherUserId]);

    return res.status(200).json(messages);
  } catch (error) {
    console.error('Erro ao buscar conversa:', error);
    return res.status(500).json({ error: 'Erro ao buscar conversa' });
  }
};

export const getInbox = async (req, res) => {
  const { userId } = req.params;
  try {
    // Query para pegar os contatos únicos e a última mensagem trocada.
    // Usaremos uma query mais simples: pega todos que enviaram ou receberam mensagens, e suas info.
    const [rows] = await db.query(`
      SELECT 
        contact_id, 
        u.name as contact_name, 
        MAX(m.created_at) as last_activity,
        SUM(CASE WHEN m.receiver_id = ? AND m.is_read = FALSE THEN 1 ELSE 0 END) as unread_count
      FROM (
        SELECT receiver_id as contact_id, id FROM messages WHERE sender_id = ?
        UNION
        SELECT sender_id as contact_id, id FROM messages WHERE receiver_id = ?
      ) as contacts
      JOIN messages m ON (m.sender_id = ? AND m.receiver_id = contacts.contact_id) 
                      OR (m.receiver_id = ? AND m.sender_id = contacts.contact_id)
      JOIN users u ON u.id = contacts.contact_id
      GROUP BY contact_id, contact_name
      ORDER BY last_activity DESC
    `, [userId, userId, userId, userId, userId]);
    
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar inbox:', error);
    return res.status(500).json({ error: 'Erro ao buscar inbox' });
  }
};
