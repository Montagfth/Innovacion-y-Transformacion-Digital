import React, { useState, useEffect } from 'react';
import type { OrderData } from '../types/Order';

interface ReportsTableProps {
    orders: OrderData[];
    loading: boolean;
}

export const ReportsTable: React.FC<ReportsTableProps> = ({ orders, loading }) => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const REGISTROS_POR_PAGINA = 25;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    if (loading) {
        return <div className="loading-table">Cargando reportes</div>;
    }

    // Filtrar pedidos 'Completados'
    const completedOrders = orders.filter((order) => {
        if (order.status !== 'Completado') return false;

        const orderId = Number(order.id ?? (order as any).order_id);
        if (isNaN(orderId) || orderId < 1) return false;

        const jobTypeStr = String(order.job_type ?? (order as any).print_type ?? '');
        return (
            jobTypeStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
            orderId.toString().includes(searchTerm)
        );
    });

    // --- FUNCIÓN EXPORTAR ---
    const handleExportToExcel = () => {
        if (completedOrders.length === 0) return;

        const headers = ["ID", "Tipo de Trabajo", "Cantidad", "Tamanio", "Material", "Color", "Tiempo Invertido (s)", "Estado"];

        const csvRows = completedOrders.map(order => {
            const idMostrar = (order as any).order_id ?? order.id;
            const jobType = order.job_type ?? (order as any).print_type;
            const size = order.size ?? (order as any).print_size;
            const material = order.material ?? (order as any).print_material;
            const isColored = (order as any).colored ?? order.is_colored ? 'Si' : 'No';
            const time = Math.round(Number(order.estimated_time ?? 0));

            return [
                `#${idMostrar}`,
                `"${jobType}"`,
                order.quantity,
                `"${size}"`,
                `"${material}"`,
                `"${isColored}"`,
                `${time}s`,
                `"${order.status}"`
            ].join(',');
        });

        const csvContent = "\uFEFF" + [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Reporte_Pedidos_Completados_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (completedOrders.length === 0) {
        return (
            <div className="orders-table-container no-records-card">
                <h3>Reporte de Pedidos Completados</h3>
                <p>No hay pedidos completados en el historial todavía.</p>
            </div>
        );
    }

    // --- PAGINACIÓN ---
    const totalPages = Math.ceil(completedOrders.length / REGISTROS_POR_PAGINA);
    const startIndex = (currentPage - 1) * REGISTROS_POR_PAGINA;
    const endIndex = startIndex + REGISTROS_POR_PAGINA;
    const currentOrders = completedOrders.slice(startIndex, endIndex);

    return (
        <div className="orders-table-container">
            {/* Acciones superiores */}
            <div className="table-header-actions">
                <h3>Historial de Producción Completada ({completedOrders.length})</h3>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Botón Exportar */}
                    <button onClick={handleExportToExcel} className="mac-btn-excel">
                        📥 Exportar Excel
                    </button>

                    {/* Buscador Estilo macOS */}
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <span style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            pointerEvents: 'none',
                            fontSize: '0.85rem',
                            opacity: 0.6
                        }}>
                            🔍
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar por Tipo o ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="mac-search-input"
                        />
                    </div>
                </div>
            </div>

            {/* Tabla Responsive */}
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
                            <th>Tiempo Invertido</th>
                            <th>Estado</th>
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
                                    <td>
                                        <span className="badge-size">
                                            {order.size ?? (order as any).print_size}
                                        </span>
                                    </td>
                                    <td>{order.material ?? (order as any).print_material}</td>
                                    <td>{order.is_colored ?? (order as any).colored ? 'Sí' : 'No'}</td>
                                    <td><strong>{Math.round(Number(order.estimated_time ?? 0))}s</strong></td>
                                    <td>
                                        <span className="badge-status-completed">
                                            ✅ Completado
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Controles de Paginación */}
            {totalPages > 1 && (
                <div className="pagination-controls">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="mac-btn-pagination"
                    >
                        ◀ Anterior
                    </button>
                    <span className="pagination-text">
                        Página {currentPage} de {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="mac-btn-pagination"
                    >
                        Siguiente ▶
                    </button>
                </div>
            )}
        </div>
    );
};