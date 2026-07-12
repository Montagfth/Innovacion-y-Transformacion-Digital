import React, { useState } from 'react';
// Importamos directamente las funciones de tu servicio de órdenes
import { createOrder } from '../services/OrderServices';

export const NewOrderSection: React.FC = () => {
    // Estados del Formulario de Entrada
    const [jobType, setJobType] = useState<string>('Banner');
    const [quantity, setQuantity] = useState<number>(0);
    const [size, setSize] = useState<string>('A2');
    const [material, setMaterial] = useState<string>('Bond');
    const [isColored, setIsColored] = useState<boolean>(false);

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
        setSaveSuccess(false); // Reseteamos éxito si el operario vuelve a calcular

        const models = ['linear_regression', 'random_forest', 'decision_tree'];

        const requests = models.map(modelName => {
            const url = `https://proyecto-desarrollo-jmfd.onrender.com/prediction?job_type=${jobType}&quantity=${quantity}&size=${size}&material=${material}&isColored=${isColored}&model=${modelName}`;
            return fetch(url).then(async res => {
                if (!res.ok) throw new Error(`Error en modelo ${modelName}`);
                const data = await res.json();
                return { model: modelName, data };
            });
        });

        try {
            console.log("Evaluando algoritmos ML en paralelo de forma automatizada...");
            const responses = await Promise.all(requests);

            // Selección automática del primer resultado con clave de predicción válida
            const optimalResponse = responses.find(r => r.data.prediction !== undefined) || responses[0];

            console.log(`%c ALGORITMO SELECCIONADO AUTOMÁTICAMENTE: ${optimalResponse.model}`, "color: #007bff; font-weight: bold; font-size: 12px;");

            setUsedAlgorithm(optimalResponse.model);
            setResult(optimalResponse.data);
        } catch (err: any) {
            console.error("Error en la predicción automatizada:", err);
            setError('Error al procesar la predicción automática con los modelos ML.');
        } finally {
            setLoading(false);
        }
    };

    // 2. Manejo del botón "Registrar Pedido" usando tu función de OrderServices
    const handleRegisterOrder = async () => {
        if (!result) return;

        setSaving(true);
        setError(null);

        // Convertimos el string/number de la predicción de forma segura
        const predictionValue = result.prediction !== undefined ? Number(result.prediction) : 0;

        // Estructuramos el objeto respetando la firma de tu backend omitiendo el 'id'
        const newOrderData = {
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

            // Ejecución directa contra la base de datos distribuida
            await createOrder(newOrderData);

            setSaveSuccess(true);
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
                        <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} min="1" style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }} />
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
                <div className="prediction-result" style={{ background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h3 style={{ marginTop: 0, borderBottom: '2px solid #eee', paddingBottom: '0.5rem' }}>📥 Resultado del Modelo ML</h3>

                    {loading && (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                            <p>Procesando variables en el backend...</p>
                        </div>
                    )}

                    {error && (
                        <div style={{ color: '#721c24', background: '#f8d7da', padding: '1rem', borderRadius: '4px', marginTop: '1rem' }}>
                            <strong>⚠️ Detalle:</strong> {error}
                        </div>
                    )}

                    {!loading && !result && !error && (
                        <p style={{ color: '#888', textAlign: 'center', fontStyle: 'italic', padding: '2rem' }}>
                            Modifica los campos de la izquierda y presiona "Predecir Tiempo".
                        </p>
                    )}

                    {result && (
                        <div style={{ marginTop: '1rem' }}>
                            <div style={{ background: '#e2f0d9', padding: '1.5rem', borderRadius: '6px', textAlign: 'center', marginBottom: '1.5rem' }}>
                                <span style={{ fontSize: '0.9rem', color: '#385723', display: 'block' }}>Tiempo Estimado de Production</span>
                                <strong style={{ fontSize: '2.5rem', color: '#385723' }}>
                                    {result.estimated_time !== undefined
                                        ? `${Number(result.estimated_time).toFixed(2)} min`
                                        : 'Calculando...'}
                                </strong>
                            </div>

                            {/* CONTROL DE INTERFAZ DEL BOTÓN RECIÉN CREADO */}
                            {saveSuccess ? (
                                <div style={{ background: '#d4edda', color: '#155724', padding: '1rem', borderRadius: '4px', textAlign: 'center', marginBottom: '1.5rem', fontWeight: 'bold' }}>
                                    🎉 ¡Pedido registrado con éxito en Turso!
                                </div>
                            ) : (
                                <button
                                    onClick={handleRegisterOrder}
                                    disabled={saving}
                                    style={{ width: '100%', padding: '1rem', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', marginBottom: '1.5rem', boxShadow: '0 4px 6px rgba(40,167,69,0.2)' }}
                                >
                                    {saving ? 'Guardando en la base de datos...' : '💾 Registrar Pedido en Turso'}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};