// =========================================================================
//                  CONFIGURAÇÃO DE CONEXÃO COM O BANCO DE DADOS
// =========================================================================
// O que faz: Configura e exporta um pool de conexões com o MySQL.
// Por que foi implementado assim: O uso de "connection pooling" evita o custo
// computacional de abrir e fechar uma conexão física TCP/IP para cada rota acionada.
// O pool mantém conexões pré-abertas reutilizáveis, melhorando o throughput da API.
// Além disso, utilizamos a interface baseada em Promises do mysql2 para permitir
// o uso do padrão modernizado async/await do ES6+.

import mysql from 'mysql2/promise';

// Configuração dos parâmetros de conexão obtidos via variáveis de ambiente
// ou defaults locais caso não configurados (fallback amigável para desenvolvimento local)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'daterra_db',
  waitForConnections: true,
  connectionLimit: 10, // Máximo de conexões simultâneas ativas no pool
  queueLimit: 0        // Sem limites para a fila de conexões aguardando liberação
});

// Comentários Didáticos sobre Métodos de Pool:
// - pool.getConnection(): Retorna uma conexão individual para transações ACID manuais.
// - pool.query(): Executa uma query rápida pegando e liberando uma conexão automaticamente.

export default pool;
