import React, { useState, useEffect } from 'react';
import { OrdersTable } from './OrderTable';
import { getOrders } from '../services/OrderServices';
import type { OrderData } from '../types/Order';

export const OrdersSection: React.FC = () => {
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [loadingOrders, setLoadingOrders] = useState<boolean>(false);

    useEffect(() => {
        setLoadingOrders(true);
        getOrders()
            .then((data) => {
                console.log("Datos obtenidos desde Turso con exito:", data);
                setOrders(data);
            })
            .catch((err) => {
                console.error("Error al obtener los registros desde Turso:", err);
            })
            .finally(() => setLoadingOrders(false));
    }, []); // Se ejecuta siempre de forma limpia al cargar esta sección

    return (
        <div className="orders-section animate-fade-in">
            <header className="content-header">
                <div>
                    <h1>Gestión de Pedidos</h1>
                    <p>Registros históricos sincronizados desde la base de datos Turso</p>
                </div>
            </header>

            <OrdersTable orders={orders} loading={loadingOrders} />
        </div>
    );
};