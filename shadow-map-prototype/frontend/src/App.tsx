import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './components/Dashboard';
import CommandCenter from './components/CommandCenter';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { DisasterProvider } from './context/DisasterContext';
import NavigationBar from './components/layout/NavigationBar';

const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <NavigationBar />
    <main className="flex-1">
      {children}
    </main>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <DisasterProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <Dashboard />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/command"
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <CommandCenter />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/demo"
              element={
                <AuthenticatedLayout>
                  <Dashboard isDemo={true} />
                </AuthenticatedLayout>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DisasterProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
