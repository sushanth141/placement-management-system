import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import ChangePassword from './pages/ChangePassword';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CompanyDashboard from './pages/CompanyDashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route element={<PrivateRoute roles={['student', 'company', 'admin']} />}>
            <Route path="/change-password" element={<ChangePassword />} />
          </Route>

          <Route element={<PrivateRoute roles={['student']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
          </Route>

          <Route element={<PrivateRoute roles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          <Route element={<PrivateRoute roles={['company']} />}>
            <Route path="/company/dashboard" element={<CompanyDashboard />} />
          </Route>

          <Route path="/unauthorized" element={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f0f1a', color: '#fff', fontSize: '2rem' }}>
              🚫 403 — Access Denied
            </div>
          } />
          <Route path="*" element={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f0f1a', color: '#fff', fontSize: '2rem' }}>
              404 — Page Not Found
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
