import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  // Load orders from localStorage on mount and when user changes
  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('asmita_orders') || '[]');
    setOrders(savedOrders);
  }, [user]);

  const addOrder = (newOrder) => {
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem('asmita_orders', JSON.stringify(updatedOrders));
  };

  // Filter orders for the current user
  const userOrders = user 
    ? orders.filter(order => order.userEmail === user.email)
    : [];

  return (
    <OrderContext.Provider value={{ orders, userOrders, addOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => useContext(OrderContext);
