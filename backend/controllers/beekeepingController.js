import db from '../config/database.js';

export const getApiaries = async (req, res) => {
  const { producerId } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM apiaries WHERE producer_id = ? ORDER BY created_at DESC', [producerId]);
    const apiaries = rows.map(r => ({
      id: String(r.id),
      producerId: r.producer_id,
      name: r.name,
      region: r.region,
      hivesCount: r.hives_count,
      beeType: r.bee_type,
      florada: r.florada,
      lastHarvestDate: r.last_harvest_date,
      totalHarvested: r.total_harvested,
      createdAt: r.created_at
    }));
    return res.status(200).json(apiaries);
  } catch (error) {
    console.error('Erro ao buscar apiários:', error);
    return res.status(500).json({ error: 'Erro ao buscar apiários' });
  }
};

export const createApiary = async (req, res) => {
  const { producerId, name, region, hivesCount, beeType, florada } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO apiaries (producer_id, name, region, hives_count, bee_type, florada) VALUES (?, ?, ?, ?, ?, ?)`,
      [producerId, name, region, hivesCount, beeType, florada]
    );
    const [rows] = await db.query('SELECT * FROM apiaries WHERE id = ?', [result.insertId]);
    const r = rows[0];
    return res.status(201).json({
      id: String(r.id),
      producerId: r.producer_id,
      name: r.name,
      region: r.region,
      hivesCount: r.hives_count,
      beeType: r.bee_type,
      florada: r.florada,
      lastHarvestDate: r.last_harvest_date,
      totalHarvested: r.total_harvested,
      createdAt: r.created_at
    });
  } catch (error) {
    console.error('Erro ao criar apiário:', error);
    return res.status(500).json({ error: 'Erro ao criar apiário' });
  }
};

export const harvestHoney = async (req, res) => {
  const { id } = req.params;
  const { totalHarvested } = req.body;
  
  try {
    await db.query(
      `UPDATE apiaries SET last_harvest_date = NOW(), total_harvested = total_harvested + ? WHERE id = ?`,
      [totalHarvested, id]
    );
    return res.status(200).json({ message: 'Colheita registrada com sucesso' });
  } catch (error) {
    console.error('Erro ao registrar cresta:', error);
    return res.status(500).json({ error: 'Erro ao registrar cresta' });
  }
};
