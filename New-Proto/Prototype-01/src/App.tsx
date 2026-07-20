import { Navigate, Route, Routes } from 'react-router-dom'

import { Home } from './pages/Home.tsx';
import { Login } from './pages/Login.tsx';
import { Dashboard } from './pages/Dashboard.tsx';
import Prediction from './pages/Prediction.tsx';
import { OrdersSection } from './components/OrdersSection';
import { AnalyticsSection } from './components/AnalyticsSection';
import { NewOrderSection } from './components/NewOrderSection.tsx';
import { ReportsSection } from './components/ReportsSection.tsx';
import { ModelEvaluationSection } from './components/ModelEvaluationSection.tsx';
import { ProductionOptimizationSection } from './components/ProductionOptimizationSection.tsx';

import './App.css'

function App() {

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      {/* RUTA ANIDADA PADRE */}
      <Route path="/dashboard" element={<Dashboard />}>
        {/* 'index' le dice a React Router que pinte este componente por defecto en /dashboard */}
        <Route index element={<AnalyticsSection />} />

        {/* Esta sub-ruta pintará las órdenes en /dashboard/orders */}
        <Route path="orders" element={<OrdersSection />} />
        {/* Esta sub-ruta pintará la sección de nuevas órdenes en /dashboard/new-order */}
        <Route path="new-order" element={<NewOrderSection />} />

        <Route path="reports" element={<ReportsSection />} />
        
        {/* Nuevas secciones de ML */}
        <Route path="model-evaluation" element={<ModelEvaluationSection />} />
        <Route path="production-optimization" element={<ProductionOptimizationSection />} />
      </Route>

      <Route path="/prediction" element={<Prediction />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App