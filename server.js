const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Configuração do banco de dados
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'princesinhas_funk',
    port: '8080'
});

// Conectar ao banco de dados
db.connect(err => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conectado ao banco de dados MySQL');
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Rotas para Artistas
app.post('/api/artistas', (req, res) => {
    const { nome } = req.body;
    const query = 'INSERT INTO artistas (nome) VALUES (?)';
    
    db.query(query, [nome], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ id: result.insertId, nome });
    });
});

app.get('/api/artistas', (req, res) => {
    const query = 'SELECT * FROM artistas ORDER BY nome';
    
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
});

app.delete('/api/artistas/:id', (req, res) => {
    const query = 'DELETE FROM artistas WHERE id = ?';
    
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Artista excluído com sucesso' });
    });
});

// Rotas para Álbuns
app.post('/api/albuns', (req, res) => {
    const { nome, artista_id, data_lancamento } = req.body;
    const query = 'INSERT INTO albuns (nome, artista_id, data_lancamento) VALUES (?, ?, ?)';
    
    db.query(query, [nome, artista_id, data_lancamento], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ id: result.insertId, nome, artista_id, data_lancamento });
    });
});

app.get('/api/albuns', (req, res) => {
    const query = `
        SELECT a.*, art.nome as artista_nome 
        FROM albuns a 
        LEFT JOIN artistas art ON a.artista_id = art.id 
        ORDER BY a.nome
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
});

app.delete('/api/albuns/:id', (req, res) => {
    const query = 'DELETE FROM albuns WHERE id = ?';
    
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Álbum excluído com sucesso' });
    });
});

// Rotas para Músicas
app.post('/api/musicas', upload.single('arquivo'), (req, res) => {
    const { titulo, artista_id, album_id, data_lancamento } = req.body;
    const arquivo_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    const query = `
        INSERT INTO musicas (titulo, artista_id, album_id, data_lancamento, arquivo_url) 
        VALUES (?, ?, ?, ?, ?)
    `;
    
    db.query(
        query, 
        [titulo, artista_id, album_id, data_lancamento, arquivo_url],
        (err, result) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.status(201).json({
                id: result.insertId,
                titulo,
                artista_id,
                album_id,
                data_lancamento,
                arquivo_url
            });
        }
    );
});

app.get('/api/musicas', (req, res) => {
    const busca = req.query.q || '';
    const query = `
        SELECT m.*, 
               art.nome as artista_nome,
               alb.nome as album_nome
        FROM musicas m
        LEFT JOIN artistas art ON m.artista_id = art.id
        LEFT JOIN albuns alb ON m.album_id = alb.id
        WHERE m.titulo LIKE ? OR art.nome LIKE ? OR alb.nome LIKE ?
        ORDER BY m.titulo
    `;
    
    const termoBusca = `%${busca}%`;
    
    db.query(query, [termoBusca, termoBusca, termoBusca], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
});

app.delete('/api/musicas/:id', (req, res) => {
    // Primeiro, buscar a URL do arquivo para deletá-lo
    db.query('SELECT arquivo_url FROM musicas WHERE id = ?', [req.params.id], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        // Deletar o registro do banco de dados
        db.query('DELETE FROM musicas WHERE id = ?', [req.params.id], (err, result) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: 'Música excluída com sucesso' });
        });
    });
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
}); 