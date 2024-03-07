const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

const db = new sqlite3.Database('dados.db');
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS itens (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT)");
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('public')); // Servir arquivos estáticos do diretório 'public'

// Middleware para lidar com a solicitação GET para o arquivo favicon.ico
app.get('/favicon.ico', (req, res) => {
    res.status(204).send();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/adicionar-item', (req, res) => {
    const itemName = req.body.itemName;

    const sql = `INSERT INTO itens (nome) VALUES (?)`;
    db.run(sql, [itemName], (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ success: false, error: "Erro ao adicionar item." });
            return;
        }
        console.log('Item adicionado ao banco de dados:', itemName);
        res.status(200).json({ success: true, itemName: itemName });
    });
});

app.get('/consultar-item', (req, res) => {
    const row = req.query.row;

    const sql = `SELECT * FROM itens WHERE id = ?`;

    db.get(sql, [row], (err, row) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ success: false, error: "Erro ao consultar item no banco de dados." });
            return;
        }

        if (!row) {
            console.error('Item não encontrado para id:', row);
            res.status(404).json({ success: false, error: "Item não encontrado." });
            return;
        }

        const itemValue = row.nome; // Alterado para acessar o campo 'nome'
        console.log('Valor do item:', itemValue);
        res.status(200).json({ success: true, itemValue: itemValue });
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
