import db from './config/database.js';

async function updateDb() {
  console.log('Iniciando atualização do banco de dados (update_db7.js)...');
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS apiaries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        producer_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        region VARCHAR(100) NOT NULL,
        hives_count INT NOT NULL DEFAULT 1,
        bee_type VARCHAR(100) NOT NULL,
        florada VARCHAR(100) NOT NULL,
        last_harvest_date DATETIME,
        total_harvested DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (producer_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('Tabela apiaries verificada/criada com sucesso.');

    console.log('Atualização do banco concluída!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao atualizar banco:', error);
    process.exit(1);
  }
}

updateDb();
