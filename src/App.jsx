import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import ActivationPage from './pages/ActivationPage'
import FatiguePage from './pages/FatiguePage'
import CalendarPage from './pages/CalendarPage'
import FormPage from './pages/FormPage'
import { WorkoutProvider } from './context/WorkoutContext'

export default function App() {
  return (
    <WorkoutProvider>
      <BrowserRouter>
        <div className="app-shell">
          <NavBar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<ActivationPage />} />
              <Route path="/fatigue" element={<FatiguePage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/form" element={<FormPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </WorkoutProvider>
  )
}
