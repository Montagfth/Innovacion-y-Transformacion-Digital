export interface PredictionRequest {
    job_type: string;
    quantity: number;
    size: string;
    material: string;
    isColored: boolean;
    model: string;
}