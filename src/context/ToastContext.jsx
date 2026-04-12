import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext(null);

export function useToast() {
    return useContext(ToastContext);
}

function ToastItem({ toast, onRemove }) {
    const isSuccess = toast.type === 'success';
    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className={`flex items-start gap-4 px-5 py-4 rounded-2xl border shadow-2xl backdrop-blur-md w-full pointer-events-auto ${
                isSuccess
                    ? 'bg-black/85 border-[#D4AF37]/30'
                    : 'bg-black/85 border-red-500/30'
            }`}
        >
            {/* Icon */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                isSuccess ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-red-500/20 text-red-400'
            }`}>
                {isSuccess ? '✦' : '✕'}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0 pt-0.5">
                <p className="font-sans text-xs font-bold uppercase tracking-[0.15em] text-white/90">
                    {toast.title}
                </p>
                <p className="font-sans text-sm text-white/55 mt-1 leading-relaxed">
                    {toast.message}
                </p>
            </div>

            {/* Close */}
            <button
                onClick={() => onRemove(toast.id)}
                className="text-white/25 hover:text-white/60 transition-colors text-xl leading-none flex-shrink-0 mt-0.5"
            >
                ×
            </button>
        </motion.div>
    );
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback(({ title, message, type = 'success', duration = 4500 }) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, title, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={addToast}>
            {children}
            <div className="fixed top-6 right-6 z-[300] flex flex-col gap-3 pointer-events-none w-80 max-w-[calc(100vw-3rem)]">
                <AnimatePresence initial={false}>
                    {toasts.map(toast => (
                        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}
