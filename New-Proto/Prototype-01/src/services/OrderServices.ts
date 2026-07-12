import { createClient } from '@libsql/client/web';
import type { OrderData } from '../types/Order';

// Se exponen las credenciales como parte de un proyecto academico:
const TURSO_DB_URL = 'libsql://innovacion-project-montagfth.aws-us-east-2.turso.io';
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODM1NTY0OTEsImlkIjoiMDE5ZWI3ZmEtZWMwMS03ZWMwLThiM2YtYTMxYTZmODIzYmI4Iiwia2lkIjoiT25janlWVThNNmJLMUxiOW5QZFdtR0p5THA1cktwZVZobnB2MkRXUWlIQSIsInJpZCI6ImE2MzgzYjRmLTZkZDYtNGJhNy1iZjI2LWU0MmUzOTIzNTgzYiJ9.wPDaLyL39YNHU89GlgN_YDSvOMpOIWr8t2TQHGU7SXXWcAh10bawV2NM8Shs7rtjJtWGUAG9oOEFkiLyortECg';

const client = createClient({
    url: TURSO_DB_URL,
    authToken: TURSO_TOKEN,
});

export const getOrders = async (): Promise<OrderData[]> => {

    try {
        const query = `
        SELECT 
            order_id, 
            print_type, 
            quantity, 
            print_size, 
            print_material, 
            colored, 
            estimated_time, 
            status 
        FROM 
            orders`;

        const result = await client.execute(query);

        console.log("Respuesta de Turso:", result.rows);

        const orders: OrderData[] = result.rows.map((row: any) => ({
            id: Number(row.order_id),
            job_type: `${row.print_type}`,
            quantity: Number(row.quantity),
            size: `${row.print_size}`,
            material: `${row.print_material}`,
            is_colored: Number(row.colored) === 1,
            estimated_time: Number(row.estimated_time),
            status: (row.status as 'Pendiente' | 'Producción' | 'Completado') || 'Pendiente',
        }));

        console.log("Ordenes mapeadas con exito:", orders);
        return orders;
    } catch (error) {
        console.error('Error fetching orders from Turso:', error);
        throw error;
    }
};

export const createOrder = async (order: Omit<OrderData, 'id'> & { priority?: number }): Promise<void> => {
    try {
        // Diccionarios de conversión:
        const typeMapping: Record<string, number> = {
            'Documento': 1,
            'Banner': 2,
            'Flyer': 3,
            'Plano': 4,
            'Tarjeta': 5
        };

        const sizeMapping: Record<string, number> = {
            'A4': 1,
            'A3': 2,
            'A2': 3,
            'Grande': 4
        };

        const materialMapping: Record<string, number> = {
            'Bond': 1,
            'Cartulina': 2,
            'Couche': 3,
            'Vinil': 4
        };

        // Obtenemos los IDs numéricos correspondientes (usando valores por defecto si no coinciden)
        const dbPrintType = typeMapping[order.job_type] || 2;       // Por defecto 2 (Banner)
        const dbPrintSize = sizeMapping[order.size] || 1;           // Por defecto 1 (A4)
        const dbPrintMaterial = materialMapping[order.material] || 3; // Por defecto 3 (Couche)

        const predictedTime = order.estimated_time && order.estimated_time > 0 ? order.estimated_time : 0.5;

        const now = new Date();
        const createStr = now.toISOString().replace('T', ' ').substring(0, 19);

        const machineQuery = `
            SELECT print_machine, MAX(completed_at) as last_busy_time 
            FROM orders 
            WHERE status IN ('Producción', 'Pendiente') 
            GROUP BY print_machine
        `;

        const machineStatus = await client.execute(machineQuery);

        // Inicializacion de las maquinas para produccion:
        const machinesAvailability: Record<number, Date> = {
            1: new Date(now),
            2: new Date(now),
            3: new Date(now)
        }

        // Mapping de Ordenes en Cola:
        machineStatus.rows.forEach((row: any) => {
            const machineId = Number(row.print_machine);
            if (row.last_busy_time && (machineId === 1 || machineId === 2 || machineId === 3)) {
                machinesAvailability[machineId] = new Date(row.last_busy_time.replace(' ', 'T'));
            }
        });

        // Asignacion de maquina por defecto:
        let assignedMachine = 1;

        // Asignacion de prioridades de pedidos:
        if (order.priority === 1) {
            // Categoria 1: Alta Prioridad
            console.log("Pedido de alta prioridad.")
            let earliestTime = machinesAvailability[1].getTime();

            // Recorrido de scanning de maquinas post-pedido:
            [1, 2, 3].forEach(mId => {
                if (machinesAvailability[mId].getTime() < earliestTime) {
                    earliestTime = machinesAvailability[mId].getTime();
                    assignedMachine = mId;
                }
            });
        } else {
            // Categoria 0: Baja/Normal Prioridad
            console.log("Pedido de prioridad baja/normal.");
            let earliestTime = machinesAvailability[1].getTime();

            // Recorrido de maquinas post-pedido (Caso 2):
            [1, 2, 3].forEach(mId => {
                if (machinesAvailability[mId].getTime() < earliestTime) {
                    earliestTime = machinesAvailability[mId].getTime();
                    assignedMachine = mId;
                }
            });
        }

        const startedAtDate = machinesAvailability[assignedMachine];
        const startedAtStr = startedAtDate.toISOString().replace('T', ' ').substring(0, 19);

        const completedAtDate = new Date(startedAtDate.getTime() + (predictedTime * 60 * 1000));
        const completedAtStr = completedAtDate.toISOString().replace('T', ' ').substring(0, 19);

        // Insercion con todos los campos:
        const insertQuery = `
            INSERT INTO orders (
                client, 
                print_type, 
                quantity, 
                print_size, 
                print_material, 
                print_machine, 
                colored, 
                estimated_time, 
                total, 
                priority, 
                created, 
                status, 
                started_at, 
                completed_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `.trim();

        console.log("Analizando disponibilidad de maquinas: M1,M2,M3")

        // Creacion de parametros a insertar:
        const params = [
            'Cliente Importado',          // client
            Number(dbPrintType),          // print_type
            Number(order.quantity),       // quantity
            Number(dbPrintSize),          // print_size
            Number(dbPrintMaterial),      // print_material
            Number(assignedMachine),      // print_machine (1, 2 o 3 dinámico)
            order.is_colored ? 1 : 0,     // colored (1 o 0)
            Number(predictedTime),        // estimated_time (Captura el valor numérico de la IA)
            21,                           // total
            Number(order.priority ?? 0),        // priority (1 o 0)
            createStr,                   // created ("2026-07-12 18:40:11")
            'Producción',                 // status
            startedAtStr,                 // started_at (Calculado si la máquina está libre u ocupada)
            completedAtStr                // completed_at (created + estimated_time)
        ];

        console.log(`Asignación completada con éxito -> Máquina: ${assignedMachine} | Inicia: ${startedAtStr} | Termina: ${completedAtStr}`);
        await client.execute({ sql: insertQuery, args: params });
        console.log("Pedido guardado exitosamente.");

    } catch (error) {
        console.error('Error al insertar el pedido.:', error);
        throw error;
    }
};