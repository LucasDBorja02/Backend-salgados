import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Teste de conexão (só loga se der certo)
pool
  .connect()
  .then(() => console.log("✅ Conectado ao PostgreSQL com sucesso!"))
  .catch((err) => console.error("❌ Erro ao conectar ao banco:", err.message));
