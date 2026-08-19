import React, { createContext, useContext, useState } from 'react';
import { initialProducts, initialStock, initialSales } from '../data/mockData';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [products, setProducts] = useState(initialProducts);
  const [stock, setStock] = useState(initialStock);
  const [sales, setSales] = useState(initialSales);
  const [currentScreen, setCurrentScreen] = useState('catalog');

  // E-commerce Cart & Drawer State
  const [cart, setCart] = useState([]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Add new product
  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: Math.max(...products.map(p => p.id), 0) + 1
    };
    setProducts([...products, newProduct]);
    
    // Add initial stock for the new product
    const newStock = {
      id: Math.max(...stock.map(s => s.id), 0) + 1,
      product_id: newProduct.id,
      current_quantity: 0,
      harvest_date: new Date().toISOString().split('T')[0]
    };
    setStock([...stock, newStock]);
  };

  // Update existing product
  const updateProduct = (productId, updatedData) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          name: updatedData.name,
          category: updatedData.category,
          price: parseFloat(updatedData.price)
        };
      }
      return p;
    }));
  };

  // Delete product and its associated stock
  const deleteProduct = (productId) => {
    setProducts(products.filter(p => p.id !== productId));
    setStock(stock.filter(s => s.product_id !== productId));
  };

  // Add stock to a product
  const addStock = (productId, quantity, harvestDate) => {
    setStock(stock.map(item => {
      if (item.product_id === productId) {
        return {
          ...item,
          current_quantity: item.current_quantity + quantity,
          harvest_date: harvestDate || item.harvest_date
        };
      }
      return item;
    }));
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
  const createSale = (saleItems = cart) => {
    // Check if all items have sufficient stock
    for (const item of saleItems) {
      const stockItem = stock.find(s => s.product_id === item.product_id);
      if (!stockItem || stockItem.current_quantity < item.quantity) {
        throw new Error(`Estoque insuficiente para ${item.product_name}`);
      }
    }

    // Calculate total value
    const totalValue = saleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create sale record
    const newSale = {
      id: Math.max(...sales.map(s => s.id), 0) + 1,
      date: new Date().toISOString().split('T')[0],
      total_value: totalValue,
      items: saleItems
    };

    // Update stock
    const updatedStock = stock.map(item => {
      const saleItem = saleItems.find(s => s.product_id === item.product_id);
      if (saleItem) {
        return {
          ...item,
          current_quantity: item.current_quantity - saleItem.quantity
        };
      }
      return item;
    });

    setSales([...sales, newSale]);
    setStock(updatedStock);

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

    return newSale;
  };

  // Get stock for a product
  const getProductStock = (productId) => {
    const stockItem = stock.find(s => s.product_id === productId);
    return stockItem ? stockItem.current_quantity : 0;
  };

  // Get low stock items (less than 5 units)
  const getLowStockItems = () => {
    return stock.filter(item => item.current_quantity < 5).map(item => {
      const product = products.find(p => p.id === item.product_id);
      return {
        ...item,
        product_name: product ? product.name : 'Produto desconhecido'
      };
    });
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
    stock,
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
