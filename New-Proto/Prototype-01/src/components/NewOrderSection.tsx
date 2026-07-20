import React, { useState } from 'react';
// Importamos el archivo de estilos dedicado
import './NewOrderSection.css';
// Importamos directamente las funciones de tu servicio de órdenes
import { createOrder } from '../services/OrderServices';

// Pesos de confianza histórica de cada modelo (similar a Random Forest)
// Estos valores se ajustan según el rendimiento observado de cada algoritmo
const MODEL_CONFIDENCE_WEIGHTS: Record<string, number> = {
    'random_forest': 0.45,
    'decision_tree': 0.30,
    'linear_regression': 0.25
};

// Función para calcular el promedio ponderado (ensemble) de las predicciones
const calculateWeightedEnsemble = (
    responses: Array<{ model: string; data: any }>
): {
    weightedPrediction: number;
    winnerModel: string;
    confidence: number;
    allPredictions: Array<{ model: string; value: number; weight: number; weightedValue: number }>;
} => {
    const validPredictions = responses
        .filter(r => r.data !== null)
        .map(r => {
            const value = Number(r.data.prediction ?? r.data.estimated_time ?? r.data);
            const weight = MODEL_CONFIDENCE_WEIGHTS[r.model] || 0.33;
            return {
                model: r.model,
                value,
                weight,
                weightedValue: value * weight
            };
        })
        .filter(p => !isNaN(p.value) && p.value > 0);

    if (validPredictions.length === 0) {
        return { weightedPrediction: 0, winnerModel: 'N/A', confidence: 0, allPredictions: [] };
    }

    // Calcular promedio ponderado
    const totalWeight = validPredictions.reduce((sum, p) => sum + p.weight, 0);
    const weightedPrediction = validPredictions.reduce((sum, p) => sum + p.weightedValue, 0) / totalWeight;

    // El "ganador" es el modelo cuya predicción está más cerca del promedio ponderado
    const winner = validPredictions.reduce((closest, current) => {
        const distCurrent = Math.abs(current.value - weightedPrediction);
        const distClosest = Math.abs(closest.value - weightedPrediction);
        return distCurrent < distClosest ? current : closest;
    });

    // Confianza basada en la consistencia entre modelos (diversidad de predicciones)
    const predictions = validPredictions.map(p => p.value);
    const mean = predictions.reduce((s, v) => s + v, 0) / predictions.length;
    const variance = predictions.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / predictions.length;
    const cv = Math.sqrt(variance) / Math.max(mean, 1); // Coeficiente de variación
    const confidence = Math.max(0, Math.min(100, Math.round((1 - cv) * 100)));

    return {
        weightedPrediction,
        winnerModel: winner.model,
        confidence,
        allPredictions: validPredictions
    };
};

