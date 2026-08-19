// Mockup data for DaTerra application

export const initialProducts = [
  { id: 1, name: 'Mel Silvestre 500g', category: 'Mel', price: 25.00 },
  { id: 2, name: 'Alface Maço', category: 'Verduras', price: 3.50 },
  { id: 3, name: 'Tomate Orgânico kg', category: 'Legumes', price: 12.00 },
  { id: 4, name: 'Ovos de Capa (dúzia)', category: 'Ovos', price: 18.00 },
  { id: 5, name: 'Cenoura kg', category: 'Legumes', price: 6.00 },
  { id: 6, name: 'Morangos 500g', category: 'Frutas', price: 15.00 },
];

export const initialStock = [
  { id: 1, product_id: 1, current_quantity: 12, harvest_date: '2024-05-15' },
  { id: 2, product_id: 2, current_quantity: 3, harvest_date: '2024-06-08' },
  { id: 3, product_id: 3, current_quantity: 8, harvest_date: '2024-06-07' },
  { id: 4, product_id: 4, current_quantity: 20, harvest_date: '2024-06-05' },
  { id: 5, product_id: 5, current_quantity: 4, harvest_date: '2024-06-09' },
  { id: 6, product_id: 6, current_quantity: 2, harvest_date: '2024-06-08' },
];

export const initialSales = [
  {
    id: 1,
    date: '2024-06-01',
    total_value: 43.50,
    items: [
      { product_id: 1, product_name: 'Mel Silvestre 500g', quantity: 1, price: 25.00 },
      { product_id: 2, product_name: 'Alface Maço', quantity: 2, price: 3.50 },
      { product_id: 5, product_name: 'Cenoura kg', quantity: 1, price: 6.00 },
    ]
  },
  {
    id: 2,
    date: '2024-06-05',
    total_value: 55.00,
    items: [
      { product_id: 4, product_name: 'Ovos de Capa (dúzia)', quantity: 2, price: 18.00 },
      { product_id: 6, product_name: 'Morangos 500g', quantity: 1, price: 15.00 },
    ]
  },
  {
    id: 3,
    date: '2024-06-08',
    total_value: 30.00,
    items: [
      { product_id: 3, product_name: 'Tomate Orgânico kg', quantity: 2, price: 12.00 },
      { product_id: 2, product_name: 'Alface Maço', quantity: 1, price: 3.50 },
    ]
  },
];
