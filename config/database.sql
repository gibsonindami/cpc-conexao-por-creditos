-- ============================================
-- 📊 CPC - Conexão Por Créditos
-- Banco de Dados para Login/Cadastro
-- ============================================

-- Tabela de Usuários (Cadastro/Login)
CREATE TABLE IF NOT EXISTS usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para buscas por email
CREATE INDEX idx_email ON usuarios(email);

-- ============================================
-- Dados de exemplo
-- ============================================
INSERT INTO usuarios (nome, email, senha)
VALUES 
('João da Silva', 'joao@email.com', '123456'),
('Maria Santos', 'maria@email.com', '123456');
