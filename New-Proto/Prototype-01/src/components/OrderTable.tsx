import React from 'react';
import type { OrderData } from '../types/Order';

interface OrdersTableProps {
    orders: OrderData[];
    loading: boolean;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({ orders, loading }) => {
    if (loading) {
        return <div className="loading-table">Cargando registros desde Turso...</div>;
    }

    if (!orders || orders.length === 0) {

    }

    return (
        <div className="orders-table-container">
            <div className="table-header-actions">
                <h3>Historial de Pedidos ({orders.length} registros)</h3>
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
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.slice(0, 50).map((order) => ( // Paginación o límite visual inicial
                            <tr key={order.id}>
                                <td>#{order.id}</td>
                                <td>{order.job_type}</td>
                                <td>{order.quantity}</td>
                                <td><span className="badge-size">{order.size}</span></td>
                                <td>{order.material}</td>
                                <td>{order.is_colored ? '✅ Sí' : '❌ No'}</td>
                                <td><strong>{order.estimated_time.toFixed(2)}s</strong></td>
                                <td>
                                    <span className={`status-badge ${order.status.toLowerCase().replace(' ', '-')}`}>
                                        {order.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {orders.length > 50 && (
                <p className="table-footer-note">Mostrando los primeros 50 registros de {orders.length} totales.</p>
            )}
        </div>
    );
};