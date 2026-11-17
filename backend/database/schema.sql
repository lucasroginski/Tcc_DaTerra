-- =========================================================================
--                     SISTEMA DATERRA - SCHEMA DO BANCO DE DADOS
-- =========================================================================
-- Este arquivo descreve a estrutura física do banco de dados relacional MySQL.
-- Ele foi projetado seguindo as normas da modelagem relacional, aplicando
-- chaves primárias (PK), chaves estrangeiras (FK) para integridade referencial,
-- e tipos de dados apropriados para garantir eficiência.

CREATE DATABASE IF NOT EXISTS `Tcc-DaTerra`;
USE `Tcc-DaTerra`;

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
    safra_pro BOOLEAN DEFAULT FALSE,
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
    promo_price DECIMAL(10, 2) NULL, -- Preço com desconto promocional
    is_promo BOOLEAN DEFAULT FALSE, -- Flag para indicar se a oferta está ativa
    producer_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producer_id) REFERENCES users(id) ON DELETE CASCADE
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
    payment_method ENUM('pix', 'cash') NOT NULL,
    tipo_entrega VARCHAR(50) DEFAULT 'fiorino',
    valor_frete DECIMAL(10, 2) DEFAULT 0.00,
    client_name VARCHAR(100) DEFAULT '',
    client_phone VARCHAR(20) DEFAULT '',
    delivery_address VARCHAR(255) DEFAULT '',
    delivery_status ENUM('pendente', 'em_separacao', 'em_rota', 'entregue') DEFAULT 'pendente',
    client_id INT,
    client_hidden BOOLEAN DEFAULT FALSE
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

-- 7. TABELA DE OCORRÊNCIAS
-- =========================================================================
CREATE TABLE IF NOT EXISTS occurrences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. TABELA DE MENSAGENS (CHAT INTERNO)
-- =========================================================================
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. TABELA DE CICLOS DE PLANTIO
-- =========================================================================
CREATE TABLE IF NOT EXISTS planting_cycles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producer_id INT NOT NULL,
    culture VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    quantity VARCHAR(50) NOT NULL,
    fertilizer_type VARCHAR(50) NOT NULL,
    cover_fertilizer BOOLEAN DEFAULT FALSE,
    cover_days INT,
    pest_control VARCHAR(50) NOT NULL,
    care_days INT,
    start_date DATETIME NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    harvested_amount VARCHAR(100),
    losses VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. TABELA DE APIÁRIOS (APICULTURA)
-- =========================================================================
CREATE TABLE IF NOT EXISTS apiaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producer_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    hives_count INT NOT NULL DEFAULT 1,
    bee_type VARCHAR(100) NOT NULL,
    florada VARCHAR(100) NOT NULL,
    last_harvest_date DATETIME,
    total_harvested DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
--                       DADOS DE EXEMPLO (SEEDS)
-- =========================================================================

-- Inserir Usuários (Produtores e Clientes)
INSERT IGNORE INTO users (id, name, email, password, role, plan, product_limit) VALUES
(1, 'João Silva (Produtor)', 'joao@daterra.com', 'admin123', 'producer', 'free', 10),
(2, 'Maria Souza (Produtor)', 'maria@daterra.com', 'admin123', 'producer', 'vip', 20),
(3, 'Carlos Oliveira', 'carlos@email.com', 'cliente123', 'client', 'free', 0),
(4, 'Ana Martins', 'ana@email.com', 'cliente123', 'client', 'free', 0);

-- Inserir Produtos Iniciais
INSERT IGNORE INTO products (id, name, category, price, producer_id) VALUES
(1, 'Mel Silvestre Orgânico 500g', 'Mel e Derivados', 35.00, 1),
(2, 'Alface Crespa Orgânica Maço', 'Hortifruti', 4.50, 1),
(3, 'Tomate Italiano Orgânico 1kg', 'Hortifruti', 12.00, 2),
(4, 'Queijo Minas Artesanal 600g', 'Laticínios', 28.00, 2);

-- Inserir Estoque Associado (IDs 1, 2, 3, 4)
INSERT IGNORE INTO stock (id, product_id, current_quantity, harvest_date) VALUES
(1, 1, 15, '2026-08-10'),
(2, 2, 30, '2026-08-13'),
(3, 3, 4, '2026-08-12'), -- Estoque baixo para testar alertas
(4, 4, 8, '2026-08-11');
