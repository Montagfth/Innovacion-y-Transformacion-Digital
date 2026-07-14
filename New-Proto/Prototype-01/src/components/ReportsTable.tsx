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

    if (loading) return <div className="loading-table">Cargando reportes desde Turso...</div>;

    // Filtramos TODOS los pedidos con estado 'Completado'
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

    // --- FUNCIÓN PARA EXPORTAR TODOS LOS REGISTROS COMPLETADOS A EXCEL (CSV) ---
    const handleExportToExcel = () => {
        if (completedOrders.length === 0) return;

        // 1. Definir las cabeceras de las columnas
        const headers = ["ID", "Tipo de Trabajo", "Cantidad", "Tamanio", "Material", "Color", "Tiempo Invertido (s)", "Estado"];

        // 2. Mapear cada fila con sus datos correspondientes
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

        // 3. Unir cabeceras con los datos agregando saltos de línea (Añadimos BOM \uFEFF para soportar tildes en Excel)
        const csvContent = "\uFEFF" + [headers.join(','), ...csvRows].join('\n');

        // 4. Crear un elemento temporal de descarga
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
            <div className="orders-table-container">
                <h3>Reporte de Pedidos Completados</h3>
                <p style={{ color: '#666', textAlign: 'center', marginTop: '2rem' }}>
                    No hay pedidos completados en el historial todavía.
                </p>
            </div>
        );
    }

    // --- LÓGICA DE PAGINACIÓN ---
    const totalPages = Math.ceil(completedOrders.length / REGISTROS_POR_PAGINA);
    const startIndex = (currentPage - 1) * REGISTROS_POR_PAGINA;
    const endIndex = startIndex + REGISTROS_POR_PAGINA;
    const currentOrders = completedOrders.slice(startIndex, endIndex);

    return (
        <div className="orders-table-container">
            <div className="table-header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>Historial de Producción Completada ({completedOrders.length})</h3>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {/* BOTÓN EXPORTAR EXCEL */}
                    <button
                        onClick={handleExportToExcel}
                        style={{
                            background: '#217346', // Color verde característico de Microsoft Excel
                            color: '#fff',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                        }}
                    >
                        📥 Exportar Excel
                    </button>

                    <input
                        type="text"
                        placeholder="🔍 Buscar reporte por Tipo o ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: '0.5rem 1rem', width: '250px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
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
                            <th>Tiempo Invertido (s)</th>
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
                                    <td><span className="badge-size">{order.size ?? (order as any).print_size}</span></td>
                                    <td>{order.material ?? (order as any).print_material}</td>
                                    <td>{order.is_colored ?? (order as any).colored ? 'Sí' : 'No'}</td>
                                    <td><strong>{Math.round(Number(order.estimated_time ?? 0))}s</strong></td>
                                    <td>
                                        <span style={{
                                            background: '#d4edda',
                                            color: '#155724',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.85rem',
                                            fontWeight: 'bold'
                                        }}>
                                            ✅ Completado
                                        </span>
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
        </div>
    );
};