import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/layout/card';
import { TrendingUp, Users, MapPin, Leaf, Package, AlertTriangle } from 'lucide-react';
import statisticsService from '@/services/statisticsService';

const SystemStatsCard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSystemStats();
  }, []);

  const loadSystemStats = async () => {
    try {
      setLoading(true);
      const systemStats = await statisticsService.getFormattedSystemStatistics();
      setStats(systemStats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Estadísticas del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Estadísticas del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Error al cargar estadísticas</p>
            <button
              onClick={loadSystemStats}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Reintentar
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { overview, topGardens } = stats || {};

  const statItems = [
    {
      title: 'Usuarios',
      value: overview?.total_usuarios || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Huertos',
      value: overview?.total_huertos || 0,
      icon: Leaf,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Ubicaciones',
      value: overview?.total_ubicaciones || 0,
      icon: MapPin,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Proveedores',
      value: overview?.total_proveedores || 0,
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Inventario',
      value: overview?.total_inventario || 0,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      title: 'Proveedores',
      value: overview?.total_proveedores || 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Estadísticas del Sistema
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {statItems.map((item, index) => (
            <div key={index} className="text-center p-4 rounded-lg">
              <div className={`${item.bgColor} ${item.color} p-3 rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center`}>
                <item.icon className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{item.value}</div>
              <div className="text-sm text-gray-600">{item.title}</div>
            </div>
          ))}
        </div>

        {topGardens && topGardens.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold text-gray-700 mb-3">Top Huertos por Actividad</h4>
            <div className="space-y-2">
              {topGardens.slice(0, 5).map((garden, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium">{garden.nombre}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {garden.total_registros} registros
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemStatsCard;


