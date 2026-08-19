// Mockup data for users authentication and SaaS plans

// Calculate a recent date for João Silva (e.g. 3 days ago -> 12 days remaining out of 15)
const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

export const initialUsers = [
  // Administrador Geral
  {
    id: 99,
    name: 'Administrador Geral',
    email: 'admin@daterra.com',
    password: 'admin123',
    role: 'admin',
    createdAt: '2024-01-01',
    plan: 'admin',
    productLimit: 9999
  },

  // Produtor Padrão (Em período de testes)
  {
    id: 1,
    name: 'João Silva',
    email: 'joao@daterra.com',
    password: 'admin123',
    role: 'producer',
    createdAt: threeDaysAgo,
    plan: 'free',
    productLimit: 10
  },
 
  // Cliente Padrão
  {
    id: 3,
    name: 'Carlos Oliveira',
    email: 'carlos@email.com',
    password: 'cliente123',
    role: 'client',
    createdAt: '2024-05-10',
    plan: 'free',
    productLimit: 0
  }
];

// Mock activities log
export const initialActivities = [
  {
    id: 1,
    userId: 3,
    userName: 'Carlos Oliveira',
    action: 'purchase',
    details: 'Comprou Mel Silvestre 500g (2x)',
    timestamp: '2024-06-09T10:30:00'
  },
  {
    id: 3,
    userId: 3,
    userName: 'Carlos Oliveira',
    action: 'purchase',
    details: 'Comprou Tomate Orgânico kg (1x)',
    timestamp: '2024-06-09T11:45:00'
  }
];
