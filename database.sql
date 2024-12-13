-- Criar o banco de dados
CREATE DATABASE IF NOT EXISTS princesinhas_funk;
USE princesinhas_funk;

-- Criar tabela de artistas
CREATE TABLE IF NOT EXISTS artistas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de álbuns
CREATE TABLE IF NOT EXISTS albuns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    artista_id INT,
    data_lancamento DATE NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (artista_id) REFERENCES artistas(id)
);

-- Criar tabela de músicas
CREATE TABLE IF NOT EXISTS musicas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    artista_id INT,
    album_id INT,
    data_lancamento DATE NOT NULL,
    arquivo_url VARCHAR(255) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (artista_id) REFERENCES artistas(id),
    FOREIGN KEY (album_id) REFERENCES albuns(id)
); 