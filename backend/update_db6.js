import db from './config/database.js';

async function updateDb() {
  console.log('Iniciando atualização do banco de dados (update_db6.js)...');
  try {
    try {
      await db.query(`ALTER TABLE users ADD COLUMN safra_pro BOOLEAN DEFAULT FALSE;`);
      console.log('Coluna safra_pro adicionada à tabela users.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('Coluna safra_pro já existe na tabela users.');
      } else {
        throw e;
      }
    }

    await db.query(`
      CREATE TABLE IF NOT EXISTS planting_cycles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        producer_id INT NOT NULL,
        culture VARCHAR(100) NOT NULL,
        region VARCHAR(100) NOT NULL,
        quantity VARCHAR(50) NOT NULL,
        fertilizer_type VARCHAR(50) NOT NULL,
        cover_fertilizer BOOLEAN DEFAULT FALSE,
        cover_days INT,
        pest_control VARCHAR(50) NOT NULL,
        care_days INT,
        start_date DATETIME NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        harvested_amount VARCHAR(100),
        losses VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (producer_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('Tabela planting_cycles verificada/criada com sucesso.');

    console.log('Atualização do banco concluída!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao atualizar banco:', error);
    process.exit(1);
  }
}

updateDb();
