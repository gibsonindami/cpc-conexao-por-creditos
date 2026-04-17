// ============================================
// Inicializar o Banco de Dados
// Execute: node config/init-db.js
// ============================================

const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const host = process.env.DB_HOST || "localhost";
const user = process.env.DB_USER || "root";
const password = process.env.DB_PASSWORD || "";
const dbName = process.env.DB_NAME || "cpc";

async function initializeDatabase() {
  let connection;
  try {
    console.log("🔌 Conectando ao MySQL...");
    
    // Conectar sem especificar banco de dados
    connection = await mysql.createConnection({
      host,
      user,
      password,
    });

    console.log("✅ Conectado ao servidor MySQL!");

    // Criar banco de dados se não existir
    console.log(`📦 Criando banco de dados '${dbName}'...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✅ Banco de dados '${dbName}' pronto!`);

    // Selecionar banco de dados
    await connection.query(`USE ${dbName}`);

    // Ler arquivo SQL e executar
    const sqlPath = path.join(__dirname, "database.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    // Dividir statements e executar cada um
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith("--"));

    console.log(`\n📋 Executando ${statements.length} comandos SQL...`);

    for (const statement of statements) {
      if (statement) {
        await connection.query(statement);
      }
    }

    console.log("\n✅ Banco de dados inicializado com sucesso!");
    console.log(`🎉 Tabelas criadas: usuarios, produtos, trocas`);

  } catch (error) {
    console.error("❌ Erro ao inicializar banco de dados:", error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Executar
initializeDatabase();
