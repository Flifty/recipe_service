import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthModal } from '../components/AuthModal';

const navItems = [
    { label: 'Рецепты', path: '/' },
    { label: 'Избранное', path: '/favorites' },
    { label: 'Недавно просмотренные', path: '/recently-viewed' },
    { label: 'Профиль', path: '/profile' },
    { label: 'Умный поиск', path: '/smart-search' },
];

interface CurrentUser {
    id?: number;
    username: string;
    email: string;
}

function getInitialUser(): CurrentUser | null {
    const raw = localStorage.getItem('currentUser');

    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw) as CurrentUser;
    } catch {
        localStorage.removeItem('currentUser');
        return null;
    }
}

export function MainLayout() {
    const location = useLocation();
    const navigate = useNavigate();

    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(getInitialUser());
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    useEffect(() => {
        const handleAuthChanged = () => {
            setCurrentUser(getInitialUser());
        };

        window.addEventListener('auth-state-changed', handleAuthChanged);

        return () => {
            window.removeEventListener('auth-state-changed', handleAuthChanged);
        };
    }, []);

    const notifyAuthChanged = () => {
        window.dispatchEvent(new Event('auth-state-changed'));
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('currentUser');

        setCurrentUser(null);
        setIsUserMenuOpen(false);
        notifyAuthChanged();
        navigate('/');
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                width: '100%',
                backgroundColor: 'transparent',
                fontFamily: 'Arial, sans-serif',
            }}
        >
            <header
                style={{
                    height: '72px',
                    width: '100%',
                    backgroundColor: '#2f241d',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 28px',
                    boxSizing: 'border-box',
                    position: 'relative',
                    zIndex: 50,
                }}
            >
                <Link
                    to="/"
                    className="interactive-link"
                    style={{
                        color: '#fff',
                        textDecoration: 'none',
                        fontSize: '24px',
                        fontWeight: 700,
                    }}
                >
                    Recipe App
                </Link>

                {currentUser ? (
                    <div
                        onMouseEnter={() => setIsUserMenuOpen(true)}
                        onMouseLeave={() => setIsUserMenuOpen(false)}
                        style={{
                            position: 'relative',
                            padding: '8px 0',
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => setIsUserMenuOpen((prev) => !prev)}
                            style={{
                                color: '#fff',
                                background: 'transparent',
                                border: 'none',
                                fontSize: '18px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                padding: '8px 12px',
                                borderRadius: '8px',
                            }}
                        >
                            {currentUser.username}
                        </button>

                        {isUserMenuOpen && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    minWidth: '210px',
                                    paddingTop: '8px',
                                    zIndex: 100,
                                }}
                            >
                                <div
                                    style={{
                                        backgroundColor: '#fffdf9',
                                        color: '#111',
                                        borderRadius: '12px',
                                        boxShadow: '0 8px 22px rgba(0, 0, 0, 0.18)',
                                        padding: '8px',
                                        border: '1px solid #d9c2a7',
                                    }}
                                >
                                    <div
                                        style={{
                                            padding: '8px 10px',
                                            borderBottom: '1px solid #ead9c4',
                                            marginBottom: '6px',
                                        }}
                                    >
                                        <div style={{ fontWeight: 700 }}>
                                            {currentUser.username}
                                        </div>

                                        <div
                                            style={{
                                                fontSize: '13px',
                                                color: '#666',
                                                marginTop: '2px',
                                                wordBreak: 'break-word',
                                            }}
                                        >
                                            {currentUser.email}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        style={{
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: 'transparent',
                                            cursor: 'pointer',
                                            fontSize: '15px',
                                            color: '#b00020',
                                        }}
                                    >
                                        Выйти
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAuthOpen(true)}
                        className="topbar-auth-button"
                        style={{
                            color: '#fff',
                            background: 'transparent',
                            border: 'none',
                            fontSize: '18px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            padding: '8px 12px',
                            borderRadius: '8px',
                        }}
                    >
                        Войти
                    </button>
                )}
            </header>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '240px 1fr',
                    minHeight: 'calc(100vh - 72px)',
                    width: '100%',
                }}
            >
                <aside
                    style={{
                        backgroundColor: 'rgba(255, 253, 249, 0.92)',
                        borderRight: '1px solid #ead9c4',
                        padding: '24px 18px',
                        boxSizing: 'border-box',
                    }}
                >
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className="side-nav-link"
                                    style={{
                                        textDecoration: 'none',
                                        color: isActive ? '#111' : '#555',
                                        fontWeight: isActive ? 700 : 500,
                                        backgroundColor: isActive ? '#f4eadc' : 'transparent',
                                        padding: '12px 14px',
                                        borderRadius: '10px',
                                    }}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                <main style={{ padding: 0, boxSizing: 'border-box', width: '100%' }}>
                    <Outlet />
                </main>
            </div>

            <AuthModal
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                onAuthSuccess={(user) => {
                    setCurrentUser(user);
                    setIsUserMenuOpen(false);
                    notifyAuthChanged();
                }}
            />
        </div>
    );
}