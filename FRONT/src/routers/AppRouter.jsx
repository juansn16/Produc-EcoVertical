import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AuthPage from "@/pages/AuthPage";
import HomePage from "@/pages/HomePage";
import GardenPage from "@/pages/GardenPage";
import Prueba from "@/pages/prueas";
import UserPage from "@/pages/UserPage";
import EstadisticasHuerto from "@/pages/EstadisticasHuerto";
import Inventario from "@/pages/Inventario";
import Proveedores from "@/pages/Proveedores";
import IrrigationAlertsPage from "@/pages/IrrigationAlertsPage";
import { isAuthenticated } from "@/services/authService";
import MapaTest from "@/components/garden/MapaTest";
import MapaSimple from "@/components/garden/MapaSimple";
import FormularioTest from "@/components/garden/FormularioTest";
import WebSocketStatus from "@/components/WebSocketStatus";


import AromaticasPage from "@/pages/AromaticasPage";
import VerdurasPage from "@/pages/VerdurasPage";
import OrnamentalesPage from "@/pages/OrnamentalesPage";
import FrutasPage from "@/pages/FrutasPage";
import HortalizasHojasPage from "@/pages/HortalizasHojasPage";
import HortalizasPequeñoPage from "@/pages/HortalizasPequeñoPage";
import CommentsPage from "@/pages/CommentsPage";
import TermsPage from "@/pages/TermsPage";
import PrivacyPage from "@/pages/PrivacyPage";
// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    setIsAuth(isAuthenticated());
  }, []);

  if (isAuth === null) {
    // Mostrar loading mientras verifica autenticación
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eco-mountain-meadow"></div>
      </div>
    );
  }

  return isAuth ? children : <Navigate to="/auth" replace />;
};

// Componente para rutas públicas (solo para usuarios no autenticados)
const PublicRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    setIsAuth(isAuthenticated());
  }, []);

  if (isAuth === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eco-mountain-meadow"></div>
      </div>
    );
  }

  return isAuth ? <Navigate to="/user" replace /> : children;
};

const AppRoutes = () => {
  return (
    <>
      <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<PublicRoute><AuthPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><AuthPage /></PublicRoute>} />
      
      <Route path="/aromaticas" element={<AromaticasPage />} />
      <Route path="/verduras" element={<VerdurasPage />} />
      <Route path="/ornamentales" element={<OrnamentalesPage />} />
      <Route path="/frutas" element={<FrutasPage />} />
      <Route path="/hortalizas-hojas" element={<HortalizasHojasPage />} />
      <Route path="/hortalizas-pequeno" element={<HortalizasPequeñoPage />} />
      
      {/* Rutas legales */}
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      
      {/* Ruta especial para mostrar formularios de auth (accesible siempre) */}
      <Route path="/auth" element={<AuthPage />} />
      
      {/* Rutas protegidas  <ProtectedRoute> */} 
      <Route path="/select-garden" element={<ProtectedRoute><GardenPage /></ProtectedRoute>} />
      <Route path="/user" element={<ProtectedRoute><UserPage /></ProtectedRoute>} />
      <Route path="/comments/:gardenId" element={<ProtectedRoute><CommentsPage /></ProtectedRoute>} />
      <Route path="/Estadisticas" element={<EstadisticasHuerto />} />
      <Route path="/inventario" element={<Inventario />} />
      <Route path="/proveedores" element={<Proveedores />} />
      <Route path="/irrigation-alerts" element={<ProtectedRoute><IrrigationAlertsPage /></ProtectedRoute>} />

      {/* Ruta de prueba (pública) */}
      <Route path="/prueba" element={<Prueba />} />
      
      {/* Ruta de prueba del mapa */}
      <Route path="/mapa-test" element={<MapaTest />} />
      
      {/* Ruta de prueba del mapa simple */}
      <Route path="/mapa-simple" element={<MapaSimple />} />
      
      {/* Ruta de prueba del formulario */}
      <Route path="/formulario-test" element={<FormularioTest />} />
      
      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Componente de estado WebSocket */}
      <WebSocketStatus />
    </>
  );
};

export default AppRoutes;