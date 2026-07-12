import type { PredictionRequest } from "../types/PredictionRequest";

type Props = {
    request: PredictionRequest;
    setRequest: React.Dispatch<React.SetStateAction<PredictionRequest>>;
};

export default function PredictionForm({
    request,
    setRequest,
}: Props) {

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement
        >
    ) => {

        const { name, value } = e.target;

        setRequest((prev) => ({
            ...prev,
            [name]:
                name === "quantity"
                    ? Number(value)
                    : name === "isColored"
                    ? value === "true"
                    : value,
        }));
    };

    const changeModel = (model: string) => {

        setRequest((prev) => ({
            ...prev,
            model,
        }));

    };

    return (

        <div className="prediction-form">

            <h2>Parámetros de Predicción</h2>

            {/* Job Type */}

            <div className="form-group">

                <label>Tipo de trabajo</label>

                <select
                    name="job_type"
                    value={request.job_type}
                    onChange={handleChange}
                >
                    <option value="Banner">Banner</option>
                    <option value="Documento">Documento</option>
                    <option value="Flyer">Flyer</option>
                    <option value="Plano">Plano</option>
                    <option value="Tarjeta">Tarjeta</option>
                </select>

            </div>

            {/* Quantity */}

            <div className="form-group">

                <label>Cantidad</label>

                <input
                    type="number"
                    name="quantity"
                    value={request.quantity}
                    onChange={handleChange}
                />

            </div>

            {/* Size */}

            <div className="form-group">

                <label>Tamaño</label>

                <select
                    name="size"
                    value={request.size}
                    onChange={handleChange}
                >
                    <option value="A2">A2</option>
                    <option value="A3">A3</option>
                    <option value="A4">A4</option>
                    <option value="Grande">Grande</option>
                </select>

            </div>

            {/* Material */}

            <div className="form-group">

                <label>Material</label>

                <select
                    name="material"
                    value={request.material}
                    onChange={handleChange}
                >
                    <option value="Bond">Bond</option>
                    <option value="Cartulina">Cartulina</option>
                    <option value="Couche">Couche</option>
                    <option value="Vinil">Vinil</option>
                </select>

            </div>

            {/* Color */}

            <div className="form-group">

                <label>¿Es a color?</label>

                <select
                    name="isColored"
                    value={request.isColored.toString()}
                    onChange={handleChange}
                >
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                </select>

            </div>

            {/* Model */}

            <div className="form-group">

                <label>Modelo de Machine Learning</label>

                <div className="model-buttons">

                    <button
                        type="button"
                        className={
                            request.model === "linear_regression"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            changeModel("linear_regression")
                        }
                    >
                        Linear Regression
                    </button>

                    <button
                        type="button"
                        className={
                            request.model === "decision_tree"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            changeModel("decision_tree")
                        }
                    >
                        Decision Tree
                    </button>

                    <button
                        type="button"
                        className={
                            request.model === "random_forest"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            changeModel("random_forest")
                        }
                    >
                        Random Forest
                    </button>

                </div>

            </div>

        </div>

    );

}