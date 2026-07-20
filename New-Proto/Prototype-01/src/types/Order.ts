export interface OrderData {
    id: number;
    job_type: string;
    quantity: number;
    size: string;
    material: string;
    is_colored: boolean;
    estimated_time: number;
    status: 'Pendiente' | 'Producción' | 'Completado';
    priority?: number;
    created_at?: string;
}