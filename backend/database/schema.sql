-- =========================================================================
--                     SISTEMA DATERRA - SCHEMA DO BANCO DE DADOS
-- =========================================================================
-- Este arquivo descreve a estrutura física do banco de dados relacional MySQL.
-- Ele foi projetado seguindo as normas da modelagem relacional, aplicando
-- chaves primárias (PK), chaves estrangeiras (FK) para integridade referencial,
-- e tipos de dados apropriados para garantir eficiência.

CREATE DATABASE IF NOT EXISTS daterra_db;
USE daterra_db;

-- 1. TABELA DE USUÁRIOS
-- =========================================================================
-- Armazena os dados cadastrais tanto de produtores quanto de clientes.
-- A role (função/papel) define o nível de permissão no frontend/backend.
-- =========================================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE, -- Unique garante que não haja e-mails duplicados
    password VARCHAR(255) NOT NULL,    -- Senha criptografada (hash) em ambiente real
    role ENUM('client', 'producer', 'admin') DEFAULT 'client' NOT NULL, -- Perfil de acesso
    plan ENUM('free', 'vip') DEFAULT 'free' NOT NULL, -- Modelo de negócios SaaS
    product_limit INT DEFAULT 10 NOT NULL, -- Limite de cadastro de produtos no estoque do produtor
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABELA DE PRODUTOS
-- =========================================================================
-- Armazena as informações básicas sobre os produtos que são oferecidos.
-- =========================================================================
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL, -- DECIMAL evita problemas de precisão de floats
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABELA DE ESTOQUE (Relação 1:1 com Products)
-- =========================================================================
-- Mantém o controle de quantidade física dos produtos e datas de colheita.
-- ON DELETE CASCADE garante que se o produto for deletado, seu estoque também será.
-- =========================================================================
CREATE TABLE IF NOT EXISTS stock (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL UNIQUE, -- UNIQUE para garantir relacionamento 1:1 físico
    current_quantity INT NOT NULL DEFAULT 0,
    harvest_date DATE, -- Data da última colheita (vital para produtos frescos)
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABELA DE VENDAS (Mestre)
-- =========================================================================
-- Armazena o cabeçalho das vendas efetuadas (Faturamento, Data, Método).
-- =========================================================================
CREATE TABLE IF NOT EXISTS sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_value DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('pix', 'cash') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TABELA DE ITENS DE VENDA (Detalhe - Relação N:M)
-- =========================================================================
-- Relação n para m entre vendas e produtos (tabela de junção).
-- Armazena quais produtos foram comprados e a que preço unitário (para manter
-- histórico mesmo se o preço do produto no catálogo mudar).
-- =========================================================================
CREATE TABLE IF NOT EXISTS sale_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL, -- Histórico financeiro inalterável
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. TABELA DE ATIVIDADES DOS CLIENTES
-- =========================================================================
-- Log de auditoria e monitoramento de atividades (logs de visualização e compras).
-- Essencial para o módulo do Produtor ver o engajamento dos clientes.
-- =========================================================================
CREATE TABLE IF NOT EXISTS client_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT, -- Não tem FK obrigatória para não perder o log caso o usuário seja deletado
    user_name VARCHAR(100) NOT NULL,
    action ENUM('purchase', 'view_product', 'login', 'logout', 'register', 'upgrade_vip', 'buy_limit') NOT NULL,
    details TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
--                       DADOS DE EXEMPLO (SEEDS)
-- =========================================================================

-- Inserir Usuários (Produtores e Clientes)
INSERT INTO users (name, email, password, role, plan, product_limit) VALUES
('João Silva (Produtor)', 'joao@daterra.com', 'admin123', 'producer', 'free', 10),
('Maria Souza (Produtor)', 'maria@daterra.com', 'admin123', 'producer', 'vip', 20),
('Carlos Oliveira', 'carlos@email.com', 'cliente123', 'client', 'free', 0),
('Ana Martins', 'ana@email.com', 'cliente123', 'client', 'free', 0);

-- Inserir Produtos Iniciais
INSERT INTO products (name, category, price) VALUES
('Mel Silvestre Orgânico 500g', 'Mel e Derivados', 35.00),
('Alface Crespa Orgânica Maço', 'Hortifruti', 4.50),
('Tomate Italiano Orgânico 1kg', 'Hortifruti', 12.00),
('Queijo Minas Artesanal 600g', 'Laticínios', 28.00);

-- Inserir Estoque Associado (IDs 1, 2, 3, 4)
INSERT INTO stock (product_id, current_quantity, harvest_date) VALUES
(1, 15, '2026-08-10'),
(2, 30, '2026-08-13'),
(3, 4, '2026-08-12'), -- Estoque baixo para testar alertas
(4, 8, '2026-08-11');
