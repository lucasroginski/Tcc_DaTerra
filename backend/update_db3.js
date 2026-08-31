import db from './config/database.js';

async function updateDb() {
  console.log('Iniciando atualização do banco de dados (update_db3.js)...');
  try {
    // 1. Adicionar client_id em sales (se não existir)
    try {
      await db.query(`ALTER TABLE sales ADD COLUMN client_id INT;`);
      console.log('Coluna client_id adicionada à tabela sales.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('Coluna client_id já existe na tabela sales.');
      } else {
        throw e;
      }
    }

    // 2. Modificar o ENUM de delivery_status para incluir 'em_separacao'
    await db.query(`
      ALTER TABLE sales 
      MODIFY COLUMN delivery_status ENUM('pendente', 'em_separacao', 'em_rota', 'entregue') DEFAULT 'pendente';
    `);
    console.log('ENUM delivery_status atualizado na tabela sales.');

    // 3. Criar tabela de occurrences
    await db.query(`
      CREATE TABLE IF NOT EXISTS occurrences (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sale_id INT NOT NULL,
        reason VARCHAR(255) NOT NULL,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Tabela occurrences criada com sucesso.');

    console.log('Atualização do banco concluída!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao atualizar banco:', error);
    process.exit(1);
  }
}

updateDb();
