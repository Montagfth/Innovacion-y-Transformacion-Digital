import React, { useState, useEffect } from 'react';
import { ReportsTable } from './ReportsTable';
import { getOrders } from '../services/OrderServices';
import type { OrderData } from '../types/Order';

export const ReportsSection: React.FC = () => {
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchCompletedOrders = async () => {
            try {
                setLoading(true);
                // Reutilizamos el servicio getOrders() que ya consulta toda la tabla
                const data = await getOrders();
                setOrders(data || []);
            } catch (error) {
                console.error("Error al obtener el historial de reportes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCompletedOrders();
    }, []);

    return (
        <div className="reports-section-wrapper" style={{ padding: '1rem 0' }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#333' }}>📊 Reportes y Estadísticas</h2>

            {/* Si gustas, más adelante puedes agregar aquí tarjetas con KPIs de producción */}

            <ReportsTable orders={orders} loading={loading} />
        </div>
    );
};