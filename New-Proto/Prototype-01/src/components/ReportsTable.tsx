import React, { useState, useEffect } from 'react';
import type { OrderData } from '../types/Order';

interface ReportsTableProps {
    orders: OrderData[];
    loading: boolean;
}

const JOB_TYPES: Record<string, string> = { '1': 'Sublimación', '2': 'Serigrafía', '3': 'Vinil', '4': 'DTF', '5': 'Transfer' };
const SIZES: Record<string, string> = { '1': 'Pequeño', '2': 'Mediano', '3': 'Grande', '4': 'Extra Grande' };
const MATERIALS: Record<string, string> = { '1': 'Algodón', '2': 'Poliéster', '3': 'Mixto', '4': 'Lona', '5': 'Especial' };

const getLabel = (dict: Record<string, string>, val: any) => dict[String(val)] || val || 'N/A';

export const ReportsTable: React.FC<ReportsTableProps> = ({ orders, loading }) => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const REGISTROS_POR_PAGINA = 20; // 10 izquierda, 10 derecha para que encaje sin scroll vertical

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
            const jobType = getLabel(JOB_TYPES, order.job_type ?? (order as any).print_type);
            const size = getLabel(SIZES, order.size ?? (order as any).print_size);
            const material = getLabel(MATERIALS, order.material ?? (order as any).print_material);
            const isColored = (order as any).colored ?? order.is_colored ? 'Color' : 'B/N';
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

            {/* Tabla Dividida (Split View) */}
            <div className="split-tables-wrapper">
                {[
                    currentOrders.slice(0, Math.ceil(currentOrders.length / 2)),
                    currentOrders.slice(Math.ceil(currentOrders.length / 2))
                ].map((ordersColumn, idx) => (
                    <div className="responsive-table split-side" key={idx}>
                        <table className="orders-table compact-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Trabajo</th>
                                    <th>Cant.</th>
                                    <th>Tamaño</th>
                                    <th>Material</th>
                                    <th>Color</th>
                                    <th>Tiempo</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ordersColumn.map((order) => {
                                    const idMostrar = (order as any).order_id ?? order.id;
                                    const rawJobType = order.job_type ?? (order as any).print_type;
                                    return (
                                        <tr key={idMostrar} className="premium-row">
                                            <td className="id-cell">
                                                <div className="id-wrapper">
                                                    <span className="id-hash">#</span>
                                                    {idMostrar}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="job-text text-truncate" title={getLabel(JOB_TYPES, rawJobType)}>
                                                    {getLabel(JOB_TYPES, rawJobType)}
                                                </span>
                                            </td>
                                            <td className="qty-cell">
                                                <span className="qty-val">{order.quantity}</span>
                                            </td>
                                            <td>
                                                <span className="badge-size premium-badge compact-badge">
                                                    {getLabel(SIZES, order.size ?? (order as any).print_size)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="badge-material premium-badge compact-badge">
                                                    {getLabel(MATERIALS, order.material ?? (order as any).print_material)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge-color ${order.is_colored ?? (order as any).colored ? 'yes' : 'no'} premium-badge compact-badge`}>
                                                    {order.is_colored ?? (order as any).colored ? 'Color' : 'B/N'}
                                                </span>
                                            </td>
                                            <td className="time-cell">
                                                <div className="time-wrapper compact-time">
                                                    <strong>{Math.round(Number(order.estimated_time ?? 0))}s</strong>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge-status-completed premium-badge compact-badge" title="Completado">
                                                    ✅
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>

            {/* Controles de Paginación */}
            {totalPages > 1 && (
                <div className="pagination-controls">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="mac-btn-pagination"
                    >
                        ◀
                    </button>

                    <div className="pagination-numbers">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`mac-btn-pagination number-btn ${currentPage === pageNum ? 'active' : ''}`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        {totalPages > 5 && currentPage < totalPages - 2 && <span className="pagination-dots">...</span>}
                        {totalPages > 5 && currentPage < totalPages - 2 && (
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                className={`mac-btn-pagination number-btn ${currentPage === totalPages ? 'active' : ''}`}
                            >
                                {totalPages}
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="mac-btn-pagination"
                    >
                        ▶
                    </button>
                </div>
            )}
        </div>
    );
};