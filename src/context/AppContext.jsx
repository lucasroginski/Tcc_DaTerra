import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [currentScreen, setCurrentScreen] = useState('catalog');

  // Load products from API
  const fetchProducts = async () => {
    try {
      let url = 'http://localhost:5000/api/products';
      if (currentUser?.role === 'producer') {
        url += `?producerId=${currentUser.id}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      
      const formattedData = data.map(product => ({
        ...product,
        price: parseFloat(product.price),
        promo_price: product.promo_price ? parseFloat(product.promo_price) : null
      }));
      
      setProducts(formattedData);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  const fetchSales = async () => {
    try {
      let url = 'http://localhost:5000/api/sales';
      if (currentUser?.role === 'producer') {
        url += `?producerId=${currentUser.id}`;
      }
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setSales(data);
      }
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSales();
  }, [currentUser]);

  // E-commerce Cart & Drawer State
  const [cart, setCart] = useState([]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Add new product
  const addProduct = async (product) => {
    if (!currentUser) return;
    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: product.name,
          category: product.category,
          price: product.price,
          isPromo: product.isPromo,
          promoPrice: product.promoPrice,
          producerId: currentUser.id
        })
      });
      if (response.ok) {
        fetchProducts(); // Refresh list
      }
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
    }
  };

  // Update existing product
  const updateProduct = async (productId, updatedData) => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updatedData.name,
          category: updatedData.category,
          price: updatedData.price,
          isPromo: updatedData.isPromo,
          promoPrice: updatedData.promoPrice
        })
      });
      if (response.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
    }
  };

  // Delete product and its associated stock
  const deleteProduct = async (productId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
    }
  };



  // E-commerce Cart Operations
  const addToCart = (product, quantity = 1) => {
    const availableStock = getProductStock(product.id);
    if (availableStock <= 0) return false;

    const existingIndex = cart.findIndex(item => item.product_id === product.id);

    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      const newQty = Math.min(currentQty + quantity, availableStock);
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity = newQty;
      setCart(updatedCart);
    } else {
      setCart([
        ...cart,
        {
          product_id: product.id,
          product_name: product.name,
          category: product.category,
          price: product.price,
          quantity: Math.min(quantity, availableStock)
        }
      ]);
    }
    return true;
  };

  const updateCartQuantity = (productId, newQuantity) => {
    const availableStock = getProductStock(productId);
    const validQty = Math.max(0, Math.min(newQuantity, availableStock));

    if (validQty === 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.product_id === productId
          ? { ...item, quantity: validQty }
          : item
      ));
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalCartItemsCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalCartPrice = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Create a new sale
  const createSale = async (saleItems = cart, paymentMethod = 'pix') => {
    try {
      // Calculate total value for notification
      const totalValue = saleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const response = await fetch('http://localhost:5000/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: saleItems, paymentMethod })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao finalizar venda');

      // Refresh data from server
      await fetchProducts();
      await fetchSales();

      // Add sale notification
      const itemsSummary = saleItems.map(item => `${item.quantity}x ${item.product_name}`).join(', ');
      const newNotif = {
        id: Date.now(),
        title: 'Nova Venda Recebida! 💰',
        message: `Total: R$ ${totalValue.toFixed(2)} - Itens: ${itemsSummary}`,
        type: 'sale',
        timestamp: new Date().toISOString(),
        read: false
      };
      setNotifications(prev => [newNotif, ...prev]);

      return data;
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      throw error;
    }
  };

  // Add stock to a product
  const addStock = async (productId, quantity, harvestDate) => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity, harvestDate })
      });
      if (response.ok) {
        await fetchProducts();
      }
    } catch (error) {
      console.error('Erro ao adicionar estoque:', error);
    }
  };

  // Get stock for a product
  const getProductStock = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.current_quantity : 0;
  };

  // Get low stock items (less than 5 units)
  const getLowStockItems = () => {
    return products
      .filter(item => item.current_quantity !== undefined && item.current_quantity !== null && item.current_quantity < 5)
      .map(item => ({
        product_id: item.id,
        current_quantity: item.current_quantity,
        harvest_date: item.harvest_date,
        product_name: item.name
      }));
  };

  // Get monthly sales revenue
  const getMonthlyRevenue = () => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const monthlySales = sales.filter(sale => sale.date.startsWith(currentMonth));
    return monthlySales.reduce((sum, sale) => sum + sale.total_value, 0);
  };

  // Get total sales count
  const getTotalSalesCount = () => {
    return sales.length;
  };

  const value = {
    products,
    sales,
    currentScreen,
    cart,
    cartDrawerOpen,
    setCurrentScreen,
    setCartDrawerOpen,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    getTotalCartItemsCount,
    getTotalCartPrice,
    addProduct,
    updateProduct,
    deleteProduct,
    addStock,
    createSale,
    getProductStock,
    getLowStockItems,
    getMonthlyRevenue,
    getTotalSalesCount,
    notifications,
    setNotifications
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
