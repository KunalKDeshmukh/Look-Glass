import React, { createContext, useCallback, useContext, useState } from "react";

interface Toast {
  id: number;
  message: string;
  tone: "default" | "error";
}

interface ToastContextValue {
  notify: (message: string, tone?: "default" | "error") => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);
let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((message: string, tone: "default" | "error" = "default") => {
    const id = nextId++;
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-xs">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`font-sans text-sm px-4 py-3 shadow-lg border animate-riseIn ${
              t.tone === "error" ? "bg-[#2A1616] text-[#EDEAE2] border-[#8B3A3A]" : "bg-[#17161A] text-[#EDEAE2] border-[#17161A]"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
