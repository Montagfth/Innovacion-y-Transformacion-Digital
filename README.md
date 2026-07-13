# Innovacion & Tranformacion Digital | Proyecto: "Impresiones Express"

###### Desarrollador(es): Montañez Fabrizio | Vilchez Joaquim | Felix Salim | Huapaya Jhordan

Sistema de gestión de pedidos de impresión y diseño industrial con predicción de tiempos de producción.

## 🚀 Características

- **Dashboard**: Monitoreo de KPIs y métricas de producción en tiempo real
- **Gestión de Pedidos**: Ciclo de vida de órdenes (Producción -> Completado)
- **Predicción ML**: Motor de Machine Learning simulado para estimar tiempos de producción
- **Reportes**: Análisis de precisión de predicciones vs tiempos reales
- **Autenticación**: Sistema de autenticación local (Escalabilidad con exposicion de API de Autenticacion Propias)
- **Diseño Responsivo**: Interfaz moderna, dinamica y amigable

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Uso |
| :--- | :--- | :--- |
| React | 18.3.1 | UI library |
| TypeScript | 5.5.3 | Type safety |
| Tailwind CSS | 3.4.1 | Estilos |
| Turso Database | 0.5.0 | Database in Cloud (AWS) |
| Lucide React | 0.344.0 | Iconos |

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- npm o yarn

## 🔧 Instalación

1. Clona el repositorio:
```bash
   git clone <url-del-repositorio>
   cd New-Proto/
   cd Prototype-01/
   ```

2. Instala las dependencias:
```bash
   npm install
   ```

3. No es necesario la configuracion de variables de entorno de Turso, debido a que se encuentra tanto TOKEN_KEY como URL_DB en el frontend.
   (NO ES RECOMENDABLE. Solo se uso ello como proyecto academico).
   
```env
   TURSO_DATABASE_URL={Aqui va la URL de la base de datos desplegada en turso}
   TURSO_DATABASE_ANON_KEY={Aqui va la clave token de Turso}
   ```

4. Ejecuta el servidor de desarrollo:
```bash
   npm run dev
   ```

5. Abre http://localhost:5173 en tu navegador

## 📂 Estructura del Proyecto

```text
Impresiones-Express/
├── src/
│   ├── components/     # Componentes reutilizables
│   │   ├── Navbar.tsx
│   │   └── StatusBadge.tsx
│   ├── lib/            # Lógica de negocio y utilidades
│   │   ├── mlModel.ts  # Motor de predicción ML
│   │   ├── supabase.ts # Cliente de Supabase
│   │   └── edgeFunctions.ts
│   ├── pages/          # Páginas de la aplicación
│   │   ├── Auth.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Landing.tsx
│   │   ├── NewOrder.tsx
│   │   ├── Orders.tsx
│   │   └── Reports.tsx
│   ├── App.tsx         # Componente principal
│   ├── main.tsx        # Punto de entrada
│   └── index.css       # Estilos globales
├── supabase/
│   └── functions/      # Edge Functions de Supabase
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🎯 Funcionalidades Principales

### Dashboard
- Visualización de KPIs de producción
- Estadísticas de pedidos por estado
- Métricas de rendimiento

### Gestión de Pedidos
- Lista de todos los pedidos con filtros
- Actualización de estado en tiempo real
- Vista detallada de cada orden

### Nuevo Pedido
- Formulario para crear nuevas órdenes
- Estimación automática de tiempo de producción
- Validación de datos

### Reportes
- Comparación de predicciones vs tiempos reales
- Gráficos de precisión del modelo ML
- Análisis de tendencias

## 🔐 Autenticación

El sistema utiliza Supabase Auth para gestionar la autenticación de usuarios. Solo los usuarios autenticados pueden acceder a las vistas de gestión (Dashboard, Orders, Reports).

## 🤖 Motor de Predicción ML

El proyecto incluye un motor de Machine Learning simulado (`mlModel.ts`) que predice los tiempos de producción basándose en:

- Tipo de impresión
- Material utilizado
- Tamaño del modelo

## 📦 Scripts Disponibles

```bash
npm run dev       # Inicia servidor de desarrollo
npm run build     # Compila para producción
npm run preview   # Previsualiza la build de producción
npm run lint      # Ejecuta ESLint
npm run typecheck # Verifica tipos TypeScript
```

## 🌐 Despliegue

Para desplegar en producción:

1. Compila el proyecto:
```bash
   npm run build
   ```
2. Asegúrate de configurar las variables de entorno en tu plataforma de despliegue.

## 📄 Licencia

Universidad Tecnologica del Peru | Innovacion & Transformacion Digital (AFL-3.0)
