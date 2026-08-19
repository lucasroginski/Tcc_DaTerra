# DaTerra - Gestão para Produtores Regionais

Aplicação mobile-first para pequenos produtores regionais gerenciarem estoque e vendas, com sistema de autenticação para clientes e produtores.

## Funcionalidades

### Sistema de Autenticação
- **Login e Registro**: Sistema completo de autenticação para clientes e produtores
- **Dois tipos de usuários**:
  - **Clientes**: Podem comprar produtos e visualizar catálogo
  - **Produtores**: Podem gerenciar estoque, vendas e monitorar atividades dos clientes
- **Rastreamento de atividades**: Produtores podem ver o que os clientes estão fazendo (compras, visualizações, login, etc.)

### Dashboard (Início)
- Visualização da receita total do mês
- Contagem total de vendas realizadas
- Alertas de estoque baixo (itens com menos de 5 unidades)
- Ações rápidas para gerenciar estoque e iniciar vendas

### Estoque (apenas para produtores)
- Lista completa de produtos com quantidades disponíveis
- Botão "+" para adicionar estoque rapidamente
- Cadastro de novos produtos
- Visualização de data de colheita
- Indicadores visuais para estoque baixo

### Frente de Caixa/POS
- Interface intuitiva para registrar vendas
- Seleção de produtos por toque
- Ajuste de quantidade com botões +/-
- Cálculo dinâmico do total
- Confirmação de venda com atualização automática do estoque
- Prevenção de vendas com estoque insuficiente
- **Registro automático de atividades** para clientes

### Atividades dos Clientes (apenas para produtores)
- Visualização de todas as atividades dos clientes em tempo real
- Filtros por tipo de atividade (compras, visualizações, login, logout, cadastros)
- Seleção de cliente específico para ver histórico detalhado
- Estatísticas de atividades por tipo
- Timeline completa com timestamps

## Estrutura de Dados

### Produtos
- ID
- Nome (ex: "Mel Silvestre 500g", "Alface Maço")
- Categoria
- Preço de venda

### Estoque
- ID
- product_id
- current_quantity
- harvest_date

### Vendas
- ID
- date
- total_value
- items (product, quantity, price)

### Usuários
- ID
- Nome
- Email
- Senha
- Role (producer/client)
- Data de cadastro

### Atividades
- ID
- user_id
- user_name
- action (purchase, view_product, login, logout, register)
- details
- timestamp

## Paleta de Cores

- **Sage Green**: #2E5A44 (cor principal)
- **Honey Gold**: #D4A373 (cor de destaque)

## Instalação e Execução

1. Instale as dependências:
```bash
npm install
```

2. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

3. Abra o navegador no endereço mostrado no terminal (geralmente http://localhost:5173)

## Tecnologias Utilizadas

- React 18
- Vite
- TailwindCSS
- Lucide React (ícones)
- Context API (gerenciamento de estado)

## Dados de Exemplo

A aplicação já inclui dados de exemplo para teste:

### Usuários
- **Produtores**: joao@daterra.com / admin123, maria@daterra.com / admin123
- **Clientes**: carlos@email.com / cliente123, ana@email.com / cliente123, pedro@email.com / cliente123

### Outros dados
- 6 produtos cadastrados
- Estoque inicial para todos os produtos
- 3 vendas registradas
- 5 atividades de clientes registradas
- Alguns itens com estoque baixo para demonstrar os alertas

## Como Testar

1. **Como Produtor**:
   - Faça login com joao@daterra.com / admin123
   - Acesse todas as funcionalidades: Dashboard, Estoque, Vendas, Atividades
   - Na tela "Atividades", veja o que os clientes estão fazendo

2. **Como Cliente**:
   - Faça login com carlos@email.com / cliente123
   - Ou cadastre um novo cliente
   - Navegue pelos produtos e faça compras
   - Suas atividades serão registradas para os produtores visualizarem

3. **Registro de Atividades**:
   - Clientes que visualizam produtos geram logs de "view_product"
   - Clientes que compram geram logs de "purchase"
   - Login/logout são registrados automaticamente
   - Produtores podem filtrar e ver todas essas atividades
