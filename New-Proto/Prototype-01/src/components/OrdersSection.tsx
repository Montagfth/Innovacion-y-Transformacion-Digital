import React, { useState, useEffect } from 'react';
import { OrdersTable } from './OrderTable';
import { getOrders, updateOrderToCompleted } from '../services/OrderServices';
import type { OrderData } from '../types/Order';
import './OrdersModule.css';

export const OrdersSection: React.FC = () => {
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const data = await getOrders();
                setOrders(data || []);
            } catch (error) {
                console.error("Error al cargar pedidos:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const handleAssignMachine = async (orderId: number, machineId: number) => {
        console.log(`Asignando pedido ${orderId} a máquina ${machineId}`);
    };

    const handleCompleteOrder = async (orderId: number) => {
        try {
            await updateOrderToCompleted(orderId);

            setOrders(prevOrders => prevOrders.filter(order => {
                const idActual = Number(order.id ?? (order as any).order_id);
                return idActual !== orderId;
            }));
        } catch (error) {
            console.error("Error al completar el pedido:", error);
            alert("No se pudo completar el pedido en el servidor.");
        }
    };

    return (
        <div className="orders-section-wrapper">
            <OrdersTable
                orders={orders}
                loading={loading}
                onAssignMachine={handleAssignMachine}
                onCompleteOrder={handleCompleteOrder}
            />
        </div>
    );
};