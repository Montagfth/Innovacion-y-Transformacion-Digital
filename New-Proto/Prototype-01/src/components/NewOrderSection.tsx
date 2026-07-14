import React, { useState } from 'react';
// Importamos el archivo de estilos dedicado
import './NewOrderSection.css';
// Importamos directamente las funciones de tu servicio de órdenes
import { createOrder } from '../services/OrderServices';

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
    const [error, setError] = useState<string | null>(null);

    // Estados de Control para la Inserción SQL en Turso
    const [saving, setSaving] = useState<boolean>(false);
    const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

    // 1. Manejo del cálculo paralelo de los tres modelos de ML
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);
        setUsedAlgorithm('');
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
            console.log("🤖 Consultando y comparando algoritmos de Machine Learning...");
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

            const optimalResponse = validResponses.reduce((prev, current) => {
                const prevValue = Number(prev.data.prediction ?? prev.data.estimated_time ?? prev.data);
                const currValue = Number(current.data.prediction ?? current.data.estimated_time ?? current.data);
                return currValue > prevValue ? current : prev;
            });

            const rawPrediction = optimalResponse.data.prediction ?? optimalResponse.data.estimated_time ?? optimalResponse.data;
            const positivePrediction = Math.max(1, Number(rawPrediction));
            const finalPredictionInteger = Math.round(positivePrediction);

            console.log(`%c📊 ALGORITMO GANADOR: ${optimalResponse.model} | Tiempo estimado original: ${rawPrediction} -> Ajustado a entero: ${finalPredictionInteger} horas`, "color: #007bff; font-weight: bold; font-size: 13px;");

            setUsedAlgorithm(optimalResponse.model);

            setResult({
                ...optimalResponse.data,
                prediction: finalPredictionInteger
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

        const newOrderData = {
            client: clienteName.trim(),
            job_type: jobType,
            quantity: quantity,
            size: size,
            material: material,
            is_colored: isColored,
            estimated_time: predictionValue,
            status: 'Producción' as const
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
                                            Algoritmo óptimo: {usedAlgorithm}
                                        </span>
                                    </div>
                                )}

                                {/* Panel central de tiempos */}
                                <div className="macos-result-card">
                                    <span className="macos-result-card-label">Tiempo Estimado</span>
                                    <strong className="macos-result-card-value">
                                        {result.prediction} {result.prediction === 1 ? 'minuto' : 'minutos'}
                                    </strong>
                                    <span className="macos-result-card-note">
                                        Ajustado bajo criterio de escenario seguro
                                    </span>
                                </div>

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