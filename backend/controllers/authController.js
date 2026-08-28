import db from '../config/database.js';

// Login User
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios' });

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
    if (rows.length === 0) return res.status(401).json({ error: 'Email ou senha incorretos' });

    const user = rows[0];
    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      plan: user.plan,
      productLimit: user.product_limit,
      createdAt: user.created_at
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

// Register User
export const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  try {
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(409).json({ error: 'Email já cadastrado' });

    const limit = role === 'producer' ? 10 : 0;
    
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role, product_limit) VALUES (?, ?, ?, ?, ?)',
      [name, email, password, role, limit]
    );

    return res.status(201).json({
      message: 'Usuário cadastrado com sucesso',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

// Upgrade User Plan / Limit
export const upgradePlan = async (req, res) => {
  const { id } = req.params;
  const { plan, extraLimit } = req.body;

  try {
    if (plan === 'vip') {
      await db.query('UPDATE users SET plan = ?, product_limit = GREATEST(product_limit, 10) WHERE id = ?', [plan, id]);
    } else if (extraLimit) {
      await db.query('UPDATE users SET product_limit = product_limit + ? WHERE id = ?', [extraLimit, id]);
    } else {
      return res.status(400).json({ error: 'Nenhuma alteração enviada' });
    }

    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    const user = rows[0];
    
    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      plan: user.plan,
      productLimit: user.product_limit,
      createdAt: user.created_at
    });
  } catch (error) {
    console.error('Erro ao atualizar plano:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};
