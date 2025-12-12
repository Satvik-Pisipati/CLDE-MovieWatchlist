import { createContext, useContext } from "react";
import { apiFetch } from "../api/client";
 
const RatingsContext = createContext();
 
export function RatingsProvider({ children }) {

  async function rateItem(item, rating) {

    await apiFetch("/watchlist", {

      method: "POST",

      body: JSON.stringify({

        ...item,

        itemId: item.id,

        rating,

      }),

    });

  }
 
  return (
<RatingsContext.Provider value={{ rateItem }}>

      {children}
</RatingsContext.Provider>

  );

}
 
export function useRatings() {

  return useContext(RatingsContext);

}
 