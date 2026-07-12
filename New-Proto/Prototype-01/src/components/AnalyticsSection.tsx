import React from 'react';

export const AnalyticsSection: React.FC = () => {
    return (
        <>
            <header className="content-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Analítica en tiempo real de tu producción</p>
                </div>
                <span className="badge-live">En Vivo</span>
            </header>

            {/* Tarjetas de Métricas */}
            <section className="metrics-grid">
                <div className="metric-card">
                    <div className="card-header"><span>📊</span> <span className="trend positive">+12%</span></div>
                    <h2>90</h2>
                    <p>Pedidos Totales</p>
                </div>
                <div className="metric-card">
                    <div className="card-header"><span>🔄</span> <span className="trend positive">+3</span></div>
                    <h2>25</h2>
                    <p>En Producción</p>
                </div>
                <div className="metric-card">
                    <div className="card-header"><span>📦</span> <span className="trend positive">+8</span></div>
                    <h2>17</h2>
                    <p>Completados</p>
                </div>
                <div className="metric-card">
                    <div className="card-header"><span>⚡</span> <span className="trend positive">+2%</span></div>
                    <h2>66%</h2>
                    <p>Precisión ML</p>
                </div>
            </section>

            {/* Tarjetas de Ingresos */}
            <section className="income-grid">
                <div className="income-card history">
                    <span>$ Histórico</span>
                    <h2>S/ 21,250</h2>
                    <p>Ingresos estimados acumulados</p>
                </div>
                <div className="income-card projection">
                    <span>Proyección</span>
                    <h2>S/ 112,500</h2>
                    <p>Estimado próximo mes</p>
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