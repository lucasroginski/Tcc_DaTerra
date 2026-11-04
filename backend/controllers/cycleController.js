import db from '../config/database.js';

export const getCycles = async (req, res) => {
  const { producerId } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM planting_cycles WHERE producer_id = ? ORDER BY created_at ASC', [producerId]);
    const cycles = rows.map(r => ({
      id: String(r.id), // String to match frontend usage
      producerId: r.producer_id,
      culture: r.culture,
      region: r.region,
      quantity: r.quantity,
      fertilizerType: r.fertilizer_type,
      coverFertilizer: Boolean(r.cover_fertilizer),
      coverDays: r.cover_days,
      pestControl: r.pest_control,
      careDays: r.care_days,
      startDate: r.start_date,
      status: r.status,
      harvestedAmount: r.harvested_amount,
      losses: r.losses,
      createdAt: r.created_at
    }));
    return res.status(200).json(cycles);
  } catch (error) {
    console.error('Erro ao buscar ciclos:', error);
    return res.status(500).json({ error: 'Erro ao buscar ciclos' });
  }
};

export const createCycle = async (req, res) => {
  const {
    producerId, culture, region, quantity, fertilizerType,
    coverFertilizer, coverDays, pestControl, careDays, startDate
  } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO planting_cycles 
       (producer_id, culture, region, quantity, fertilizer_type, cover_fertilizer, cover_days, pest_control, care_days, start_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [producerId, culture, region, quantity, fertilizerType, coverFertilizer, coverDays, pestControl, careDays, startDate]
    );

    const [rows] = await db.query('SELECT * FROM planting_cycles WHERE id = ?', [result.insertId]);
    const r = rows[0];
    const newCycle = {
      id: String(r.id),
      producerId: r.producer_id,
      culture: r.culture,
      region: r.region,
      quantity: r.quantity,
      fertilizerType: r.fertilizer_type,
      coverFertilizer: Boolean(r.cover_fertilizer),
      coverDays: r.cover_days,
      pestControl: r.pest_control,
      careDays: r.care_days,
      startDate: r.start_date,
      status: r.status,
      harvestedAmount: r.harvested_amount,
      losses: r.losses,
      createdAt: r.created_at
    };
    return res.status(201).json(newCycle);
  } catch (error) {
    console.error('Erro ao criar ciclo:', error);
    return res.status(500).json({ error: 'Erro ao criar ciclo' });
  }
};

export const harvestCycle = async (req, res) => {
  const { id } = req.params;
  const { harvestedAmount, losses } = req.body;

  try {
    await db.query(
      `UPDATE planting_cycles SET status = 'harvested', harvested_amount = ?, losses = ? WHERE id = ?`,
      [harvestedAmount, losses, id]
    );
    return res.status(200).json({ message: 'Colheita registrada' });
  } catch (error) {
    console.error('Erro ao registrar colheita:', error);
    return res.status(500).json({ error: 'Erro ao registrar colheita' });
  }
};
