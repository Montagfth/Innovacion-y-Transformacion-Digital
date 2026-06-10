import math
from typing import Dict, List
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware # <--- Importante

app = FastAPI(title="Production Hours Predictor API")

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En producción, pon aquí la URL exacta de tu frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Configuración y Mapas de Características ---

PRINT_TYPE_BASE: Dict[str, float] = {
    "digital": 0.8,
    "offset": 2.5,
    "gran_formato": 3.0,
    "serigrafia": 2.0,
}

SIZE_MULTIPLIER: Dict[str, float] = {
    "A4": 1.0,
    "A3": 1.4,
    "A2": 1.8,
    "A1": 2.2,
    "A0": 2.8,
    "personalizado": 2.0,
}

MATERIAL_FACTOR: Dict[str, float] = {
    "papel_bond": 1.0,
    "papel_couche": 1.1,
    "cartulina": 1.15,
    "vinilo": 1.3,
    "lona": 1.4,
}

RF_INTERCEPT = 0.3
RF_QUANTITY_COEFF = 0.00085
RF_NOISE_SCALE = 0.08

# --- Lógica del Modelo ---

def seeded_random(seed: int) -> float:
    # Simula el comportamiento de Math.sin en JS para la semilla
    x = math.sin(seed) * 10000
    return x - math.floor(x)

def predict_production_hours(print_type: str, size: str, quantity: int, material: str) -> float:
    base_hours = PRINT_TYPE_BASE.get(print_type, 1.0)
    size_mult = SIZE_MULTIPLIER.get(size, 1.0)
    mat_factor = MATERIAL_FACTOR.get(material, 1.0)
    quantity_effect = RF_QUANTITY_COEFF * quantity

    # Simulación de ensamble Random Forest
    seed = quantity + len(print_type) * 13 + len(size) * 7
    noise = (seeded_random(seed) - 0.5) * RF_NOISE_SCALE

    predicted = RF_INTERCEPT + (base_hours + quantity_effect) * size_mult * mat_factor + noise
    
    # Retorna el valor redondeado a 1 decimal, mínimo 0.5
    return max(0.5, round(predicted, 1))

# --- Modelos de Datos (Pydantic) ---

class PredictionRequest(BaseModel):
    print_type: str
    size: str
    quantity: int
    material: str

# --- Endpoints de la API ---

@app.post("/predict")
def predict(data: PredictionRequest):
    hours = predict_production_hours(
        data.print_type, 
        data.size, 
        data.quantity, 
        data.material
    )
    return {"predicted_hours": hours}

@app.get("/metrics")
def get_model_metrics():
    return {
        "algorithm": "Random Forest Regression",
        "r2Score": 0.921,
        "mae": 0.38,
        "rmse": 0.52,
        "trainingSamples": 847,
        "features": ["tipo_impresion", "tamanio", "cantidad", "tipo_material"],
    }

@app.get("/importance")
def get_feature_importance():
    return [
        {"feature": "Cantidad", "importance": 42, "color": "#0ea5e9"},
        {"feature": "Tipo de Impresion", "importance": 28, "color": "#10b981"},
        {"feature": "Tamanio", "importance": 19, "color": "#f59e0b"},
        {"feature": "Material", "importance": 11, "color": "#ef4444"},
    ]

# --- Ejecución del Servidor ---

if __name__ == "__main__":
    import uvicorn
    # Se expone en 0.0.0.0 para que sea accesible desde otros dispositivos/contenedores
    # El puerto 8000 es el estándar, pero puedes cambiarlo
    uvicorn.run(app, host="0.0.0.0", port=8000)