import { createContext, useContext, useEffect, useState } from "react";

import GetAPI from "./GetAPI";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [data, setData] = useState([]);

  const overAllData = GetAPI("api/v1/admin/order-navigation-counts");

  useEffect(() => {
    if (overAllData?.data?.data) {
      setData(overAllData?.data?.data);
    }
  }, [overAllData]);

  return (
    <CartContext.Provider value={{ data }}>{children}</CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
