import React from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Comprobamos la ruta actual para saber qué botón marcar como activo
    const isOrdersActive = location.pathname.endsWith('/orders');
    const isNewOrderActive = location.pathname.endsWith('/new-order');
    const isReportsActive = location.pathname.endsWith('/reports'); // NUEVA LÍNEA

    // El botón "Principal" solo se activa si no estás en ninguna de las otras secciones
    const isAnalyticsActive = !isOrdersActive && !isNewOrderActive && !isReportsActive;

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
                <div className="nav-user">
                    <span className="user-badge">A</span>
                    <span>admin@admin.com</span>
                    <button className="btn-logout" onClick={handleLogout}>Salir</button>
                </div>
            </nav>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <main className="dashboard-content">
                {/* Aquí React Router inyectará de forma automática AnalyticsSection, OrdersSection, NewOrderSection o ReportsSection */}
                <Outlet />
            </main>
        </div>
    );
};