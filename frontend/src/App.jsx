import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Report from './pages/Report';
import AdminPanel from './pages/AdminPanel';
import RSIDSearch from './pages/RSIDSearch';
import './index.css';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('geneshield_token');
  return token ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const token = localStorage.getItem('geneshield_token');
  if (!token) return <Navigate to="/login" replace />;
  const user = JSON.parse(localStorage.getItem('geneshield_user') || '{}');
  return user.isAdmin ? children : <Navigate to="/dashboard" replace />;
}

function PublicOnlyRoute({ children }) {
  const token = localStorage.getItem('geneshield_token');
  return token ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
        <Route path="/search" element={<RSIDSearch />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/report/:id" element={<ProtectedRoute><Report /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
