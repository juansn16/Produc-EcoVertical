import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/layout/card';
import { User, Leaf, Droplets, Flower, Package, Activity } from 'lucide-react';
import statisticsService from '@/services/statisticsService';

const UserStatsCard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      setLoading(true);
      const userStats = await statisticsService.getFormattedUserStatistics();
      setStats(userStats);
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
          <CardTitle>Mis Estadísticas</CardTitle>
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
          <CardTitle>Mis Estadísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500">
            <p>Error al cargar estadísticas</p>
            <button
              onClick={loadUserStats}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Reintentar
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { gardens, summary, recentActivity } = stats || {};

  const statItems = [
    {
      title: 'Huertos',
      value: summary?.total_huertos || 0,
      icon: Leaf,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      unit: 'huertos'
    },
    {
      title: 'Agua Usada',
      value: summary?.total_agua_usada || 0,
      icon: Droplets,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      unit: 'L'
    },
    {
      title: 'Plantas Sembradas',
      value: summary?.total_plantas_sembradas || 0,
      icon: Flower,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      unit: 'plantas'
    },
    {
      title: 'Cosechado',
      value: summary?.total_cosechado || 0,
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      unit: 'unidades'
    },
    {
      title: 'Abono Usado',
      value: summary?.total_abono_usado || 0,
      icon: Activity,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      unit: 'kg'
    },
    {
      title: 'Tratamientos',
      value: summary?.total_tratamientos_plagas || 0,
      icon: User,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      unit: 'aplicados'
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Mis Estadísticas
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
              <div className="text-xs text-gray-500">{item.unit}</div>
            </div>
          ))}
        </div>

        {gardens && gardens.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold text-gray-700 mb-3">Mis Huertos</h4>
            <div className="space-y-2">
              {gardens.slice(0, 3).map((garden, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                      <Leaf className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{garden.nombre}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {garden.tipo}
                  </div>
                </div>
              ))}
              {gardens.length > 3 && (
                <div className="text-center text-sm text-gray-500 mt-2">
                  +{gardens.length - 3} huertos más
                </div>
              )}
            </div>
          </div>
        )}

        {recentActivity && recentActivity.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold text-gray-700 mb-3">Actividad Reciente</h4>
            <div className="space-y-2">
              {recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">
                    {activity.nombre_huerto}: {activity.tipo_comentario || 'Registro'}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserStatsCard;


