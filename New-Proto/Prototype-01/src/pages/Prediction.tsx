import { useEffect, useState } from "react";

import PredictionForm from "../components/PredictionForm";
import PredictionResult from "../components/PredictionResult";
import type { PredictionData } from "../types/Prediction";
import type { PredictionRequest } from "../types/PredictionRequest";

import { getPrediction } from "../services/PredictionService";

export default function Prediction() {

    const [loading, setLoading] = useState(true);

    const [data, setData] = useState<PredictionData | null>(null);

    const [request, setRequest] = useState<PredictionRequest>({
        job_type: "Banner",
        quantity: 10000,
        size: "A2",
        material: "Bond",
        isColored: true,
        model: "linear_regression",
    });

    useEffect(() => {

        const fetchPrediction = async () => {

            try {

                setLoading(true);

                const prediction = await getPrediction(request);

                setData(prediction);

            } catch (error) {

                console.error(error);

            } finally {

                setLoading(false);

            }

        };

        fetchPrediction();

    }, [request]);

    return (

        <div>

            <PredictionForm
                request={request}
                setRequest={setRequest}
            />

            <PredictionResult
                loading={loading}
                data={data}
            />

        </div>

    );

}