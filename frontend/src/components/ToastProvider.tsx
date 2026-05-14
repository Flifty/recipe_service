import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextValue {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

interface ToastProviderProps {
    children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Date.now() + Math.random();

        setToasts((prev) => [
            ...prev,
            {
                id,
                message,
                type,
            },
        ]);

        window.setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 3200);
    }, []);

    const value = useMemo(() => ({ showToast }), [showToast]);

    const getToastStyles = (type: ToastType) => {
        if (type === 'success') {
            return {
                borderColor: '#7a9f45',
                backgroundColor: '#f3f8ec',
                color: '#2f4f1f',
            };
        }

        if (type === 'error') {
            return {
                borderColor: '#d93025',
                backgroundColor: '#fff1ef',
                color: '#7a1f18',
            };
        }

        return {
            borderColor: '#c9925a',
            backgroundColor: '#fff7ec',
            color: '#4a3322',
        };
    };

    return (
        <ToastContext.Provider value={value}>
            {children}

            <div
                style={{
                    position: 'fixed',
                    right: '24px',
                    bottom: '24px',
                    zIndex: 3000,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    maxWidth: '360px',
                }}
            >
                {toasts.map((toast) => {
                    const colors = getToastStyles(toast.type);

                    return (
                        <div
                            key={toast.id}
                            style={{
                                border: `1px solid ${colors.borderColor}`,
                                backgroundColor: colors.backgroundColor,
                                color: colors.color,
                                borderRadius: '14px',
                                padding: '14px 16px',
                                boxShadow: '0 10px 28px rgba(55, 37, 22, 0.16)',
                                fontSize: '15px',
                                lineHeight: 1.4,
                                fontWeight: 600,
                            }}
                        >
                            {toast.message}
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error('useToast должен использоваться внутри ToastProvider');
    }

    return context;
}