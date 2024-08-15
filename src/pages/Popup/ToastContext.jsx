import React, { createContext, useState, useContext, useEffect } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const [visible, setVisible] = useState(false);

  const triggerToast = (message, duration = 2000) => {
    setToast(message);
    setVisible(true);
    setTimeout(() => setVisible(false), duration);
    setTimeout(() => setToast(null), duration + 300); 
  };

  return (
    <ToastContext.Provider value={{ triggerToast }}>
      {children}
      {toast && (
        <div
          className={` bg-white toast p-2 text-md fixed bottom-1 rounded-sm left-1/2 transform -translate-x-1/2 transition-all ease-in-out duration-200 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {toast}
        </div>
      )}
    </ToastContext.Provider>
  );
};
