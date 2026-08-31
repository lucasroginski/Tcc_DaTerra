import db from './config/database.js';

async function updateDb() {
  console.log('Iniciando atualização do banco de dados (update_db4.js)...');
  try {
    // Criar tabela messages
    await db.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Tabela messages criada com sucesso.');

    console.log('Atualização do banco concluída!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao atualizar banco:', error);
    process.exit(1);
  }
}

updateDb();
