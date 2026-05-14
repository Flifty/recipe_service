import { useState } from 'react';
import axios from 'axios';
import { loginUser, registerUser } from '../api/auth';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAuthSuccess: (user: { id: number; username: string; email: string }) => void;
}

type AuthTab = 'login' | 'register';

interface BackendErrorResponse {
    message?: string;
    payload?: unknown;
    success?: boolean;
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
    const [activeTab, setActiveTab] = useState<AuthTab>('login');

    const [loginValue, setLoginValue] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const [registerUsername, setRegisterUsername] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) {
        return null;
    }

    const translateErrorMessage = (message: string) => {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('password is invalid')) {
            return 'Пароль слишком ненадёжный. Придумайте более сложный пароль: минимум 6 символов, большая буква, маленькая буква и цифра.';
        }

        if (lowerMessage.includes('invalid email or password')) {
            return 'Неверная почта или пароль.';
        }

        if (lowerMessage.includes('passwords do not match')) {
            return 'Пароли не совпадают.';
        }

        if (lowerMessage.includes('user with email') && lowerMessage.includes('already exists')) {
            return 'Пользователь с такой почтой уже существует.';
        }

        if (lowerMessage.includes('user with username') && lowerMessage.includes('already exists')) {
            return 'Пользователь с таким именем уже существует.';
        }

        if (lowerMessage.includes('must be a well-formed email address')) {
            return 'Введите корректную почту.';
        }

        if (lowerMessage.includes('bad credentials')) {
            return 'Неверная почта или пароль.';
        }

        return message;
    };

    const extractErrorMessage = (e: unknown, fallback: string) => {
        if (axios.isAxiosError(e)) {
            const responseData = e.response?.data as BackendErrorResponse | string | undefined;

            if (typeof responseData === 'string' && responseData.trim()) {
                return translateErrorMessage(responseData);
            }

            if (responseData && typeof responseData === 'object' && 'message' in responseData) {
                const message = responseData.message;

                if (typeof message === 'string' && message.trim()) {
                    return translateErrorMessage(message);
                }
            }

            return `Ошибка ${e.response?.status ?? ''}`.trim();
        }

        if (e instanceof Error && e.message.trim()) {
            return translateErrorMessage(e.message);
        }

        return fallback;
    };

    const handleLogin = async () => {
        try {
            setLoading(true);
            setError('');

            const data = await loginUser(loginValue.trim(), loginPassword);

            if (!data.success || !data.payload) {
                throw new Error(data.message || 'Не удалось выполнить вход');
            }

            localStorage.setItem('token', data.payload.token);
            localStorage.setItem('refreshToken', data.payload.refreshToken);
            localStorage.setItem(
                'currentUser',
                JSON.stringify({
                    id: data.payload.id,
                    username: data.payload.username,
                    email: data.payload.email,
                })
            );

            onAuthSuccess({
                id: data.payload.id,
                username: data.payload.username,
                email: data.payload.email,
            });

            onClose();
        } catch (e) {
            setError(extractErrorMessage(e, 'Не удалось выполнить вход'));
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        try {
            setLoading(true);
            setError('');

            const data = await registerUser(
                registerUsername.trim(),
                registerEmail.trim(),
                registerPassword,
                registerConfirmPassword
            );

            if (!data.success || !data.payload) {
                throw new Error(data.message || 'Не удалось выполнить регистрацию');
            }

            localStorage.setItem('token', data.payload.token);
            localStorage.setItem('refreshToken', data.payload.refreshToken);
            localStorage.setItem(
                'currentUser',
                JSON.stringify({
                    id: data.payload.id,
                    username: data.payload.username,
                    email: data.payload.email,
                })
            );

            onAuthSuccess({
                id: data.payload.id,
                username: data.payload.username,
                email: data.payload.email,
            });

            onClose();
        } catch (e) {
            setError(extractErrorMessage(e, 'Не удалось выполнить регистрацию'));
        } finally {
            setLoading(false);
        }
    };

    const passwordFieldWrapperStyle = {
        position: 'relative' as const,
        width: '100%',
    };

    const passwordInputStyle = {
        width: '100%',
        padding: '14px 48px 14px 16px',
        fontSize: '16px',
        borderRadius: '10px',
        border: '1px solid #d0d0d0',
        boxSizing: 'border-box' as const,
    };

    const eyeButtonStyle = {
        position: 'absolute' as const,
        top: '50%',
        right: '12px',
        transform: 'translateY(-50%)',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        fontSize: '18px',
        lineHeight: 1,
        padding: '4px',
    };

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px',
                boxSizing: 'border-box',
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '100%',
                    maxWidth: '560px',
                    backgroundColor: '#fff',
                    borderRadius: '20px',
                    padding: '28px',
                    boxSizing: 'border-box',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '22px',
                    }}
                >
                    <h2 style={{ margin: 0, fontSize: '36px' }}>Recipe App</h2>

                    <button
                        onClick={onClose}
                        style={{
                            border: 'none',
                            background: 'transparent',
                            fontSize: '28px',
                            cursor: 'pointer',
                            lineHeight: 1,
                        }}
                    >
                        ×
                    </button>
                </div>

                <div
                    style={{
                        display: 'flex',
                        gap: '28px',
                        borderBottom: '1px solid #ddd',
                        marginBottom: '24px',
                    }}
                >
                    <button
                        onClick={() => {
                            setActiveTab('login');
                            setError('');
                        }}
                        style={{
                            border: 'none',
                            background: 'transparent',
                            padding: '0 0 12px 0',
                            cursor: 'pointer',
                            fontSize: '20px',
                            fontWeight: activeTab === 'login' ? 700 : 400,
                            borderBottom: activeTab === 'login' ? '3px solid #4d6bff' : '3px solid transparent',
                            color: activeTab === 'login' ? '#111' : '#888',
                        }}
                    >
                        Вход
                    </button>

                    <button
                        onClick={() => {
                            setActiveTab('register');
                            setError('');
                        }}
                        style={{
                            border: 'none',
                            background: 'transparent',
                            padding: '0 0 12px 0',
                            cursor: 'pointer',
                            fontSize: '20px',
                            fontWeight: activeTab === 'register' ? 700 : 400,
                            borderBottom: activeTab === 'register' ? '3px solid #4d6bff' : '3px solid transparent',
                            color: activeTab === 'register' ? '#111' : '#888',
                        }}
                    >
                        Регистрация
                    </button>
                </div>

                {error && (
                    <div
                        style={{
                            marginBottom: '16px',
                            padding: '12px 14px',
                            borderRadius: '10px',
                            backgroundColor: '#fff2f2',
                            color: '#b00020',
                            fontSize: '15px',
                        }}
                    >
                        {error}
                    </div>
                )}

                {activeTab === 'login' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <input
                            value={loginValue}
                            onChange={(e) => setLoginValue(e.target.value)}
                            placeholder="Email"
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                fontSize: '16px',
                                borderRadius: '10px',
                                border: '1px solid #d0d0d0',
                                boxSizing: 'border-box',
                            }}
                        />

                        <div style={passwordFieldWrapperStyle}>
                            <input
                                type={showLoginPassword ? 'text' : 'password'}
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                placeholder="Пароль"
                                style={passwordInputStyle}
                            />

                            <button
                                type="button"
                                onClick={() => setShowLoginPassword((prev) => !prev)}
                                style={eyeButtonStyle}
                            >
                                {showLoginPassword ? '🙈' : '👁'}
                            </button>
                        </div>

                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="interactive-button primary-button"
                            style={{
                                marginTop: '8px',
                                width: '100%',
                                padding: '14px 18px',
                                borderRadius: '10px',
                                border: 'none',
                                backgroundColor: '#4d6bff',
                                color: '#fff',
                                fontSize: '18px',
                                fontWeight: 700,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1,
                            }}
                        >
                            {loading ? 'Выполняем вход...' : 'Войти'}
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <input
                            value={registerUsername}
                            onChange={(e) => setRegisterUsername(e.target.value)}
                            placeholder="Имя пользователя"
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                fontSize: '16px',
                                borderRadius: '10px',
                                border: '1px solid #d0d0d0',
                                boxSizing: 'border-box',
                            }}
                        />

                        <input
                            value={registerEmail}
                            onChange={(e) => setRegisterEmail(e.target.value)}
                            placeholder="Email"
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                fontSize: '16px',
                                borderRadius: '10px',
                                border: '1px solid #d0d0d0',
                                boxSizing: 'border-box',
                            }}
                        />

                        <div style={passwordFieldWrapperStyle}>
                            <input
                                type={showRegisterPassword ? 'text' : 'password'}
                                value={registerPassword}
                                onChange={(e) => setRegisterPassword(e.target.value)}
                                placeholder="Пароль"
                                style={passwordInputStyle}
                            />

                            <button
                                type="button"
                                onClick={() => setShowRegisterPassword((prev) => !prev)}
                                style={eyeButtonStyle}
                            >
                                {showRegisterPassword ? '🙈' : '👁'}
                            </button>
                        </div>

                        <div style={passwordFieldWrapperStyle}>
                            <input
                                type={showRegisterConfirmPassword ? 'text' : 'password'}
                                value={registerConfirmPassword}
                                onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                                placeholder="Подтвердите пароль"
                                style={passwordInputStyle}
                            />

                            <button
                                type="button"
                                onClick={() => setShowRegisterConfirmPassword((prev) => !prev)}
                                style={eyeButtonStyle}
                            >
                                {showRegisterConfirmPassword ? '🙈' : '👁'}
                            </button>
                        </div>

                        <button
                            onClick={handleRegister}
                            disabled={loading}
                            className="interactive-button primary-button"
                            style={{
                                marginTop: '8px',
                                width: '100%',
                                padding: '14px 18px',
                                borderRadius: '10px',
                                border: 'none',
                                backgroundColor: '#4d6bff',
                                color: '#fff',
                                fontSize: '18px',
                                fontWeight: 700,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1,
                            }}
                        >
                            {loading ? 'Регистрируем...' : 'Зарегистрироваться'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}