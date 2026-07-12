import type { PredictionData } from "../types/Prediction";

type Props = {
    loading: boolean;
    data: PredictionData | null;
};

export default function PredictionResult({
    loading,
    data,
}: Props) {

    if (loading) {
        return (
            <div className="prediction-result">
                <h2>Resultado</h2>
                <p>Cargando predicción...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="prediction-result">
                <h2>Resultado</h2>
                <p>No hay resultados disponibles.</p>
            </div>
        );
    }

    return (
        <div className="prediction-result">

            <h2>Resultado de la Predicción</h2>

            <p>
                <strong>Modelo:</strong> {data.model}
            </p>

            <p>
                <strong>Tiempo estimado:</strong>{" "}
                {data.estimated_time.toFixed(2)} minutos
            </p>

        </div>
    );

}