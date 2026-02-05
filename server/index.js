const express = require('express');
const cors = require('cors');
const openDb = require('./db');
const listaPalavras = require('./bancoDePalavras');
const listaFrases = require('./bancoDeFrases'); // Importa as frases

const app = express();
app.use(express.json());
app.use(cors());

// --- ROTAS DE PALAVRAS (cards) ---
app.get('/cards', async (req, res) => {
    const db = await openDb();
    const cards = await db.all('SELECT * FROM cards ORDER BY id DESC');
    res.json(cards);
});

app.post('/cards', async (req, res) => {
    const { word, translation } = req.body;
    const db = await openDb();
    const result = await db.run('INSERT INTO cards (word, translation) VALUES (?, ?)', [word, translation]);
    res.json({ id: result.lastID, word, translation });
});

app.post('/seed', async (req, res) => {
    const db = await openDb();
    const existing = await db.all('SELECT word FROM cards');
    const existingWords = existing.map(c => c.word);
    
    const novas = listaPalavras.filter(item => !existingWords.includes(item.word));
    if (novas.length === 0) return res.json({ message: "Sem palavras novas." });

    const sorteadas = novas.sort(() => 0.5 - Math.random()).slice(0, 5);
    for (const card of sorteadas) {
        await db.run('INSERT INTO cards (word, translation) VALUES (?, ?)', [card.word, card.translation]);
    }
    res.json({ message: "Palavras adicionadas!" });
});

// --- NOVAS ROTAS DE FRASES (phrases) ---
app.get('/phrases', async (req, res) => {
    const db = await openDb();
    const phrases = await db.all('SELECT * FROM phrases ORDER BY id DESC');
    res.json(phrases);
});

app.post('/phrases', async (req, res) => {
    const { word, translation } = req.body;
    const db = await openDb();
    const result = await db.run('INSERT INTO phrases (word, translation) VALUES (?, ?)', [word, translation]);
    res.json({ id: result.lastID, word, translation });
});

app.post('/seed-phrases', async (req, res) => {
    const db = await openDb();
    const existing = await db.all('SELECT word FROM phrases');
    const existingPhrases = existing.map(c => c.word);
    
    // Filtra frases que ainda não temos
    const novas = listaFrases.filter(item => !existingPhrases.includes(item.word));
    
    if (novas.length === 0) return res.json({ message: "Sem frases novas." });

    const sorteadas = novas.sort(() => 0.5 - Math.random()).slice(0, 5);
    for (const phrase of sorteadas) {
        await db.run('INSERT INTO phrases (word, translation) VALUES (?, ?)', [phrase.word, phrase.translation]);
    }
    res.json({ message: "Frases adicionadas!" });
});

app.listen(3001, () => {
    console.log('🔥 Servidor Fullstack rodando na porta 3001');
});