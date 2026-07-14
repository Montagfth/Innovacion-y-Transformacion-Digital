import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Referencias para calcular la posición física del indicador dinámico
    const menuRef = useRef<HTMLDivElement>(null);
    const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({
        left: 0,
        width: 0,
        opacity: 0
    });

    const isOrdersActive = location.pathname.endsWith('/orders');
    const isNewOrderActive = location.pathname.endsWith('/new-order');
    const isReportsActive = location.pathname.endsWith('/reports');
    const isAnalyticsActive = !isOrdersActive && !isNewOrderActive && !isReportsActive;

    const handleLogout = () => {
        navigate('/');
    };

    // Efecto para calcular y mover el indicador de fondo con físicas fluidas
    useEffect(() => {
        if (menuRef.current) {
            const activeBtn = menuRef.current.querySelector('.nav-btn.active') as HTMLElement;
            if (activeBtn) {
                setIndicatorStyle({
                    left: `${activeBtn.offsetLeft}px`,
                    width: `${activeBtn.offsetWidth}px`,
                    opacity: 1
                });
            } else {
                setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
            }
        }
    }, [location.pathname]); // Se dispara cada vez que cambia la ruta

    return (
        <div className="dashboard-page">
            {/* --- NAVBAR SUPERIOR FLOTANTE PREMIUM --- */}
            <header className="dashboard-nav-container">
                <nav className="dashboard-nav">
                    {/* Sección Marca */}
                    <div className="nav-brand" onClick={() => navigate('/dashboard')}>
                        <div className="brand-logo-icon">
                            <span className="logo-dot blue"></span>
                            <span className="logo-dot green"></span>
                        </div>
                        <div className="brand-text">
                            <strong>Impresiones Express</strong>
                            <span>Sistema Inteligente</span>
                        </div>
                    </div>

                    {/* Menú de Navegación con Indicador Deslizante */}
                    <div className="nav-menu-wrapper">
                        <div className="nav-menu" ref={menuRef}>
                            {/* La burbuja mágica que se desliza por detrás de los botones */}
                            <div className="nav-indicator-glow" style={indicatorStyle} />

                            <button
                                className={`nav-btn ${isAnalyticsActive ? 'active' : ''}`}
                                onClick={() => navigate('/dashboard')}
                            >
                                Principal
                            </button>
                            <button
                                className={`nav-btn ${isOrdersActive ? 'active' : ''}`}
                                onClick={() => navigate('/dashboard/orders')}
                            >
                                Pedidos
                            </button>
                            <button
                                className={`nav-btn ${isNewOrderActive ? 'active' : ''}`}
                                onClick={() => navigate('/dashboard/new-order')}
                            >
                                Nuevo Pedido
                            </button>
                            <button
                                className={`nav-btn ${isReportsActive ? 'active' : ''}`}
                                onClick={() => navigate('/dashboard/reports')}
                            >
                                Reportes
                            </button>
                        </div>
                    </div>

                    {/* Perfil de Usuario & Salida */}
                    <div className="nav-user">
                        <div className="user-profile-card">
                            <div className="avatar-fallback">A</div>
                            <div className="user-info">
                                <span className="user-email">admin@admin.com</span>
                                <span className="user-role">Administrador</span>
                            </div>
                        </div>
                        <button className="btn-logout" onClick={handleLogout}>
                            <span>Salir</span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="logout-icon">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                        </button>
                    </div>
                </nav>
            </header>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <main className="dashboard-content">
                <Outlet />
            </main>
        </div>
    );
};