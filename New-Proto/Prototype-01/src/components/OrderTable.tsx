import React, { useState, useEffect, useRef } from 'react';
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
    const [currentPage, setCurrentPage] = useState<number>(1);
    const REGISTROS_POR_PAGINA = 25;

    // Estado para registrar qué IDs de pedidos están en proceso de desvanecimiento para no duplicar llamadas
    const [exitingOrderIds, setExitingOrderIds] = useState<number[]>([]);

    const [maquinas, setMaquinas] = useState<Maquina[]>([
        { id: 1, nombre: 'Plotter Roland A', estado: 'Disponible' },
        { id: 2, nombre: 'Impresora Offset Heidel', estado: 'Disponible' },
        { id: 3, nombre: 'Impresora Láser Xerox', estado: 'Disponible' },
    ]);

    // Intervalo para actualizar el contador de las máquinas y manejar la salida visual
    useEffect(() => {
        const interval = setInterval(() => {
            setMaquinas((prevMaquinas) =>
                prevMaquinas.map((maq) => {
                    if (maq.estado === 'Ocupada' && maq.asignadoEn && maq.tiempoEstimadoTotal) {
                        const segundosTranscurridos = Math.floor((Date.now() - new Date(maq.asignadoEn).getTime()) / 1000);
                        const tiempoRestante = maq.tiempoEstimadoTotal - segundosTranscurridos;

                        if (tiempoRestante <= 0) {
                            const pid = maq.pedidoId;
                            if (pid) {
                                // 1. Iniciamos la animación de desaparición de la fila agregando el ID a exitingOrderIds
                                if (!exitingOrderIds.includes(pid)) {
                                    setExitingOrderIds(prev => [...prev, pid]);

                                    // 2. Esperamos a que la animación de CSS (800ms) termine antes de completar el pedido en la base de datos
                                    setTimeout(() => {
                                        if (onCompleteOrder) {
                                            onCompleteOrder(pid).catch((err) =>
                                                console.error(`Error al completar pedido #${pid} en Turso:`, err)
                                            );
                                        }
                                        // Limpiamos el ID del estado de salida
                                        setExitingOrderIds(prev => prev.filter(id => id !== pid));
                                    }, 800);
                                }
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
    }, [onCompleteOrder, exitingOrderIds]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    if (loading) return <div className="loading-table">Cargando registros...</div>;
    if (!orders || orders.length === 0) return <div className="loading-table">No hay pedidos registrados.</div>;

    const filteredOrders = orders.filter((order) => {
        if (order.status === 'Completado') return false;

        const orderId = Number(order.id);
        if (orderId < 1000) return false;

        const jobTypeStr = String(order.job_type ?? (order as any).print_type ?? '');
        return jobTypeStr.toLowerCase().includes(searchTerm.toLowerCase()) || orderId.toString().includes(searchTerm);
    });

    const totalPages = Math.ceil(filteredOrders.length / REGISTROS_POR_PAGINA);
    const startIndex = (currentPage - 1) * REGISTROS_POR_PAGINA;
    const endIndex = startIndex + REGISTROS_POR_PAGINA;
    const currentOrders = filteredOrders.slice(startIndex, endIndex);

    const handleConfirmAssignment = async (machineId: number) => {
        if (!selectedOrder) return;

        const currentOrderId = Number(selectedOrder.id);
        const estimatedTimeSeconds = Math.round(Number(selectedOrder.estimated_time ?? 60));

        try {
            if (onAssignMachine) {
                await onAssignMachine(currentOrderId, machineId);
            }

            setMaquinas(prev => prev.map(m => m.id === machineId ? {
                ...m,
                estado: 'Ocupada',
                pedidoId: currentOrderId,
                tiempoEstimadoTotal: estimatedTimeSeconds,
                asignadoEn: new Date().toISOString()
            } : m));

            setSelectedOrder(null);
        } catch (err) {
            console.error(err);
            alert("Error al guardar la asignación en el servidor.");
        }
    };

    // Helper para buscar si un pedido está asignado a alguna máquina y retornar los segundos restantes
    const obtenerDatosAsignacionPedido = (pedidoId: number) => {
        const maq = maquinas.find(m => m.pedidoId === pedidoId && m.estado === 'Ocupada');
        if (!maq || !maq.asignadoEn || !maq.tiempoEstimadoTotal) return null;

        const transcurridos = Math.floor((Date.now() - new Date(maq.asignadoEn).getTime()) / 1000);
        const restante = maq.tiempoEstimadoTotal - transcurridos;
        return restante > 0 ? restante : 0;
    };

    return (
        <div className="orders-section-wrapper">
            <div className="orders-table-container">
                {/* <div className="table-header-actions">
                    <h3>Historial de Pedidos Nuevos ({filteredOrders.length})</h3>
                    <input
                        type="text"
                        placeholder="🔍 Buscar por Tipo o ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div> */}
                <div className="table-header-actions">
                    <div className="header-title-area">
                        <h3>Historial de Pedidos Nuevos</h3>
                        <span className="badge-count">{filteredOrders.length}</span>
                    </div>

                    <div className="macos-search-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            className="macos-search-input"
                            placeholder="Buscar por Tipo o ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                className="search-clear-btn"
                                onClick={() => setSearchTerm('')}
                                title="Limpiar búsqueda"
                            >
                                ✕
                            </button>
                        )}
                    </div>
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
                                <th>Tiempo Est.</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentOrders.map((order) => {
                                const idMostrar = (order as any).order_id ?? order.id;
                                const idNumerico = Number(idMostrar);

                                // Verificamos si el pedido está siendo procesado por alguna máquina y cuánto tiempo le queda
                                const tiempoRestante = obtenerDatosAsignacionPedido(idNumerico);
                                const estaProcesando = tiempoRestante !== null;
                                const estaSaliendo = exitingOrderIds.includes(idNumerico);

                                return (
                                    <tr
                                        key={idMostrar}
                                        className={`${estaProcesando ? 'row-processing' : ''} ${estaSaliendo ? 'row-exiting' : ''}`}
                                    >
                                        <td>#{idMostrar}</td>
                                        <td>{order.job_type ?? (order as any).print_type}</td>
                                        <td>{order.quantity}</td>
                                        <td><span className="badge-size">{order.size ?? (order as any).print_size}</span></td>
                                        <td>{order.material ?? (order as any).print_material}</td>
                                        <td>{order.is_colored ?? (order as any).colored ? 'Sí' : 'No'}</td>
                                        <td><strong>{Math.round(Number(order.estimated_time ?? 0))}s</strong></td>
                                        <td>
                                            {estaProcesando ? (
                                                <button className="btn-table-processing" disabled>
                                                    <span className="spinner-mini"></span>
                                                    Procesando ({tiempoRestante}s)
                                                </button>
                                            ) : (
                                                <button className="btn-table-assign" onClick={() => setSelectedOrder(order)}>
                                                    ⚙️ Asignar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="pagination-controls">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            ◀ Anterior
                        </button>
                        <span>Página {currentPage} de {totalPages}</span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Siguiente ▶
                        </button>
                    </div>
                )}
            </div>

            {/* PANEL MODAL DE ASIGNACIÓN */}
            {selectedOrder && (
                <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h4>Asignar Pedido #{(selectedOrder as any).order_id ?? selectedOrder.id}</h4>
                        <p className="modal-subtitle">Selecciona una máquina del taller para iniciar la producción:</p>

                        <div className="maquinas-list">
                            {maquinas.map((maq) => {
                                const isDisponible = maq.estado === 'Disponible';
                                return (
                                    <div
                                        key={maq.id}
                                        className={`maquina-card ${isDisponible ? 'card-disponible' : 'card-ocupada'}`}
                                    >
                                        <div className="maquina-info">
                                            <strong className="maquina-name">{maq.nombre}</strong>
                                            <span className={`maquina-status-badge ${isDisponible ? 'status-green' : 'status-red'}`}>
                                                {isDisponible
                                                    ? 'Disponible'
                                                    : `Procesando #${maq.pedidoId} (${maq.tiempoEstimadoTotal ? Math.max(0, maq.tiempoEstimadoTotal - Math.floor((Date.now() - new Date(maq.asignadoEn!).getTime()) / 1000)) : 0}s)`}
                                            </span>
                                        </div>
                                        <button
                                            className="btn-assign-action"
                                            disabled={!isDisponible}
                                            onClick={() => handleConfirmAssignment(maq.id)}
                                        >
                                            Asignar
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        <button className="btn-modal-cancel" onClick={() => setSelectedOrder(null)}>
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};