export interface OrderData {
    // Analizar los campos que se estan proponiendo:
    id: number;
    job_type: string;
    quantity: number;
    size: string;
    material: string;
    is_colored: boolean;
    estimated_time: number;
    status: 'Pendiente' | 'Producción' | 'Completado';
    created_at?: string;
}