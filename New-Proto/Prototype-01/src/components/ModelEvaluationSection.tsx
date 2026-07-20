import React, { useState, useEffect, useCallback } from 'react';
import { evaluateModels, type ModelMetrics } from '../services/ModelEvaluationService';
import './ModelEvaluationSection.css';

export const ModelEvaluationSection: React.FC = () => {
    const [evaluation, setEvaluation] = useState<ModelMetrics[]>([]);
    const [bestModel, setBestModel] = useState<string>('');
    const [totalOrders, setTotalOrders] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEvaluation = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await evaluateModels();

            setEvaluation(result.models);
            setBestModel(result.best_model);
            setTotalOrders(result.total_orders_evaluated);
        } catch (err: unknown) {
            console.error('Error cargando evaluación:', err);
            setError(err instanceof Error ? err.message : 'Error al cargar la evaluación de modelos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvaluation();
    }, [fetchEvaluation]);

    if (loading) {
        return (
            <div className="eval-loading-container">
                <div className="eval-shimmer"></div>
                <div className="eval-shimmer short"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="eval-error-container">
                <span className="eval-error-icon">⚠️</span>
                <p>{error}</p>
                <button onClick={fetchEvaluation} className="eval-retry-btn">
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="model-evaluation-wrapper">
            <header className="eval-header">
                <div className="eval-header-content">
                    <h2>Evaluación de Modelos Predictivos</h2>
                    <p>Análisis comparativo del rendimiento de los algoritmos de Machine Learning</p>
                </div>
            </header>

            <section className="eval-stats-grid">
                <div className="eval-stat-card">
                    <span className="eval-stat-icon">📊</span>
                    <div className="eval-stat-info">
                        <strong>{totalOrders}</strong>
                        <p>Pedidos Evaluados</p>
                    </div>
                </div>
                <div className="eval-stat-card">
                    <span className="eval-stat-icon">🏆</span>
                    <div className="eval-stat-info">
                        <strong>{bestModel}</strong>
                        <p>Mejor Modelo</p>
                    </div>
                </div>
                <div className="eval-stat-card">
                    <span className="eval-stat-icon">🎯</span>
                    <div className="eval-stat-info">
                        <strong>{evaluation.length}</strong>
                        <p>Modelos Comparados</p>
                    </div>
                </div>
            </section>

            <section className="eval-models-grid">
                {evaluation.map((model) => (
                    <div
                        key={model.model_name}
                        className={`eval-model-card ${model.model_name === bestModel ? 'best-model' : ''}`}
                    >
                        {model.model_name === bestModel && (
                            <span className="best-model-badge">⭐ Mejor</span>
                        )}

                        <div className="model-card-header">
                            <h3>{model.model_name}</h3>
                            <span className="model-accuracy">
                                {model.precision_pct.toFixed(1)}% precisión
                            </span>
                        </div>

                        <div className="model-metrics-grid">
                            <div className="metric-item">
                                <span className="metric-label">R² Score</span>
                                <strong className="metric-value">{model.r2_score.toFixed(3)}</strong>
                                <div className="metric-bar">
                                    <div
                                        className="metric-bar-fill r2"
                                        style={{ width: `${model.r2_score * 100}%` }}
                                    />
                                </div>
                            </div>

                            <div className="metric-item">
                                <span className="metric-label">MAE</span>
                                <strong className="metric-value">{model.mae} min</strong>
                                <div className="metric-bar">
                                    <div
                                        className="metric-bar-fill mae"
                                        style={{ width: `${Math.min(100, model.mae * 5)}%` }}
                                    />
                                </div>
                            </div>

                            <div className="metric-item">
                                <span className="metric-label">RMSE</span>
                                <strong className="metric-value">{model.rmse} min</strong>
                                <div className="metric-bar">
                                    <div
                                        className="metric-bar-fill rmse"
                                        style={{ width: `${Math.min(100, model.rmse * 4)}%` }}
                                    />
                                </div>
                            </div>

                            <div className="metric-item">
                                <span className="metric-label">Error Promedio</span>
                                <strong className="metric-value">{model.avg_error} min</strong>
                                <div className="metric-bar">
                                    <div
                                        className="metric-bar-fill error"
                                        style={{ width: `${Math.min(100, model.avg_error * 6)}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="model-predictions-count">
                            <span>{model.total_predictions} predicciones analizadas</span>
                        </div>
                    </div>
                ))}
            </section>

            <section className="eval-comparison-chart">
                <h3>Comparativa de Rendimiento</h3>
                <div className="comparison-bars">
                    {evaluation.map((model) => (
                        <div key={model.model_name} className="comparison-row">
                            <span className="comparison-label">{model.model_name}</span>
                            <div className="comparison-bar-container">
                                <div
                                    className="comparison-bar-fill"
                                    style={{
                                        width: `${model.r2_score * 100}%`,
                                        backgroundColor: model.model_name === bestModel ? 'var(--color-accent-green)' : 'var(--color-accent-blue)'
                                    }}
                                />
                                <span className="comparison-value">{(model.r2_score * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};