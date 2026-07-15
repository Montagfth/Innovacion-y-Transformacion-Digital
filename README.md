# Innovacion & Transformacion Digital | Proyecto: Sistema Inteligente de Planificacion de Produccion - "Impresiones Express"  
  
###### Desarrollador(es): Montañez Fabrizio | Vilchez Joaquim | Felix Salim | Huapaya Jhordan  
  
Sistema de gestión de pedidos de impresión y diseño industrial con predicción  
de tiempos de producción mediante Machine Learning y asignación automática de  
máquinas por prioridad y disponibilidad.  
  
## 🚀 Características  
  
- **Dashboard**: Monitoreo de KPIs y métricas de producción (sección de analíticas  
  con gráficos SVG y métricas del modelo ML).  
- **Gestión de Pedidos**: Ciclo de vida de órdenes (Pendiente → Producción →  
  Completado) con tabla y asignación de máquina vía modal.  
- **Predicción ML**: Consulta en paralelo a tres modelos (Regresión Lineal,  
  Random Forest, Árbol de Decisión) expuestos por una API externa.  
- **Reportes**: Análisis de precisión de predicciones vs tiempos reales.  
- **Autenticación**: Login local del lado del cliente (proyecto académico).  
- **Diseño Responsivo**: Interfaz moderna con CSS por módulo.  
  
## 🛠️ Stack Tecnológico  
  
| Tecnología       | Versión  | Uso                              |  
| :--------------- | :------- | :------------------------------- |  
| React            | 19.2.7   | Librería de UI                   |  
| React Router DOM | 7.18.1   | Enrutamiento SPA                 |  
| TypeScript       | ~6.0.2   | Tipado estático                  |  
| Vite             | 8.1.1    | Bundler / dev server             |  
| @libsql/client   | 0.17.4   | Cliente de Turso (LibSQL) en nube|  
| ESLint           | 10.6.0   | Linter                           |  
  
> Los estilos se implementan con **CSS plano por módulo** (por ejemplo  
> `Dashboard.css`, `AnalyticsSection.css`, `NewOrderSection.css`,  
> `ReportsModule.css`, `Login.css`). No se usa Tailwind, Supabase ni Lucide.  
  
## 📋 Requisitos Previos  
  
- Node.js (v18 o superior)  
- npm o yarn  
  
## 🔧 Instalación  
  
1. Clona el repositorio:  
   ```bash  
   git clone <url-del-repositorio>  
   cd Innovacion-y-Transformacion-Digital/New-Proto/Prototype-01

2. Instalar las dependencias:
```bash
   npm install
   ```

3. Configuración de la base de datos:
Actualmente las credenciales de Turso (TURSO_DB_URL y TURSO_TOKEN) están
escritas directamente en src/services/OrderServices.ts.
(NO ES RECOMENDABLE. Solo se usó así por ser un proyecto académico. Lo ideal
es migrarlas a variables de entorno con import.meta.env y un archivo .env.)
   
```env
   TURSO_DATABASE_URL={Aqui va la URL de la base de datos desplegada en turso}
   TURSO_DATABASE_ANON_KEY={Aqui va la clave token de Turso}
   ```

4. Ejecuta el servidor de desarrollo:
```bash
   npm run dev
   ```

5. Abre http://localhost:5173 en tu navegador.
Credenciales de acceso: admin@admin.com / admin1.

## 📂 Estructura del Proyecto

```text
Prototype-01/  
├── src/  
│   ├── components/                 # Componentes de UI  
│   │   ├── AnalyticsSection.tsx / .css  
│   │   ├── NewOrderSection.tsx / .css  
│   │   ├── OrdersSection.tsx  
│   │   ├── OrderTable.tsx  
│   │   ├── PredictionForm.tsx  
│   │   ├── PredictionResult.tsx  
│   │   ├── ReportsSection.tsx  
│   │   ├── ReportsTable.tsx  
│   │   └── ReportsModule.css  
│   ├── pages/                      # Páginas / rutas  
│   │   ├── Home.tsx  
│   │   ├── Login.tsx / Login.css  
│   │   ├── Dashboard.tsx / Dashboard.css  
│   │   └── Prediction.tsx  
│   ├── services/                   # Capa de datos y ML  
│   │   ├── OrderServices.ts        # CRUD de órdenes en Turso  
│   │   └── PredictionService.ts    # Consumo de la API de predicción  
│   ├── types/                      # Interfaces TypeScript  
│   │   ├── Order.ts  
│   │   ├── Prediction.ts  
│   │   └── PredictionRequest.ts  
│   ├── App.tsx                     # Definición de rutas  
│   └── main.tsx                    # Punto de entrada (BrowserRouter)  
├── index.html  
├── package.json  
├── vite.config.ts  
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json  
└── eslint.config.js
```

🎯 Funcionalidades Principales
Dashboard (/dashboard)
- Sección de analíticas (índice) con KPIs y gráficos.
- Subrutas: orders, new-order, reports.
Gestión de Pedidos (/dashboard/orders)
- Tabla de pedidos y asignación de máquina.
- Actualización de estado a "Completado".
Nuevo Pedido (/dashboard/new-order)
- Formulario de creación de órdenes.
- Estimación de tiempo consultando tres modelos ML en paralelo.
Reportes (/dashboard/reports)
- Comparación de predicciones vs tiempos reales.

## 🔐 Autenticación

El sistema utiliza una validación local en el cliente (src/pages/Login.tsx)
con credenciales fijas para fines académicos. No hay backend de autenticación
ni protección de rutas; es un punto pendiente de escalar a una API propia

## 🤖 Motor de Predicción ML

La predicción NO es un módulo local: src/services/PredictionService.ts y
src/components/NewOrderSection.tsx consumen una API externa desplegada en
Render que expone tres algoritmos (linear_regression, random_forest,
decision_tree).
- Modelo ML en Python: https://github.com/Montagfth/Proyecto-Desarrollo.git
El sistema consulta los tres en paralelo y selecciona una
predicción según los tiempos estimados devueltos.

Parámetros enviados:
- Tipo de trabajo 
- Cantidad
- Tamaño 
- Material
- Color/B/N
- Modelo ML a usar

## 📦 Scripts Disponibles

```bash
npm run dev       # Inicia servidor de desarrollo  
npm run build     # Compila para producción (tsc -b && vite build)  
npm run preview   # Previsualiza la build de producción  
npm run lint      # Ejecuta ESLint
```

## 🌐 Despliegue

Para desplegar en producción:

1. Compila el proyecto:
```bash
   npm run build
   ```
2. Publica el contenido de dist/ en tu plataforma de hosting estático.
3. (Recomendado) Migra las credenciales de Turso a variables de entorno de la
plataforma antes de publicar.

## 📄 Licencia

Universidad Tecnologica del Peru | Innovacion & Transformacion Digital (AFL-3.0)
