# Machine Learning Model | Function Section
###### Group: Montañez Fabrizio | Vilchez Joaquim

## Descripción

Este proyecto contiene el modelo de Machine Learning desarrollado para el sistema **Impresiones Express**. Su objetivo es analizar datos históricos de pedidos y generar predicciones que ayuden a optimizar la gestión de servicios de impresión.

El modelo fue desarrollado en Python utilizando bibliotecas de análisis de datos y aprendizaje automático. Además, se encuentra preparado para integrarse con aplicaciones web mediante una API, permitiendo que el sistema principal consulte predicciones en tiempo real.

## Tecnologías Utilizadas

* Python
* Pandas
* NumPy
* Scikit-Learn
* Joblib/Pickle
* FastAPI
* Docker

## Estructura General

* **Dataset:** Datos utilizados para el entrenamiento y validación del modelo.
* **Modelo Entrenado:** Archivo serializado listo para ser utilizado en producción.
* **API de Predicción:** Servicio encargado de recibir solicitudes y devolver predicciones.
* **Docker:** Configuración para desplegar el modelo en entornos portables y reproducibles.

## Objetivo

Proporcionar predicciones automatizadas que apoyen la toma de decisiones dentro de la plataforma Impresiones Express, mejorando la eficiencia operativa y la experiencia de los usuarios.