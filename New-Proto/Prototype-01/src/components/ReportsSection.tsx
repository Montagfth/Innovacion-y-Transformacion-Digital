import React, { useState, useEffect } from 'react';
import { ReportsTable } from './ReportsTable';
import { getOrders } from '../services/OrderServices';
import type { OrderData } from '../types/Order';
import './ReportsModule.css'; // <--- Importamos los estilos aquí

export const ReportsSection: React.FC = () => {
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchCompletedOrders = async () => {
            try {
                setLoading(true);
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
        <div className="reports-section-wrapper">
            <div className="reports-title-container">
                <h2>📊 Reportes y Estadísticas</h2>
            </div>

            {/* Aquí se cargará la tabla Bento de macOS */}
            <ReportsTable orders={orders} loading={loading} />
        </div>
    );
};