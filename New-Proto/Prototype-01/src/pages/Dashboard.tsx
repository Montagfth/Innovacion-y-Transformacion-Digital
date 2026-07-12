import React from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Comprobamos la ruta actual para saber qué botón marcar como activo
    const isOrdersActive = location.pathname.endsWith('/orders');
    const isNewOrderActive = location.pathname.endsWith('/new-order');
    const isAnalyticsActive = !isOrdersActive && !isNewOrderActive;

    const handleLogout = () => {
        navigate('/');
    };

    return (
        <div className="dashboard-page">
            {/* --- NAVBAR SUPERIOR --- */}
            <nav className="dashboard-nav">
                <div className="nav-brand">
                    <strong>Impresiones Express</strong>
                    <span>Sistema Inteligente ML</span>
                </div>
                <div className="nav-menu">
                    <button
                        className={`nav-btn ${!isOrdersActive ? 'active' : ''}`}
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
                    <button className={`nav-btn ${isNewOrderActive ? 'active' : ''}`}
                        onClick={() => navigate('/dashboard/new-order')}>
                        Nuevo Pedido

                    </button>
                    <button className="nav-btn" disabled>
                        Reportes (In progress)
                    </button>
                </div>
                <div className="nav-user">
                    <span className="user-badge">A</span>
                    <span>admin@admin.com</span>
                    <button className="btn-logout" onClick={handleLogout}>Salir</button>
                </div>
            </nav>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <main className="dashboard-content">
                {/* Aquí React Router inyectará de forma automática AnalyticsSection u OrdersSection */}
                <Outlet />
            </main>
        </div>
    );
};