import React, { useState, useEffect } from 'react';
import PasswordInput from '../components/ui/PasswordInput';
import { 
  User,
  Calendar,
  Tag,
  Settings,
  Edit,
  Save,
  X,
  LogOut,
  MessageCircle,
  ArrowRight,
  Users,
  Trash2,
  Mail,
  Phone
} from 'lucide-react';
import { getCurrentUser, logout } from '../services/authService';
import { usersAPI } from '../services/apiService';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import RoleManagement from '../components/user/RoleManagement';
import InvitationCodeManager from '../components/user/InvitationCodeManager';
import SuccessNotification from '../components/common/SuccessNotification';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function UserPage() {
  const navigate = useNavigate();
  const { user: authUser, hasRole } = useAuth();
  const { isDarkMode } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showRoleManagement, setShowRoleManagement] = useState(false);
  const [showInvitationCodes, setShowInvitationCodes] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [profileData, setProfileData] = useState({
    nombre: '',
    email: '',
    telefono: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      console.log('🔄 Cargando datos del usuario en UserPage...');
      
      // Primero intentar obtener datos completos de la API
      const response = await usersAPI.getProfile();
      console.log('📡 Respuesta de la API en UserPage:', response);
      
      if (response.data && response.data.user) {
        const userData = response.data.user;
        setUser(userData);
        setProfileData({
          nombre: userData.nombre || '',
          email: userData.email || '',
          telefono: userData.telefono || ''
        });
        setImageUrl(userData.imagen_url || '');
        console.log('✅ Datos del usuario cargados desde API:', userData);
        console.log('🖼️ Imagen URL en UserPage:', userData.imagen_url);
      } else {
        console.log('⚠️ Respuesta de API sin datos de usuario en UserPage');
        // Fallback a datos del localStorage si la API falla
        const currentUser = getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setProfileData({
            nombre: currentUser.nombre || '',
            email: currentUser.email || '',
            telefono: currentUser.telefono || ''
          });
          setImageUrl(currentUser.imagen_url || '');
          console.log('⚠️ Usando datos del localStorage como fallback en UserPage');
        }
      }
    } catch (err) {
      console.error('❌ Error al cargar datos del usuario en UserPage:', err);
      console.error('❌ Detalles del error:', err.response?.data || err.message);
      
      // Fallback a datos del localStorage
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setProfileData({
          nombre: currentUser.nombre || '',
          email: currentUser.email || '',
          telefono: currentUser.telefono || ''
        });
        setImageUrl(currentUser.imagen_url || '');
        console.log('⚠️ Usando datos del localStorage como fallback en UserPage');
      }
      
      setError('Error al cargar datos del usuario: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Incluir la imagen URL en los datos del perfil
      const profileDataWithImage = {
        ...profileData,
        imagen_url: imageUrl
      };
      
      console.log('🔄 Actualizando perfil con datos:', profileDataWithImage);
      
      const response = await usersAPI.updateProfile(profileDataWithImage);
      const updatedUser = response.data.user;
      
      // Actualizar el estado local
      setUser(updatedUser);
      
      // Actualizar el localStorage con los datos actualizados del usuario
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Disparar un evento personalizado para notificar a otros componentes
      window.dispatchEvent(new CustomEvent('userUpdated', { detail: updatedUser }));
      
      setIsEditingProfile(false);
      setSuccessMessage('Perfil actualizado exitosamente');
      setShowSuccessNotification(true);
    } catch (err) {
      console.error('❌ Error al actualizar perfil:', err);
      setSuccessMessage('Error al actualizar perfil: ' + err.message);
      setShowSuccessNotification(true);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSuccessMessage('Las contraseñas no coinciden');
      setShowSuccessNotification(true);
      return;
    }

    setSaving(true);
    
    try {
      await usersAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsChangingPassword(false);
      setSuccessMessage('Contraseña actualizada exitosamente');
      setShowSuccessNotification(true);
    } catch (err) {
      setSuccessMessage('Error al cambiar contraseña: ' + err.message);
      setShowSuccessNotification(true);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateImage = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Verificar que hay un token antes de hacer la petición
      const token = localStorage.getItem('token');
      if (!token) {
        setSuccessMessage('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
      setShowSuccessNotification(true);
        return;
      }
      
      console.log('🔄 Actualizando imagen...', { imageUrl, hasToken: !!token });
      
      const response = await usersAPI.updateProfile({ imagen_url: imageUrl });
      const updatedUser = response.data.user;
      
      // Actualizar el estado local
      setUser(updatedUser);
      
      // Actualizar el localStorage con los datos actualizados del usuario
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Disparar un evento personalizado para notificar a otros componentes
      window.dispatchEvent(new CustomEvent('userUpdated', { detail: updatedUser }));
      
      setShowImageModal(false);
      setSuccessMessage('Imagen actualizada exitosamente');
      setShowSuccessNotification(true);
    } catch (err) {
      console.error('❌ Error al actualizar imagen:', err);
      setSuccessMessage('Error al actualizar imagen: ' + err.message);
      setShowSuccessNotification(true);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar tu imagen de perfil?')) {
      return;
    }

    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSuccessMessage('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
      setShowSuccessNotification(true);
        return;
      }
      
      console.log('🔄 Eliminando imagen...');
      
      const response = await usersAPI.updateProfile({ imagen_url: '' });
      const updatedUser = response.data.user;
      
      // Actualizar el estado local
      setUser(updatedUser);
      setImageUrl('');
      
      // Actualizar el localStorage con los datos actualizados del usuario
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Disparar un evento personalizado para notificar a otros componentes
      window.dispatchEvent(new CustomEvent('userUpdated', { detail: updatedUser }));
      
      setShowImageModal(false);
      setSuccessMessage('Imagen eliminada exitosamente');
      setShowSuccessNotification(true);
    } catch (err) {
      console.error('❌ Error al eliminar imagen:', err);
      setSuccessMessage('Error al eliminar imagen: ' + err.message);
      setShowSuccessNotification(true);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      logout();
      navigate('/auth');
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      administrador: 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-400',
      tecnico: 'bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald text-white border-eco-mountain-meadow',
      residente: 'bg-gradient-to-r from-eco-pear to-eco-emerald text-theme-primary border-eco-pear'
    };
    return colors[role] || colors.residente;
  };

  const getRoleIcon = (role) => {
    const icons = {
      administrador: '👑',
      tecnico: '🔧',
      residente: '👤'
    };
    return icons[role] || icons.residente;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-eco-scotch-mist via-white to-eco-pear/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-eco-mountain-meadow mx-auto"></div>
          <p className="mt-6 text-theme-primary font-bold text-xl">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-eco-scotch-mist via-white to-eco-pear/10 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-6 font-bold text-xl">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald text-white px-8 py-4 rounded-2xl hover:from-eco-mountain-meadow-dark hover:to-eco-emerald-dark transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-x-hidden ${isDarkMode ? 'bg-theme-primary' : 'bg-gradient-to-br from-eco-scotch-mist via-white to-eco-pear/10'}`}>
      <Header />
      <main className={`min-h-screen pt-24 ${isDarkMode ? 'bg-theme-primary' : 'bg-gradient-to-br from-eco-scotch-mist via-white to-eco-pear/10'}`}>
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Header del Perfil con diseño mejorado */}
          <div className="bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald rounded-3xl shadow-strong p-8 mb-8 text-white relative overflow-hidden">
            {/* Patrón decorativo de fondo */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
              <div className="absolute top-40 right-20 w-24 h-24 bg-white rounded-full"></div>
              <div className="absolute bottom-20 left-20 w-16 h-16 bg-white rounded-full"></div>
              <div className="absolute bottom-40 right-10 w-20 h-20 bg-white rounded-full"></div>
            </div>
            
            <div className="relative z-10 flex items-start justify-between mb-8">
              <div className="flex-1">
                <h1 className="text-5xl font-bold mb-4 text-white drop-shadow-lg">Mi Perfil</h1>
                <p className="text-white/90 text-xl leading-relaxed">
                  Gestiona tu información personal y configuración de cuenta
                </p>
              </div>
              
              {/* Avatar del Usuario mejorado */}
              <div className="ml-8 flex-shrink-0">
                <button
                  onClick={() => setShowImageModal(true)}
                  className="w-36 h-36 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm flex items-center justify-center hover:border-white/50 hover:shadow-3xl transition-all duration-300 cursor-pointer group hover:scale-105"
                >
                  {user?.imagen_url ? (
                    <img 
                      src={user.imagen_url} 
                      alt={`Avatar de ${user?.nombre || 'usuario'}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-center group-hover:scale-110 transition-transform duration-300">
                      <div className="text-5xl mb-2">👤</div>
                      <p className="text-white/80 text-sm font-medium">Sin imagen</p>
                    </div>
                  )}
                </button>
              </div>
            </div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className={`px-6 py-3 rounded-2xl font-bold text-sm border-2 backdrop-blur-sm ${getRoleColor(user?.rol)}`}>
                  {getRoleIcon(user?.rol)} {user?.rol?.charAt(0).toUpperCase() + user?.rol?.slice(1)}
                </span>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-2xl hover:bg-white/30 transition-all duration-300 font-bold flex items-center gap-3 shadow-lg hover:shadow-xl border border-white/30 hover:scale-105"
                >
                  <Edit size={20} />
                  {isEditingProfile ? 'Cancelar' : 'Editar Perfil'}
                </button>
              </div>
            </div>
          </div>

          {/* Información del Perfil con diseño mejorado */}
          <div className="bg-gradient-to-br from-bg-theme-primary to-eco-scotch-mist/30 rounded-3xl shadow-strong border border-theme-primary p-8 mb-8 backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-theme-primary mb-8 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald rounded-2xl flex items-center justify-center">
                <User size={24} className="text-white" />
              </div>
              Información Personal
            </h2>
            
            {isEditingProfile ? (
              <form onSubmit={handleUpdateProfile} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="block text-lg font-bold text-theme-primary">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      value={profileData.nombre}
                      onChange={(e) => setProfileData(prev => ({ ...prev, nombre: e.target.value }))}
                      className="w-full p-4 border-2 border-eco-pear rounded-2xl focus:outline-none focus:ring-4 focus:ring-eco-mountain-meadow/30 focus:border-eco-mountain-meadow bg-white/80 dark:bg-gray-700 backdrop-blur-sm text-theme-primary font-medium"
                      required
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-lg font-bold text-theme-primary">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full p-4 border-2 border-eco-pear rounded-2xl focus:outline-none focus:ring-4 focus:ring-eco-mountain-meadow/30 focus:border-eco-mountain-meadow bg-white/80 dark:bg-gray-700 backdrop-blur-sm text-theme-primary font-medium"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2 space-y-3">
                    <label className="block text-lg font-bold text-theme-primary">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={profileData.telefono}
                      onChange={(e) => {
                        const value = e.target.value;
                        const allowedChars = /^[0-9+\-\(\)\s]*$/;
                        if (allowedChars.test(value)) {
                          setProfileData(prev => ({ ...prev, telefono: value }));
                        }
                      }}
                      className="w-full p-4 border-2 border-eco-pear rounded-2xl focus:outline-none focus:ring-4 focus:ring-eco-mountain-meadow/30 focus:border-eco-mountain-meadow bg-white/80 dark:bg-gray-700 backdrop-blur-sm text-theme-primary font-medium"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-4 pt-8 border-t-2 border-eco-pear/30">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-8 py-4 border-2 border-eco-pear text-theme-primary rounded-2xl hover:bg-eco-pear/20 transition-all duration-300 font-bold hover:scale-105"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-4 bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald text-white rounded-2xl hover:from-eco-mountain-meadow-dark hover:to-eco-emerald-dark transition-all duration-300 font-bold flex items-center gap-3 disabled:opacity-50 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Tarjeta de Nombre */}
                <div className="flex flex-col items-center text-center p-8 bg-gradient-to-br from-bg-theme-secondary to-bg-theme-tertiary dark:from-gray-800 dark:to-gray-700 rounded-2xl border-2 border-eco-pear/30 dark:border-gray-600 hover:border-eco-emerald/50 dark:hover:border-gray-500 transition-all duration-300 hover:scale-105 group shadow-lg hover:shadow-xl">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 mb-6 shadow-lg">
                    <User size={28} className="text-white" />
                  </div>
                  <div className="w-full">
                    <p className="text-sm text-theme-primary/60 dark:text-gray-400 font-semibold mb-3 uppercase tracking-wide">Nombre</p>
                    <p className="font-bold text-theme-primary dark:text-white text-lg leading-relaxed break-words">{user?.nombre || 'No especificado'}</p>
                  </div>
                </div>

                {/* Tarjeta de Email */}
                <div className="flex flex-col items-center text-center p-8 bg-gradient-to-br from-bg-theme-secondary to-bg-theme-tertiary dark:from-gray-800 dark:to-gray-700 rounded-2xl border-2 border-eco-pear/30 dark:border-gray-600 hover:border-eco-emerald/50 dark:hover:border-gray-500 transition-all duration-300 hover:scale-105 group shadow-lg hover:shadow-xl">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 mb-6 shadow-lg">
                    <Mail size={28} className="text-white" />
                  </div>
                  <div className="w-full">
                    <p className="text-sm text-theme-primary/60 dark:text-gray-400 font-semibold mb-3 uppercase tracking-wide">Email</p>
                    <p className="font-bold text-theme-primary dark:text-white text-lg leading-relaxed break-words">{user?.email || 'No especificado'}</p>
                  </div>
                </div>

                {/* Tarjeta de Teléfono */}
                <div className="flex flex-col items-center text-center p-8 bg-gradient-to-br from-bg-theme-secondary to-bg-theme-tertiary dark:from-gray-800 dark:to-gray-700 rounded-2xl border-2 border-eco-pear/30 dark:border-gray-600 hover:border-eco-emerald/50 dark:hover:border-gray-500 transition-all duration-300 hover:scale-105 group shadow-lg hover:shadow-xl">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 mb-6 shadow-lg">
                    <Phone size={28} className="text-white" />
                  </div>
                  <div className="w-full">
                    <p className="text-sm text-theme-primary/60 dark:text-gray-400 font-semibold mb-3 uppercase tracking-wide">Teléfono</p>
                    <p className="font-bold text-theme-primary dark:text-white text-lg leading-relaxed break-words">
                      {(() => {
                        console.log('🔍 Debug teléfono:', {
                          telefono: user?.telefono,
                          email: user?.email,
                          userData: user
                        });
                        return user?.telefono || 'No especificado';
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cambio de Contraseña con diseño mejorado */}
          <div className="bg-gradient-to-br from-bg-theme-secondary to-bg-theme-tertiary rounded-3xl shadow-strong border border-eco-pear/20 dark:border-gray-600 p-8 mb-8 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-theme-primary flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                  <Settings size={24} className="text-white" />
                </div>
                Cambiar Contraseña
              </h2>
              <button
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-bold flex items-center gap-3 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Settings size={20} />
                {isChangingPassword ? 'Ocultar' : 'Cambiar Contraseña'}
              </button>
            </div>
            
            {isChangingPassword && (
              <form onSubmit={handleChangePassword} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="block text-lg font-bold text-theme-primary">
                      Contraseña Actual
                    </label>
                    <PasswordInput
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="p-4 border-2 border-eco-pear rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 bg-white/80 dark:bg-gray-700 backdrop-blur-sm font-medium"
                      required
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-lg font-bold text-theme-primary">
                      Nueva Contraseña
                    </label>
                    <PasswordInput
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="p-4 border-2 border-eco-pear rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 bg-white/80 dark:bg-gray-700 backdrop-blur-sm font-medium"
                      required
                      minLength="6"
                    />
                  </div>
                  
                  <div className="md:col-span-2 space-y-3">
                    <label className="block text-lg font-bold text-theme-primary">
                      Confirmar Nueva Contraseña
                    </label>
                    <PasswordInput
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="p-4 border-2 border-eco-pear rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 bg-white/80 dark:bg-gray-700 backdrop-blur-sm font-medium"
                      required
                      minLength="6"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-4 pt-8 border-t-2 border-eco-pear/30">
                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(false)}
                    className="px-8 py-4 border-2 border-eco-pear text-theme-primary rounded-2xl hover:bg-eco-pear/20 transition-all duration-300 font-bold hover:scale-105"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-bold flex items-center gap-3 disabled:opacity-50 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Cambiando...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        Cambiar Contraseña
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Gestión de Roles (Solo para Administradores) con diseño mejorado */}
          {hasRole('administrador') && (
            <div className="bg-gradient-to-br from-bg-theme-secondary to-bg-theme-tertiary rounded-3xl shadow-strong border border-eco-pear/20 dark:border-gray-600 p-8 mb-8 backdrop-blur-sm" data-role-management>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <Users size={28} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-theme-primary">Gestión de Roles</h2>
                    <p className="text-theme-primary/70 font-medium">Administra los roles de los usuarios de tu condominio</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowRoleManagement(!showRoleManagement)}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 font-bold flex items-center gap-3 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Users size={20} />
                  {showRoleManagement ? 'Ocultar Gestión' : 'Gestionar Roles'}
                </button>
              </div>

              {showRoleManagement && <RoleManagement />}
            </div>
          )}

          {/* Gestión de Códigos de Invitación (Solo para Administradores) con diseño mejorado */}
          {hasRole('administrador') && (
            <div className="bg-gradient-to-br from-bg-theme-secondary to-bg-theme-tertiary rounded-3xl shadow-strong border border-eco-pear/20 dark:border-gray-600 p-8 mb-8 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
                    <Tag size={28} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-theme-primary">Códigos de Invitación</h2>
                    <p className="text-theme-primary/70 font-medium">Genera códigos para que nuevos residentes se unan a tu condominio</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowInvitationCodes(!showInvitationCodes)}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-2xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-bold flex items-center gap-3 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Tag size={20} />
                  {showInvitationCodes ? 'Ocultar Códigos' : 'Gestionar Códigos'}
                </button>
              </div>

              {showInvitationCodes && <InvitationCodeManager />}
            </div>
          )}


          {/* Acciones Rápidas con diseño mejorado */}
          <div className="bg-gradient-to-br from-bg-theme-secondary to-bg-theme-tertiary rounded-3xl shadow-strong border border-eco-pear/20 dark:border-gray-600 p-8 mb-8 backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-theme-primary mb-8 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald rounded-2xl flex items-center justify-center">
                <MessageCircle size={24} className="text-white" />
              </div>
              Acciones Rápidas
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <button
                onClick={() => navigate('/select-garden')}
                className="p-8 bg-gradient-to-r from-eco-pear/10 to-eco-emerald/10 dark:from-gray-700 dark:to-gray-600 rounded-2xl border-2 border-eco-pear/30 dark:border-gray-600 hover:border-eco-emerald/50 dark:hover:border-gray-500 transition-all duration-300 hover:shadow-xl group hover:scale-105"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      🌱
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-theme-primary text-xl">Mis Huertos</h3>
                      <p className="text-theme-primary/70 font-medium">Gestiona tus huertos</p>
                    </div>
                  </div>
                  <ArrowRight size={24} className="text-theme-primary/50 group-hover:text-eco-mountain-meadow transition-colors group-hover:scale-110" />
                </div>
              </button>

              <button
                onClick={handleLogout}
                className="p-8 bg-gradient-to-r from-red-50 to-orange-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl border-2 border-red-200 dark:border-gray-600 hover:border-red-300 dark:hover:border-gray-500 transition-all duration-300 hover:shadow-xl group hover:scale-105"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <LogOut size={28} className="text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-theme-primary text-xl">Cerrar Sesión</h3>
                      <p className="text-theme-primary/70 font-medium">Salir de tu cuenta</p>
                    </div>
                  </div>
                  <ArrowRight size={24} className="text-theme-primary/50 group-hover:text-red-500 transition-colors group-hover:scale-110" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Modal para actualizar imagen con diseño mejorado */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-white to-eco-scotch-mist/30 rounded-3xl shadow-3xl max-w-md w-full p-8 border border-eco-pear/20 backdrop-blur-sm" style={{backgroundColor: '#ffebad'}}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-theme-primary">Actualizar Imagen de Perfil</h3>
              <button
                onClick={() => setShowImageModal(false)}
                className="text-theme-primary/50 hover:text-theme-primary transition-colors hover:scale-110"
              >
                <X size={28} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateImage} className="space-y-6">
              <div className="space-y-3">
                <label className="block text-lg font-bold text-theme-primary">
                  URL de la Imagen
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="w-full p-4 border-2 border-eco-pear rounded-2xl focus:outline-none focus:ring-4 focus:ring-eco-mountain-meadow/30 focus:border-eco-mountain-meadow bg-white/80 dark:bg-gray-700 backdrop-blur-sm text-theme-primary font-medium"
                />
              </div>
              
              {imageUrl && (
                <div className="mt-6">
                  <label className="block text-lg font-bold text-theme-primary mb-3">
                    Vista Previa
                  </label>
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-eco-pear/30 mx-auto shadow-lg">
                    <img 
                      src={imageUrl} 
                      alt="Vista previa"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-gradient-to-br from-eco-pear/20 to-eco-emerald/20 flex items-center justify-center text-theme-primary/70 text-sm font-medium hidden">
                      Error al cargar
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t-2 border-eco-pear/30 gap-4">
                {/* Botón Eliminar */}
                <button
                  type="button"
                  onClick={handleDeleteImage}
                  disabled={!user?.imagen_url || saving}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-md hover:shadow-lg text-sm"
                >
                  <Trash2 size={16} />
                  Eliminar Foto
                </button>
                
                {/* Botones de Acción */}
                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setShowImageModal(false)}
                    className="px-6 py-3 border-2 border-eco-pear text-theme-primary rounded-2xl hover:bg-eco-pear/20 transition-all duration-300 font-bold hover:scale-105"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald text-white rounded-xl hover:from-eco-mountain-meadow-dark hover:to-eco-emerald-dark transition-all duration-200 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 shadow-md hover:shadow-lg hover:scale-105 text-sm"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Guardar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Notificación de éxito personalizada */}
      <SuccessNotification
        isVisible={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
        title="¡Operación Completada!"
        message={successMessage}
        type="garden"
        duration={4000}
      />

    </div>
  );
}