"use client";

import { createContext, useContext, useState } from "react";

// 1. Create the context
const DataContext = createContext();

// 2. Create the provider component
export const DataProvider = ({ children }) => {
  const [toggle, setToggle] = useState(false);
  const [newOrder, setNewOrder] = useState(false);
  const [orderData, setOrderData] = useState(false);

  const value = {
    toggle,
    setToggle,
    newOrder,
    setNewOrder,
    orderData,
    setOrderData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// 3. Custom hook to use the context
export const useDataContext = () => useContext(DataContext);
