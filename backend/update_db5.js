import db from './config/database.js';

async function updateDb() {
  console.log('Iniciando atualização do banco de dados (update_db5.js)...');
  try {
    try {
      await db.query(`ALTER TABLE sales ADD COLUMN client_hidden BOOLEAN DEFAULT FALSE;`);
      console.log('Coluna client_hidden adicionada à tabela sales.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('Coluna client_hidden já existe na tabela sales.');
      } else {
        throw e;
      }
    }

    console.log('Atualização do banco concluída!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao atualizar banco:', error);
    process.exit(1);
  }
}

updateDb();
