import type { PredictionData } from '../types/Prediction';
import type { PredictionRequest } from '../types/PredictionRequest';

export async function getPrediction(
    request: PredictionRequest
): Promise<PredictionData> {

    // NOTA: Se puede usar distintos algorimos de ML, como decision_tree, random_forest, cambiando la ruta de la API.
    const params = new URLSearchParams({
        // Parametros de la solicitud:
        job_type: request.job_type,
        quantity: request.quantity.toString(),
        size: request.size,
        material: request.material,
        isColored: request.isColored.toString(),
        model: request.model
    })

    const response = await fetch(
        `https://proyecto-desarrollo-jmfd.onrender.com/prediction/?${params}`
    )

    if (!response.ok) {
        throw new Error('Error fetching prediction data')
    }

    return await response.json();
}