export const NewOrderSection: React.FC = () => {
    // Estados del Formulario de Entrada
    const [jobType, setJobType] = useState<string>('Banner');
    const [quantity, setQuantity] = useState<number>(1);
    const [size, setSize] = useState<string>('A2');
    const [material, setMaterial] = useState<string>('Bond');
    const [isColored, setIsColored] = useState<boolean>(false);

    const [clienteName, setClienteName] = useState('');

    // Estados de Control para la API de Predicción ML (Paralelo)
    const [loading, setLoading] = useState<boolean>(false);
    const [result, setResult] = useState<any>(null);
    const [usedAlgorithm, setUsedAlgorithm] = useState<string>('');
    const [predictionConfidence, setPredictionConfidence] = useState<number>(0);
    const [modelBreakdown, setModelBreakdown] = useState<Array<{ model: string; value: number; weight: number }>>([]);
    const [error, setError] = useState<string | null>(null);

    // Estados de Control para la Inserción SQL en Turso
    const [saving, setSaving] = useState<boolean>(false);
    const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

    // 1. Manejo del cálculo paralelo de los tres modelos de ML con ensemble ponderado
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);
        setUsedAlgorithm('');
        setPredictionConfidence(0);
        setModelBreakdown([]);
        setSaveSuccess(false);

        const models = ['linear_regression', 'random_forest', 'decision_tree'];

        const requests = models.map(modelName => {
            const url = `https://proyecto-desarrollo-jmfd.onrender.com/prediction?job_type=${jobType}&quantity=${quantity}&size=${size}&material=${material}&isColored=${isColored}&model=${modelName}`;

            return fetch(url)
                .then(async res => {
                    if (!res.ok) {
                        console.warn(`⚠️ El modelo ${modelName} respondió con status: ${res.status}`);
                        return { model: modelName, data: null };
                    }
                    const data = await res.json();
                    return { model: modelName, data };
                })
                .catch(err => {
                    console.error(`❌ Error de conexión con el modelo ${modelName}:`, err);
                    return { model: modelName, data: null };
                });
        });

        try {
            console.log("🤖 Consultando y comparando algoritmos de Machine Learning (Ensemble Ponderado)...");
            const responses = await Promise.all(requests);

            console.log("🔍 Respuestas crudas del servidor:", responses);

            const validResponses = responses.filter(r => {
                if (!r.data) return false;
                const hasPrediction = r.data.prediction !== undefined || r.data.estimated_time !== undefined || typeof r.data === 'number';
                return hasPrediction;
            });

            if (validResponses.length === 0) {
                console.error("Ninguna respuesta cumplió el criterio de tipado. Estructura recibida:", responses);
                throw new Error("El servidor de predicciones no retornó un formato numérico válido en este momento.");
            }

            // Aplicar lógica de ensemble ponderado (inspirada en Random Forest)
            const ensemble = calculateWeightedEnsemble(validResponses);

            console.log("📊 Resultado del ensemble ponderado:", {
                prediccionPonderada: ensemble.weightedPrediction,
                modeloGanador: ensemble.winnerModel,
                confianza: ensemble.confidence,
                desglose: ensemble.allPredictions
            });

            if (ensemble.weightedPrediction <= 0) {
                throw new Error("No se pudo calcular una predicción válida con los modelos disponibles.");
            }

            const finalPredictionInteger = Math.round(Math.max(1, ensemble.weightedPrediction));

            console.log(`%c📊 ENSEMBLE PONDERADO (Random Forest Style) | Predicción final: ${finalPredictionInteger} min | Modelo representativo: ${ensemble.winnerModel} | Confianza: ${ensemble.confidence}%`, "color: #007bff; font-weight: bold; font-size: 13px;");

            setUsedAlgorithm(ensemble.winnerModel);
            setPredictionConfidence(ensemble.confidence);
            setModelBreakdown(ensemble.allPredictions);

            setResult({
                prediction: finalPredictionInteger,
                ensemble_used: true,
                confidence: ensemble.confidence
            });

        } catch (err: any) {
            console.error("Error en el flujo de predicción comparativa:", err);
            setError(err.message || 'Error al procesar y comparar los modelos ML en el servidor.');
        } finally {
            setLoading(false);
        }
    };

    // 2. Manejo del botón "Registrar Pedido" usando tu función de OrderServices
    const handleRegisterOrder = async () => {
        if (!result) return;

        if (!clienteName.trim()) {
            setError("Debe ingresar el nombre del cliente!");
            return;
        }

        setSaving(true);
        setError(null);

        const predictionValue = result.prediction !== undefined ? Number(result.prediction) : 1;

        // Detección de prioridad: si el nombre inicia con "Empresa" o "empresa" → prioridad 1
        const clientNameTrimmed = clienteName.trim();
        const isEmpresa = clientNameTrimmed.toLowerCase().startsWith('empresa');
        const orderPriority = isEmpresa ? 1 : 0;

        if (isEmpresa) {
            console.log(`🏢 Cliente detectado como Empresa: "${clientNameTrimmed}" → Prioridad ALTA (1)`);
        }

        const newOrderData = {
            client: clientNameTrimmed,
            job_type: jobType,
            quantity: quantity,
            size: size,
            material: material,
            is_colored: isColored,
            estimated_time: predictionValue,
            status: 'Producción' as const,
            priority: orderPriority
        };

        try {
            console.log("Llamando a tu servicio createOrder con:", newOrderData);
            setSaveSuccess(true);

            await createOrder(newOrderData);

            setClienteName('');
            setResult(null);

            console.log("Flujo de guardado completado de manera exitosa.");
        } catch (err: any) {
            console.error("Fallo al registrar en Turso desde el componente:", err);
            setError(`No se pudo registrar en la base de datos: ${err.message || 'Error de escritura.'}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="macos-section">
            {/* Header del Contenido */}
            <header className="macos-section-header">
                <h1>Calcular Predicción de Pedido</h1>
                <p>Ingresa las especificaciones. El sistema evaluará el tiempo de producción y permitirá registrarlo.</p>
            </header>

            {/* Contenedor tipo Ventana de macOS */}
            <div className="macos-window">

                {/* Barra de Título */}
                <div className="macos-titlebar">
                    <div className="macos-traffic-lights">
                        <span className="macos-dot red" />
                        <span className="macos-dot yellow" />
                        <span className="macos-dot green" />
                    </div>
                    <div className="macos-window-title">Prediction Engine</div>
                </div>

                {/* Grid interno de la Ventana */}
                <div className="macos-grid">

                    {/* COLUMNA IZQUIERDA: FORMULARIO */}
                    <form onSubmit={handleSubmit} className="macos-form-panel">
                        {/* Nombre del Cliente */}
                        <div className="macos-form-group">
                            <label className="macos-label">Nombre del Cliente:</label>
                            <input
                                type="text"
                                value={clienteName}
                                onChange={(e) => setClienteName(e.target.value)}
                                placeholder="Ejemplo: Empresa ... | Cliente ..."
                                className="macos-input"
                                required
                            />
                        </div>

                        {/* Tipo de Trabajo */}
                        <div className="macos-form-group">
                            <label className="macos-label">Tipo de Trabajo:</label>
                            <select
                                value={jobType}
                                onChange={(e) => setJobType(e.target.value)}
                                className="macos-select"
                            >
                                <option value="Banner">Banner</option>
                                <option value="Documento">Documento</option>
                                <option value="Flyer">Flyer (Afiche)</option>
                                <option value="Plano">Plano</option>
                                <option value="Tarjeta">Tarjeta</option>
                            </select>
                        </div>

                        {/* Grid: Cantidad y Tamaño */}
                        <div className="macos-form-row">
                            <div className="macos-form-group">
                                <label className="macos-label">Cantidad:</label>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                                    min="1"
                                    className="macos-input"
                                />
                            </div>

                            <div className="macos-form-group">
                                <label className="macos-label">Tamaño:</label>
                                <select
                                    value={size}
                                    onChange={(e) => setSize(e.target.value)}
                                    className="macos-select"
                                >
                                    <option value="A2">A2</option>
                                    <option value="A3">A3</option>
                                    <option value="A4">A4</option>
                                    <option value="Grande">Grande</option>
                                </select>
                            </div>
                        </div>

                        {/* Material */}
                        <div className="macos-form-group">
                            <label className="macos-label">Material:</label>
                            <select
                                value={material}
                                onChange={(e) => setMaterial(e.target.value)}
                                className="macos-select"
                            >
                                <option value="Bond">Bond</option>
                                <option value="Cartulina">Cartulina</option>
                                <option value="Couche">Couche</option>
                                <option value="Vinil">Vinil</option>
                            </select>
                        </div>

                        {/* Switch de Color (Estilo macOS Toggle) */}
                        <div className="macos-switch-container">
                            <label htmlFor="isColored" className="macos-switch-label">¿Es a Color?</label>
                            <label className="macos-switch">
                                <input
                                    type="checkbox"
                                    id="isColored"
                                    checked={isColored}
                                    onChange={(e) => setIsColored(e.target.checked)}
                                />
                                <span className="macos-slider"></span>
                            </label>
                        </div>

                        {/* Botón de Submit */}
                        <button
                            type="submit"
                            disabled={loading || saving}
                            className="macos-btn macos-btn-blue"
                        >
                            {loading ? 'Calculando estimación inteligente...' : '⚡ Predecir Tiempo'}
                        </button>
                    </form>

                    {/* COLUMNA DERECHA: RESULTADOS */}
                    <div className="macos-result-panel">
                        <h3 className="macos-result-title">📥 Resultado del Modelo ML</h3>

                        {/* Pantalla de Carga */}
                        {loading && (
                            <div className="macos-loading">
                                <div className="macos-spinner"></div>
                                <p>Procesando variables y comparando modelos...</p>
                            </div>
                        )}

                        {/* Gestión de Errores */}
                        {error && (
                            <div className="macos-alert macos-alert-error">
                                <span className="macos-alert-dot" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Estado inicial / Sin resultados */}
                        {!loading && !result && !error && !saveSuccess && (
                            <div className="macos-empty-state">
                                <div className="macos-empty-icon">📊</div>
                                <p>Modifica los campos de la izquierda y presiona "Predecir Tiempo".</p>
                            </div>
                        )}

                        {/* Éxito al Registrar */}
                        {saveSuccess && (
                            <div className="macos-alert macos-alert-success">
                                <span className="macos-alert-dot" />
                                <span>¡Pedido registrado con éxito en Turso!</span>
                            </div>
                        )}

                        {/* Visualización de Resultados y botón Turso */}
                        {result && !loading && (
                            <div>
                                {/* Badge del algoritmo ganador */}
                                {usedAlgorithm && (
                                    <div className="macos-algorithm-badge">
                                        <span className="macos-badge">
                                            Ensemble Ponderado: {usedAlgorithm}
                                        </span>
                                    </div>
                                )}

                                {/* Panel de confianza del ensemble */}
                                {predictionConfidence > 0 && (
                                    <div className="macos-confidence-panel">
                                        <div className="confidence-header">
                                            <span className="confidence-label">Confianza del Ensemble</span>
                                            <span className="confidence-value">{predictionConfidence}%</span>
                                        </div>
                                        <div className="confidence-bar">
                                            <div
                                                className="confidence-bar-fill"
                                                style={{ width: `${predictionConfidence}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Panel central de tiempos */}
                                <div className="macos-result-card">
                                    <span className="macos-result-card-label">Tiempo Estimado (Ensemble)</span>
                                    <strong className="macos-result-card-value">
                                        {result.prediction} {result.prediction === 1 ? 'minuto' : 'minutos'}
                                    </strong>
                                    <span className="macos-result-card-note">
                                        Promedio ponderado de 3 modelos ML (Random Forest style)
                                    </span>
                                </div>

                                {/* Desglose de predicciones por modelo */}
                                {modelBreakdown.length > 0 && (
                                    <div className="macos-model-breakdown">
                                        <span className="breakdown-title">Desglose por Modelo:</span>
                                        {modelBreakdown.map((item, index) => (
                                            <div key={index} className="breakdown-item">
                                                <span className="breakdown-model">{item.model}</span>
                                                <span className="breakdown-value">{Math.round(item.value)} min</span>
                                                <span className="breakdown-weight">Peso: {(item.weight * 100).toFixed(0)}%</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Botón de Persistencia en Turso */}
                                <button
                                    onClick={handleRegisterOrder}
                                    disabled={saving}
                                    className="macos-btn macos-btn-green"
                                >
                                    {saving ? 'Guardando en la base de datos...' : '💾 Registrar Pedido'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};