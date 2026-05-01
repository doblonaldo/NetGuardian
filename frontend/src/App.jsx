import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Validations from './pages/Validations';
import DeviceDetails from './pages/DeviceDetails';
import Devices from './pages/Devices';
import Telemetry from './pages/Telemetry';

function App() {
  return (
    <Router>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/telemetry" element={<Telemetry />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/devices/:id" element={<DeviceDetails />} />
          <Route path="/audits" element={<Validations />} />
          {/* Outras rotas podem ser adicionadas futuramente */}
        </Routes>
      </DashboardLayout>
    </Router>
  );
}

export default App;
