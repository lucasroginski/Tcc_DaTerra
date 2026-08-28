import mysql from 'mysql2/promise';

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'daterra_db'
    });
    console.log('Successfully connected to daterra_db.');
    
    const [rows] = await connection.query('SELECT * FROM users');
    console.log('Users in DB:');
    console.log(rows);
    
    await connection.end();
  } catch (error) {
    console.error('Error connecting to database:');
    console.error(error.message);
  }
}

testConnection();
