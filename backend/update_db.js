import db from './config/database.js';

async function updateDb() {
  try {
    await db.query("ALTER TABLE daterra_db.sales ADD COLUMN tipo_entrega VARCHAR(50) DEFAULT 'fiorino', ADD COLUMN valor_frete DECIMAL(10, 2) DEFAULT 0.00;");
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
