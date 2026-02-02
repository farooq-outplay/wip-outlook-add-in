import React, { createContext, useContext } from "react";
import { Mode } from "../../utility/enums/common.enum";

type AppContextType = {
  mode: Mode;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

type AppProviderProps = {
  children: React.ReactNode;
  value: AppContextType;
};

export const AppProvider = ({ children, value }: AppProviderProps) => {
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

/**
 * Custom Hook (BEST PRACTICE)
 */
export const useAppContext = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider");
  }

  return context;
};
