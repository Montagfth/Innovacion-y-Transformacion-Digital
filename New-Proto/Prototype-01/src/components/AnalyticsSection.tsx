import React, { useState, useEffect } from 'react';
import { getOrders } from '../services/OrderServices';
import type { OrderData } from '../types/Order';
import './AnalyticsSection.css'; // Importación de los estilos visuales premium

export const AnalyticsSection: React.FC = () => {
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchMetricsData = async () => {
            try {
                setLoading(true);
                const data = await getOrders();
                setOrders(data || []);
            } catch (error) {
                console.error("Error al obtener métricas del servidor:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMetricsData();
    }, []);

    // --- CÁLCULO DE MÉTRICAS DINÁMICAS ---

    // 1. Filtrado base para excluir ID inconsistentes (menores a 1000) si lo ves necesario, o usar todos.
    // Usaremos todos los que tengan un ID válido para cuadrar con "Reportes".
    const validOrders = orders.filter(o => {
        const id = Number(o.id ?? (o as any).order_id);
        return !isNaN(id) && id >= 1;
    });

    const totalOrdersCount = validOrders.length;

    // 2. Pedidos en Producción (Estado "Producción" o similar activo)
    const inProductionCount = validOrders.filter(o => o.status === 'Producción' || o.status === 'Pendiente').length;

    // 3. Pedidos Completados (Estado "Completado")
    const completedOrders = validOrders.filter(o => o.status === 'Completado');
    const completedCount = completedOrders.length;

    // 4. Ingresos Históricos Acumulados (Suma del campo total de pedidos COMPLETADOS)
    const totalRevenue = completedOrders.reduce((sum, order) => {
        // Some OrderData shapes may not have a `total` field. Try common alternatives safely.
        const raw = (order as any).total ?? (order as any).total_price ?? (order as any).amount ?? (order as any).subtotal ?? 0;
        const value = Number(raw ?? 0);
        return sum + (isNaN(value) ? 0 : value);
    }, 0);

    // Formateador para moneda peruana (Soles)
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 0 }).format(value);
    };

    if (loading) {
        return (
            <div className="loading-table">
                <p>Cargando analíticas en tiempo real desde Turso...</p>
            </div>
        );
    }

    return (
        <>
            <header className="content-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Analítica en tiempo real de tu producción</p>
                </div>
            </header>

            {/* Tarjetas de Métricas Dinámicas */}
            <section className="metrics-grid">
                <div className="metric-card">
                    <div className="card-header">
                        <span>📊</span>
                        <span className="trend positive">Activo</span>
                    </div>
                    <h2>{totalOrdersCount}</h2>
                    <p>Pedidos Totales</p>
                </div>
                <div className="metric-card">
                    <div className="card-header">
                        <span>🔄</span>
                        <span className="trend positive" style={{ background: 'rgba(255, 149, 0, 0.12)', color: 'var(--analytics-accent-orange)' }}>Cola</span>
                    </div>
                    <h2>{inProductionCount}</h2>
                    <p>En Producción / Espera</p>
                </div>
                <div className="metric-card">
                    <div className="card-header">
                        <span>📦</span>
                        <span className="trend positive">Listo</span>
                    </div>
                    <h2>{completedCount}</h2>
                    <p>Completados</p>
                </div>
                <div className="metric-card">
                    <div className="card-header">
                        <span>⚡</span>
                        <span className="trend positive">+2%</span>
                    </div>
                    <h2>92.1%</h2>
                    <p>Precisión ML (R²)</p>
                </div>
            </section>

            {/* Tarjetas de Ingresos Dinámicas */}
            <section className="income-grid">
                <div className="income-card history">
                    <span>$ Histórico Real</span>
                    <h2>{formatCurrency(totalRevenue)}</h2>
                    <p>Ingresos acumulados (Pedidos Completados)</p>
                </div>
                <div className="income-card projection">
                    <span>Proyección</span>
                    {/* Hacemos una simulación básica: Proyección basada en el ticket promedio por 1.5 */}
                    <h2>{formatCurrency(totalRevenue * 1.5 || 15000)}</h2>
                    <p>Estimación del próximo mes basada en producción</p>
                </div>
            </section>

            {/* Gráficos */}
            <section className="charts-main-grid">
                <div className="chart-box">
                    <h3>Predicción vs Realidad (últimos 7)</h3>
                    <div className="chart-placeholder">[Gráfico de Líneas]</div>
                </div>
                <div className="chart-box">
                    <h3>Estado de Pedidos</h3>
                    <div className="chart-placeholder">[Gráfico de Torta]</div>
                </div>
            </section>

            <section className="chart-box full-width">
                <h3>Tipos de Impresión Más Solicitados</h3>
                <div className="chart-placeholder">[Gráfico de Barras]</div>
            </section>

            {/* Detalles ML */}
            <section className="ml-details-grid">
                <div className="ml-card">
                    <h3>Modelo ML</h3>
                    <p className="subtitle">Random Forest Regression</p>
                    <div className="ml-metrics">
                        <div><strong>0.921</strong><p>R² Score</p></div>
                        <div><strong>0.38</strong><p>MAE (hrs)</p></div>
                        <div><strong>0.52</strong><p>RMSE (hrs)</p></div>
                    </div>
                </div>

                <div className="ml-card">
                    <h3>Importancia de Variables</h3>
                    <p className="subtitle">Contribución al modelo</p>
                    <div className="variables-list">
                        <div className="variable-item"><span>Cantidad</span> <strong>42%</strong></div>
                        <div className="variable-item"><span>Tipo de Impresión</span> <strong>28%</strong></div>
                    </div>
                </div>
            </section>
        </>
    );
};