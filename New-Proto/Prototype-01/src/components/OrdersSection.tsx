import React, { useState, useEffect } from 'react';
import { OrdersTable } from './OrderTable'; // Tu componente de tabla corregido
import { getOrders, updateOrderToCompleted } from '../services/OrderServices'; // Importamos los servicios
import type { OrderData } from '../types/Order';

export const OrdersSection: React.FC = () => {
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Carga inicial de datos
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const data = await getOrders(); // Trae las órdenes de Turso
                setOrders(data || []);
            } catch (error) {
                console.error("Error al cargar pedidos:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    // FUNCIÓN PARA MANEJAR LA ASIGNACIÓN (Si ya la tienes implementada)
    const handleAssignMachine = async (orderId: number, machineId: number) => {
        // Tu lógica actual para asignar máquina en el backend...
        console.log(`Asignando pedido ${orderId} a máquina ${machineId}`);
    };

    // AQUÍ VA LA FUNCIÓN QUE SOLICITASTE
    const handleCompleteOrder = async (orderId: number) => {
        try {
            // 1. Petición al servicio para hacer el UPDATE a 'Completado' en Turso
            await updateOrderToCompleted(orderId);
            
            // 2. Remueve el pedido de la pantalla instantáneamente sin recargar la página
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
            {/* Pasamos las funciones como props al hijo */}
            <OrdersTable 
                orders={orders} 
                loading={loading} 
                onAssignMachine={handleAssignMachine} 
                onCompleteOrder={handleCompleteOrder} 
            />
        </div>
    );
};