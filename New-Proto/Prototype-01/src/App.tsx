import { Navigate, Route, Routes } from 'react-router-dom'

import { Home } from './pages/Home.tsx';
import { Login } from './pages/Login.tsx';
import { Dashboard } from './pages/Dashboard.tsx';
import Prediction from './pages/Prediction.tsx';
import { OrdersSection } from './components/OrdersSection';
import { AnalyticsSection } from './components/AnalyticsSection';
import { NewOrderSection } from './components/NewOrderSection.tsx';

import './App.css'

function App() {

  // const [ loading, setLoading ] = useState<boolean>(true)

  // // function fetch()
  // const [ data, setData ] = useState<PredictionData | null>(null)

  // type PredictionData = {
  //   model: string;
  //   estimated_time: number;
  // }

  // useEffect(()=>{
  //   const fetchData = async(): Promise<PredictionData> => {
  //     // NOTA: Se puede usar distintos algorimos de ML, como decision_tree, random_forest, neural_network, cambiando la ruta de la API.
  //     const response = await fetch("https://proyecto-desarrollo-jmfd.onrender.com/prediction/?job_type=Banner&quantity=10000&size=A2&material=Bond&isColored=true&model=linear_regression")
  //     if (!response.ok) {
  //       throw new Error('Error fetching data')
  //     }
  //     const json = await response.json()
  //     if (json && json.model && json.estimated_time) {
  //       return {
  //         model: json.model,
  //         estimated_time: json.estimated_time
  //       }
  //     } else {
  //       throw new Error('Invalid data format')
  //     }
  //   }
  //   fetchData()
  //     .then((responseData) => {
  //       setLoading(false)
  //       setData(responseData)
  //     })
  //     .catch((error) => {
  //       console.error(error)
  //     })
  // }, [])

  // Retorno en JS
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
      </Route>

      <Route path="/prediction" element={<Prediction />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App
