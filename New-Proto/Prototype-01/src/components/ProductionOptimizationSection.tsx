import React, { useState, useEffect, useCallback } from 'react';
import { 
    optimizeProduction, 
    type OptimizationResult 
} from '../services/ProductionOptimizationService';
import './ProductionOptimizationSection.css';

export const ProductionOptimizationSection: React.FC = () => {
    const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'schedule' | 'machines' | 'algorithms' | 'recommendations'>('schedule');

    const fetchOptimization = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await optimizeProduction();
            setOptimization(result);
        } catch (err: unknown) {
            console.error('Error cargando optimización:', err);
            setError(err instanceof Error ? err.message : 'Error al cargar la optimización de producción');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOptimization();
    }, [fetchOptimization]);

    if (loading) {
        return (
            <div className="opt-loading-container">
                <div className="opt-shimmer"></div>
                <div className="opt-shimmer short"></div>
                <div className="opt-shimmer medium"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="opt-error-container">
                <span className="opt-error-icon">⚠️</span>
                <p>{error}</p>
                <button onClick={fetchOptimization} className="opt-retry-btn">
                    Reintentar
                </button>
            </div>
        );
    }

    if (!optimization) return null;

    const { schedules, machines, pendingOrders, metrics, recommendations, algorithmMetrics } = optimization;

    return (
        <div className="production-optimization-wrapper">
            <header className="opt-header">
                <div className="opt-header-content">
                    <h2>Optimización de Planificación de Producción</h2>
                    <p>Algoritmos: Linear Regression + Decision Tree | Asignación híbrida de pedidos</p>
                </div>
                <button onClick={fetchOptimization} className="opt-refresh-btn">
                    🔄 Actualizar
                </button>
            </header>

            <section className="opt-metrics-grid">
                <div className="opt-metric-card">
                    <span className="opt-metric-icon">📋</span>
                    <div className="opt-metric-info">
                        <strong>{metrics.totalOrders}</strong>
                        <p>Pedidos en Cola</p>
                    </div>
                </div>
                <div className="opt-metric-card">
                    <span className="opt-metric-icon">⏱️</span>
                    <div className="opt-metric-info">
                        <strong>{metrics.averageWaitTime} min</strong>
                        <p>Tiempo Prom. Espera</p>
                    </div>
                </div>
                <div className="opt-metric-card">
                    <span className="opt-metric-icon">🏭</span>
                    <div className="opt-metric-info">
                        <strong>{metrics.machineUtilization}%</strong>
                        <p>Uso de Máquinas</p>
                    </div>
                </div>
                <div className="opt-metric-card">
                    <span className="opt-metric-icon">🎯</span>
                    <div className="opt-metric-info">
                        <strong>{metrics.efficiencyGain}%</strong>
                        <p>Ganancia Eficiencia</p>
                    </div>
                </div>
            </section>

            <div className="opt-tabs">
                <button 
                    className={`opt-tab ${activeTab === 'schedule' ? 'active' : ''}`}
                    onClick={() => setActiveTab('schedule')}
                >
                    📅 Cronograma
                </button>
                <button 
                    className={`opt-tab ${activeTab === 'machines' ? 'active' : ''}`}
                    onClick={() => setActiveTab('machines')}
                >
                    🏭 Máquinas
                </button>
                <button 
                    className={`opt-tab ${activeTab === 'algorithms' ? 'active' : ''}`}
                    onClick={() => setActiveTab('algorithms')}
                >
                    🧠 Algoritmos ML
                </button>
                <button 
                    className={`opt-tab ${activeTab === 'recommendations' ? 'active' : ''}`}
                    onClick={() => setActiveTab('recommendations')}
                >
                    💡 Recomendaciones
                </button>
            </div>

            <section className="opt-content">
                {activeTab === 'schedule' && (
                    <div className="opt-schedule-panel">
                        {schedules.length === 0 ? (
                            <div className="opt-empty-state">
                                <span>📭</span>
                                <p>No hay pedidos pendientes de programación</p>
                            </div>
                        ) : (
                            <div className="opt-schedule-list">
                                {schedules.map((schedule) => (
                                    <div key={schedule.orderId} className="opt-schedule-card">
                                        <div className="schedule-header">
                                            <span className="schedule-order-id">#{schedule.orderId}</span>
                                            <span className={`schedule-priority priority-${schedule.priority.toLowerCase()}`}>
                                                {schedule.priority}
                                            </span>
                                        </div>
                                        <div className="schedule-details">
                                            <div className="schedule-time">
                                                <span className="time-label">Inicio:</span>
                                                <strong>{formatTime(schedule.startTime)}</strong>
                                            </div>
                                            <div className="schedule-time">
                                                <span className="time-label">Fin:</span>
                                                <strong>{formatTime(schedule.endTime)}</strong>
                                            </div>
                                            <div className="schedule-duration">
                                                <span>{schedule.estimatedDuration} min</span>
                                            </div>
                                        </div>
                                        <div className="schedule-footer">
                                            <span className="schedule-machine">
                                                🏭 Máquina {schedule.machineId}
                                            </span>
                                            <span className="schedule-algorithm">
                                                {schedule.algorithmUsed === 'Decision Tree' ? '🌳 DT' : '📈 LR'} ({(schedule.confidence * 100).toFixed(0)}%)
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'machines' && (
                    <div className="opt-machines-panel">
                        <div className="opt-machines-grid">
                            {machines.map((machine) => (
                                <div 
                                    key={machine.id} 
                                    className={`opt-machine-card status-${machine.status.toLowerCase()}`}
                                >
                                    <div className="machine-header">
                                        <h4>{machine.name}</h4>
                                        <span className={`machine-status-badge ${machine.status.toLowerCase()}`}>
                                            {machine.status}
                                        </span>
                                    </div>
                                    <div className="machine-metrics">
                                        <div className="machine-metric">
                                            <span>Eficiencia</span>
                                            <strong>{Math.round(machine.efficiency * 100)}%</strong>
                                        </div>
                                        <div className="machine-metric">
                                            <span>Especialidad</span>
                                            <strong>{machine.specialty.join(', ')}</strong>
                                        </div>
                                    </div>
                                    {machine.currentOrderId && (
                                        <div className="machine-current-order">
                                            <span>Procesando:</span>
                                            <strong>#{machine.currentOrderId}</strong>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'algorithms' && (
                    <div className="opt-algorithms-panel">
                        <div className="algorithm-cards-grid">
                            <div className="algorithm-card lr-card">
                                <div className="algorithm-card-header">
                                    <span className="algorithm-icon">📈</span>
                                    <h4>Linear Regression</h4>
                                    <span className="algorithm-tag">Regresión Lineal</span>
                                </div>
                                <div className="algorithm-metrics-list">
                                    <div className="algo-metric">
                                        <span>R² Score</span>
                                        <strong>{algorithmMetrics.linearRegressionR2.toFixed(4)}</strong>
                                    </div>
                                    <div className="algo-metric">
                                        <span>Precisión</span>
                                        <strong>{(algorithmMetrics.linearRegressionR2 * 100).toFixed(1)}%</strong>
                                    </div>
                                    <div className="algo-metric">
                                        <span>Muestras</span>
                                        <strong>{algorithmMetrics.trainingSamples}</strong>
                                    </div>
                                </div>
                                <div className="algorithm-description">
                                    <p>Predice el tiempo óptimo de producción usando mínimos cuadrados ordinarios (OLS) sobre las features del pedido.</p>
                                </div>
                            </div>

                            <div className="algorithm-card dt-card">
                                <div className="algorithm-card-header">
                                    <span className="algorithm-icon">🌳</span>
                                    <h4>Decision Tree</h4>
                                    <span className="algorithm-tag">Árbol de Decisión</span>
                                </div>
                                <div className="algorithm-metrics-list">
                                    <div className="algo-metric">
                                        <span>Accuracy</span>
                                        <strong>{(algorithmMetrics.decisionTreeAccuracy * 100).toFixed(1)}%</strong>
                                    </div>
                                    <div className="algo-metric">
                                        <span>Predicciones</span>
                                        <strong>{algorithmMetrics.trainingSamples}</strong>
                                    </div>
                                    <div className="algo-metric">
                                        <span>Profundidad</span>
                                        <strong>3 niveles</strong>
                                    </div>
                                </div>
                                <div className="algorithm-description">
                                    <p>Clasifica y asigna pedidos a la máquina más óptima usando umbrales de decisión sobre las características del trabajo.</p>
                                </div>
                            </div>

                            <div className="algorithm-card hybrid-card">
                                <div className="algorithm-card-header">
                                    <span className="algorithm-icon">🔗</span>
                                    <h4>Híbrido (LR + DT)</h4>
                                    <span className="algorithm-tag">Score Combinado</span>
                                </div>
                                <div className="algorithm-metrics-list">
                                    <div className="algo-metric">
                                        <span>Hybrid Score</span>
                                        <strong>{(algorithmMetrics.hybridScore * 100).toFixed(1)}%</strong>
                                    </div>
                                    <div className="algo-metric">
                                        <span>LR contribuye</span>
                                        <strong>50%</strong>
                                    </div>
                                    <div className="algo-metric">
                                        <span>DT contribuye</span>
                                        <strong>50%</strong>
                                    </div>
                                </div>
                                <div className="algorithm-description">
                                    <p>Combina las predicciones de ambos algoritmos: LR para tiempos, DT para asignación de máquinas. El score híbrido determina la confianza final.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'recommendations' && (
                    <div className="opt-recommendations-panel">
                        <div className="opt-recommendations-list">
                            {recommendations.map((rec, index) => (
                                <div key={index} className="opt-recommendation-card">
                                    <span className="recommendation-icon">💡</span>
                                    <p>{rec}</p>
                                </div>
                            ))}
                        </div>
                        
                        <div className="opt-pending-summary">
                            <h4>Pedidos Pendientes ({pendingOrders.length})</h4>
                            <div className="pending-list">
                                {pendingOrders.slice(0, 5).map((order) => (
                                    <div key={order.id} className="pending-item">
                                        <span className="pending-id">#{order.id}</span>
                                        <span className="pending-type">{order.job_type}</span>
                                        <span className="pending-qty">{order.quantity} uds</span>
                                        <span className="pending-time">{order.estimated_time} min</span>
                                    </div>
                                ))}
                                {pendingOrders.length > 5 && (
                                    <div className="pending-more">
                                        +{pendingOrders.length - 5} pedidos más...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};

function formatTime(date: Date): string {
    return date.toLocaleTimeString('es-PE', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });
}