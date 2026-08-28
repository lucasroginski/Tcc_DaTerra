import db from './config/database.js';

async function updateDb() {
  try {
    await db.query(`ALTER TABLE daterra_db.sales 
      ADD COLUMN client_name VARCHAR(100) DEFAULT '',
      ADD COLUMN client_phone VARCHAR(20) DEFAULT '',
      ADD COLUMN delivery_address VARCHAR(255) DEFAULT '',
      ADD COLUMN delivery_status ENUM('pendente', 'em_rota', 'entregue') DEFAULT 'pendente';`);
    console.log("Database updated successfully");
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log("Columns already exist, skipping...");
    } else {
      console.error("Error updating database:", error);
    }
  } finally {
    process.exit();
  }
}

updateDb();
