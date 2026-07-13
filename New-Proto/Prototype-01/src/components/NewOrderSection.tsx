import React, { useState } from 'react';
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

        // Los tres algoritmos disponibles en tu backend de Flask/FastAPI
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

            // Imprime en la consola del navegador para ver EXACTAMENTE cómo responde tu API de Python
            console.log("🔍 Respuestas crudas del servidor:", responses);

            // Filtramos únicamente las respuestas que contengan datos válidos
            const validResponses = responses.filter(r => {
                if (!r.data) return false;
                // Verificamos si la predicción viene en 'prediction', 'estimated_time' o directo en el objeto
                const hasPrediction = r.data.prediction !== undefined || r.data.estimated_time !== undefined || typeof r.data === 'number';
                return hasPrediction;
            });

            if (validResponses.length === 0) {
                // Si la API falló en la comparación, mostramos lo que llegó para ayudarte a debugear
                console.error("Ninguna respuesta cumplió el criterio de tipado. Estructura recibida:", responses);
                throw new Error("El servidor de predicciones no retornó un formato numérico válido en este momento.");
            }

            // COMPARACIÓN DE MODELOS: Seleccionamos el modelo que arrojó la predicción más alta (escenario seguro)
            const optimalResponse = validResponses.reduce((prev, current) => {
                // Normalizamos el valor de la predicción según cómo lo llame tu backend
                const prevValue = Number(prev.data.prediction ?? prev.data.estimated_time ?? prev.data);
                const currValue = Number(current.data.prediction ?? current.data.estimated_time ?? current.data);
                return currValue > prevValue ? current : prev;
            });

            // Captura del valor crudo:
            const rawPrediction = optimalResponse.data.prediction ?? optimalResponse.data.estimated_time ?? optimalResponse.data;

            // Correccion de casos de prediccion negativos:
            const positivePrediction = Math.max(1, Number(rawPrediction));

            // Redondeo a valor de estimacion entero:
            const finalPredictionInteger = Math.round(positivePrediction);

            console.log(`%c📊 ALGORITMO GANADOR: ${optimalResponse.model} | Tiempo estimado original: ${rawPrediction} -> Ajustado a entero: ${finalPredictionInteger} horas`, "color: #007bff; font-weight: bold; font-size: 13px;");

            setUsedAlgorithm(optimalResponse.model);

            // Ajustamos el objeto final asegurando que guarde la predicción ya redondeada y sin negativos
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

        // Convertimos el string/number de la predicción de forma segura (ya viene entero del estado)
        const predictionValue = result.prediction !== undefined ? Number(result.prediction) : 1;

        // Estructuramos el objeto respetando la firma de tu backend omitiendo el 'id'
        const newOrderData = {
            client: clienteName.trim(),
            job_type: jobType,
            quantity: quantity,
            size: size,
            material: material,
            is_colored: isColored,
            estimated_time: predictionValue,
            status: 'Producción' as const // Se asume el estado de inicio automático
        };

        try {
            console.log("Llamando a tu servicio createOrder con:", newOrderData);
            setSaveSuccess(true);

            // Ejecución directa contra la base de datos distribuida
            await createOrder(newOrderData);

            // Limpieza del formulario tras registro exitoso:
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
        <div className="orders-section animate-fade-in">
            <header className="content-header">
                <div>
                    <h1>Calcular Predicción de Pedido</h1>
                    <p>Ingresa las especificaciones. El sistema evaluará el tiempo de producción y permitirá registrarlo.</p>
                </div>
            </header>

            <div className="prediction-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>

                {/* FORMULARIO DE ENTRADA */}
                <form onSubmit={handleSubmit} className="prediction-form" style={{ background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', height: 'fit-content' }}>

                    <div style={{ marginBottom: '1.2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Nombre del Cliente:</label>
                        <input type="text" value={clienteName} onChange={(e) => setClienteName(e.target.value)} placeholder="Ej. Juan Pérez" style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} required />
                    </div>

                    <div style={{ marginBottom: '1.2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Tipo de Trabajo:</label>
                        <select value={jobType} onChange={(e) => setJobType(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}>
                            <option value="Banner">Banner</option>
                            <option value="Documento">Documento</option>
                            <option value="Flyer">Flyer (Afiche)</option>
                            <option value="Plano">Plano</option>
                            <option value="Tarjeta">Tarjeta</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '1.2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Cantidad:</label>
                        <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} min="1" style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                    </div>

                    <div style={{ marginBottom: '1.2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Tamaño:</label>
                        <select value={size} onChange={(e) => setSize(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}>
                            <option value="A2">A2</option>
                            <option value="A3">A3</option>
                            <option value="A4">A4</option>
                            <option value="Grande">Grande</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '1.2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Material:</label>
                        <select value={material} onChange={(e) => setMaterial(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}>
                            <option value="Bond">Bond</option>
                            <option value="Cartulina">Cartulina</option>
                            <option value="Couche">Couche</option>
                            <option value="Vinil">Vinil</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="checkbox" id="isColored" checked={isColored} onChange={(e) => setIsColored(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                        <label htmlFor="isColored" style={{ fontWeight: 'bold', cursor: 'pointer' }}>¿Es a Color?</label>
                    </div>

                    <button type="submit" disabled={loading || saving} style={{ width: '100%', padding: '0.85rem', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                        {loading ? 'Calculando estimación inteligente...' : '⚡ Predecir Tiempo'}
                    </button>
                </form>

                {/* VISTA DE RESULTADOS Y PANEL DE ACCIÓN TURSO */}
                <div className="prediction-result" style={{ background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: 'fit-content' }}>
                    <h3 style={{ marginTop: 0, borderBottom: '2px solid #eee', paddingBottom: '0.5rem' }}>📥 Resultado del Modelo ML</h3>

                    {loading && (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                            <p>Procesando variables en el backend y comparando modelos...</p>
                        </div>
                    )}

                    {error && (
                        <div style={{ color: '#721c24', background: '#f8d7da', padding: '1rem', borderRadius: '4px', marginTop: '1rem' }}>
                            <strong>⚠️ Detalle:</strong> {error}
                        </div>
                    )}

                    {!loading && !result && !error && !saveSuccess && (
                        <p style={{ color: '#888', textAlign: 'center', fontStyle: 'italic', padding: '2rem' }}>
                            Modifica los campos de la izquierda y presiona "Predecir Tiempo".
                        </p>
                    )}

                    {saveSuccess && (
                        <div style={{ background: '#d4edda', color: '#155724', padding: '1.5rem', borderRadius: '6px', textAlign: 'center', fontWeight: 'bold' }}>
                            🎉 ¡Pedido registrado con éxito en la base de datos!
                        </div>
                    )}

                    {result && !loading && (
                        <div style={{ marginTop: '1rem' }}>
                            <div style={{ background: '#e2f0d9', padding: '1.5rem', borderRadius: '6px', textAlign: 'center', marginBottom: '1.5rem' }}>
                                <span style={{ fontSize: '0.9rem', color: '#385723', display: 'block', marginBottom: '0.2rem' }}>
                                    Tiempo Estimado
                                </span>
                                <strong style={{ fontSize: '2.2rem', color: '#385723' }}>
                                    {result.prediction} {result.prediction === 1 ? 'minuto' : 'minutos'}
                                </strong>
                            </div>

                            <button
                                onClick={handleRegisterOrder}
                                disabled={saving}
                                style={{ width: '100%', padding: '1rem', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', boxShadow: '0 4px 6px rgba(40,167,69,0.2)' }}
                            >
                                {saving ? 'Guardando en la base de datos...' : '💾 Registrar Pedido en Turso'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};