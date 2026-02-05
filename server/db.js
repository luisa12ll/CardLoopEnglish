// server/db.js
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

async function openDb() {
    return open({
        filename: './database.db',
        driver: sqlite3.Database
    });
}

(async () => {
    const db = await openDb();
    
    // Tabela de Palavras
    await db.exec(`
        CREATE TABLE IF NOT EXISTS cards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            word TEXT,
            translation TEXT
        )
    `);

    // --- NOVA TABELA DE FRASES ---
    await db.exec(`
        CREATE TABLE IF NOT EXISTS phrases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            word TEXT, /* Aqui guardamos a frase em inglês */
            translation TEXT
        )
    `);
    
    console.log("💾 Banco de dados SQLite pronto (Palavras + Frases)!");
})();

module.exports = openDb;