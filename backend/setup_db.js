import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306,
      multipleStatements: true
    });

    console.log('Conectado ao MySQL na porta 3306.');

    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    await connection.query(schemaSql);

    // Garantir coluna safra_pro caso a tabela users já existisse antes
    try {
      await connection.query('ALTER TABLE `Tcc-DaTerra`.users ADD COLUMN safra_pro BOOLEAN DEFAULT FALSE');
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e;
    }

    console.log('Banco Tcc-DaTerra e tabelas configurados com sucesso!');

    const [tables] = await connection.query('SHOW TABLES FROM `Tcc-DaTerra`');
    console.log('Tabelas em Tcc-DaTerra:', tables.map(t => Object.values(t)[0]));
  } catch (error) {
    console.error('Erro ao configurar o banco de dados:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

setupDatabase();
