import { createContext, useContext, useState, useCallback, useRef } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const contador = useRef(0);

    const showToast = useCallback((mensaje, tipo = "error") => {
        const id = ++contador.current;
        setToasts(prev => [...prev, { id, mensaje, tipo }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Contenedor de toasts — global, siempre visible */}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2
                            pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl
                                    shadow-lg text-sm font-medium max-w-sm
                                    pointer-events-auto animate-in slide-in-from-bottom-2
                                    ${t.tipo === "error"
                                ? "bg-red-50 border border-red-200 text-red-700"
                                : t.tipo === "warning"
                                    ? "bg-amber-50 border border-amber-200 text-amber-700"
                                    : "bg-green-50 border border-green-200 text-green-700"
                            }`}>
                        <svg className="w-4 h-4 flex-shrink-0" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            {t.tipo === "error" || t.tipo === "warning" ? (
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M5 13l4 4L19 7" />
                            )}
                        </svg>
                        {t.mensaje}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast debe usarse dentro de ToastProvider");
    return context;
}