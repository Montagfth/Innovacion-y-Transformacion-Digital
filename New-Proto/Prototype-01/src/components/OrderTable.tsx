import React, { useState, useEffect } from 'react';
import type { OrderData } from '../types/Order';

interface OrdersTableProps {
    orders: OrderData[];
    loading: boolean;
    onAssignMachine?: (orderId: number, machineId: number) => Promise<void>;
    onCompleteOrder?: (orderId: number) => Promise<void>;
}

interface Maquina {
    id: number;
    nombre: string;
    estado: 'Disponible' | 'Ocupada';
    pedidoId?: number;
    tiempoEstimadoTotal?: number;
    asignadoEn?: string;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({ orders, loading, onAssignMachine, onCompleteOrder }) => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1); // Estado para la página actual
    const REGISTROS_POR_PAGINA = 25;

    const [maquinas, setMaquinas] = useState<Maquina[]>([
        { id: 1, nombre: 'Plotter Roland A', estado: 'Disponible' },
        { id: 2, nombre: 'Impresora Offset Heidel', estado: 'Disponible' },
        { id: 3, nombre: 'Impresora Láser Xerox', estado: 'Disponible' },
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setMaquinas((prevMaquinas) =>
                prevMaquinas.map((maq) => {
                    if (maq.estado === 'Ocupada' && maq.asignadoEn && maq.tiempoEstimadoTotal) {
                        const segundosTranscurridos = Math.floor((Date.now() - new Date(maq.asignadoEn).getTime()) / 1000);
                        const tiempoRestante = maq.tiempoEstimadoTotal - segundosTranscurridos;

                        if (tiempoRestante <= 0) {
                            if (maq.pedidoId && onCompleteOrder) {
                                onCompleteOrder(maq.pedidoId).catch((err) =>
                                    console.error(`Error al completar pedido #${maq.pedidoId} en Turso:`, err)
                                );
                            }
                            return {
                                ...maq,
                                estado: 'Disponible',
                                pedidoId: undefined,
                                asignadoEn: undefined,
                                tiempoEstimadoTotal: undefined
                            };
                        }
                    }
                    return maq;
                })
            );
        }, 1000);

        return () => clearInterval(interval);
    }, [onCompleteOrder]);

    // Reiniciar a la página 1 cuando el usuario busque algo
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    if (loading) return <div className="loading-table">Cargando registros desde Turso...</div>;
    if (!orders || orders.length === 0) return <div className="loading-table">No hay pedidos registrados.</div>;

    const filteredOrders = orders.filter((order) => {
        if (order.status === 'Completado') return false;

        const orderId = Number(order.id);
        if (orderId < 1000) return false;

        const jobTypeStr = String(order.job_type ?? (order as any).print_type ?? '');
        return jobTypeStr.toLowerCase().includes(searchTerm.toLowerCase()) || orderId.toString().includes(searchTerm);
    });

    // --- LÓGICA DE PAGINACIÓN ---
    const totalPages = Math.ceil(filteredOrders.length / REGISTROS_POR_PAGINA);
    const startIndex = (currentPage - 1) * REGISTROS_POR_PAGINA;
    const endIndex = startIndex + REGISTROS_POR_PAGINA;
    const currentOrders = filteredOrders.slice(startIndex, endIndex);

    // 1. Modifica dentro de handleConfirmAssignment:
    const handleConfirmAssignment = async (machineId: number) => {
        if (!selectedOrder) return;

        const currentOrderId = Number(selectedOrder.id);

        // REDONDEO DEL TIEMPO ESTIMADO A ENTERO
        const estimatedTimeSeconds = Math.round(Number(selectedOrder.estimated_time ?? 60));

        try {
            if (onAssignMachine) {
                await onAssignMachine(currentOrderId, machineId);
            }

            setMaquinas(prev => prev.map(m => m.id === machineId ? {
                ...m,
                estado: 'Ocupada',
                pedidoId: currentOrderId,
                tiempoEstimadoTotal: estimatedTimeSeconds, // Se guarda ya redondeado
                asignadoEn: new Date().toISOString()
            } : m));

            setSelectedOrder(null);
        } catch (err) {
            console.error(err);
            alert("Error al guardar la asignación en el servidor.");
        }
    };

    const obtenerTiempoRestanteTexto = (maq: Maquina) => {
        if (!maq.asignadoEn || !maq.tiempoEstimadoTotal) return 'Calculando...';
        const transcurridos = Math.floor((Date.now() - new Date(maq.asignadoEn).getTime()) / 1000);
        const restante = maq.tiempoEstimadoTotal - transcurridos;
        return restante > 0 ? `${restante}s restantes` : 'Liberando...';
    };

    return (
        <div className="orders-table-container" style={{ position: 'relative' }}>
            <div className="table-header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>Historial de Pedidos Nuevos ({filteredOrders.length})</h3>
                <input
                    type="text"
                    placeholder="🔍 Buscar por Tipo o ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '0.5rem 1rem', width: '250px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
            </div>

            <div className="responsive-table">
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tipo de Trabajo</th>
                            <th>Cantidad</th>
                            <th>Tamaño</th>
                            <th>Material</th>
                            <th>Color</th>
                            <th>Tiempo Est. (s)</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentOrders.map((order) => {
                            const idMostrar = (order as any).order_id ?? order.id;
                            return (
                                <tr key={idMostrar}>
                                    <td>#{idMostrar}</td>
                                    <td>{order.job_type ?? (order as any).print_type}</td>
                                    <td>{order.quantity}</td>
                                    <td><span className="badge-size">{order.size ?? (order as any).print_size}</span></td>
                                    <td>{order.material ?? (order as any).print_material}</td>
                                    <td>{order.is_colored ?? (order as any).colored ? 'Sí' : 'No'}</td>
                                    <td><strong>{Math.round(Number(order.estimated_time ?? 0))}s</strong></td>
                                    <td>
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            style={{ background: '#007bff', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            ⚙️ Asignar
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* --- CONTROLES DE PAGINACIÓN --- */}
            {totalPages > 1 && (
                <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        style={{ padding: '0.5rem 1rem', background: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                    >
                        ◀ Anterior
                    </button>
                    <span style={{ fontWeight: '500' }}>Página {currentPage} de {totalPages}</span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        style={{ padding: '0.5rem 1rem', background: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                    >
                        Siguiente ▶
                    </button>
                </div>
            )}

            {/* PANEL MODAL DE ASIGNACIÓN */}
            {selectedOrder && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="modal-content" style={{ background: '#fff', padding: '2rem', borderRadius: '8px', width: '450px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', fontFamily: 'sans-serif' }}>
                        <h4 style={{ marginTop: 0, fontSize: '1.2rem' }}>Asignar Pedido #{(selectedOrder as any).order_id ?? selectedOrder.id}</h4>
                        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>Selecciona una máquina del taller para iniciar la producción:</p>

                        <div className="maquinas-list" style={{ margin: '1.5rem 0' }}>
                            {maquinas.map((maq) => (
                                <div key={maq.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '1px solid #eee', borderRadius: '4px', marginBottom: '0.6rem', background: maq.estado === 'Disponible' ? '#f6fff6' : '#fff5f5' }}>
                                    <div>
                                        <strong style={{ display: 'block', color: '#333' }}>{maq.nombre}</strong>
                                        <span style={{ fontSize: '0.85rem', fontWeight: '500', color: maq.estado === 'Disponible' ? '#28a745' : '#dc3545' }}>
                                            {maq.estado === 'Disponible'
                                                ? '🟢 Disponible'
                                                : `🔴 Procesando Pedido #${maq.pedidoId} (${obtenerTiempoRestanteTexto(maq)})`}
                                        </span>
                                    </div>
                                    <button
                                        disabled={maq.estado === 'Ocupada'}
                                        onClick={() => handleConfirmAssignment(maq.id)}
                                        style={{
                                            background: maq.estado === 'Disponible' ? '#28a745' : '#ccc',
                                            color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '4px', fontWeight: 'bold', cursor: maq.estado === 'Disponible' ? 'pointer' : 'not-allowed'
                                        }}
                                    >
                                        Asignar
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => setSelectedOrder(null)}
                            style={{ width: '100%', padding: '0.6rem', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};