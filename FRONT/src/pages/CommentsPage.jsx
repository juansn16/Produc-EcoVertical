import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Search,
  Filter,
  Plus,
  User,
  Calendar,
  Tag,
  MessageCircle,
  Droplets,
  Sprout,
  Scissors,
  Leaf,
  Bug,
  Wrench,
  X,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { usePagination } from '../hooks/usePagination';
import { getGardenDetails, updateGardenImage, deleteGarden } from '../services/gardenService';
import { getCommentsByGarden, createComment, updateComment, deleteComment } from '../services/commentService';
import { getCurrentUser } from '../services/authService';
import { useCommentPermissions } from '../hooks/useCommentPermissions';
import { useTheme } from '../contexts/ThemeContext';
import GardenResidentManager from '../components/garden/GardenResidentManager';
import GardenUnsubscribeButton from '../components/garden/GardenUnsubscribeButton';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import SuccessNotification from '../components/common/SuccessNotification';
import ConfirmDialog from '../components/common/ConfirmDialog';

export default function CommentsPage() {
  const { gardenId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [garden, setGarden] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Estados para el diálogo de confirmación
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Hook para manejar permisos de comentarios
  const { permissions, loading: permissionsLoading, canEditComment, canDeleteComment } = useCommentPermissions(gardenId, currentUser);
  
  // Función para obtener el estilo de la etiqueta de rol
  const getRoleTagStyle = (role) => {
    switch (role) {
      case 'administrador':
        return 'bg-red-500/20 text-red-700 border-red-300';
      case 'tecnico':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-300';
      case 'residente':
        return 'bg-green-500/20 text-green-700 border-green-300';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-300';
    }
  };

  // Función para obtener el texto del rol
  const getRoleText = (role) => {
    switch (role) {
      case 'administrador':
        return 'Admin';
      case 'tecnico':
        return 'Técnico';
      case 'residente':
        return 'Residente';
      default:
        return 'Usuario';
    }
  };

  // Función para verificar si el usuario que comenta es el dueño del huerto
  const isGardenOwner = (comment) => {
    return garden && garden.usuario_creador === comment.usuario_id;
  };
  
  // Función para recargar permisos cuando cambien los residentes
  const handleResidentChange = () => {
    // Forzar recarga del componente para actualizar permisos
    window.location.reload();
  };
  
  const [statsData, setStatsData] = useState({
    tipo_comentario: 'general',
    cantidad_agua: '',
    unidad_agua: 'ml',
    cantidad_siembra: '',
    cantidad_cosecha: '',
    cantidad_abono: '',
    unidad_abono: 'kg', // Nueva unidad de abono
    cantidad_plagas: '',
    cantidad_mantenimiento: '',
    unidad_mantenimiento: 'minutos', // Nueva unidad de tiempo
    plaga_especie: '',
    plaga_nivel: 'pocos',
    siembra_relacionada: '', // ID de la siembra relacionada para cosecha
    cambio_tierra: '', // Campo para abono: si se cambió la tierra
    huerto_siembra_id: '', // Campo para relacionar con siembras (excepto producción)
    nombre_siembra: '' // Nombre descriptivo de la siembra
  });
  const [showImageModal, setShowImageModal] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [showCommentDetailModal, setShowCommentDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    contenido: '',
    tipo_comentario: 'general',
    cantidad_agua: '',
    unidad_agua: 'ml',
    cantidad_siembra: '',
    cantidad_cosecha: '',
    cantidad_abono: '',
    unidad_abono: 'kg', // Nueva unidad de abono
    cantidad_plagas: '',
    cantidad_mantenimiento: '',
    unidad_mantenimiento: 'minutos', // Nueva unidad de tiempo
    plaga_especie: '',
    plaga_nivel: 'pocos',
    siembra_relacionada: '',
    cambio_tierra: '',
    huerto_siembra_id: '',
    nombre_siembra: ''
  });
  const [siembrasDisponibles, setSiembrasDisponibles] = useState([]);

  // currentUser ahora se carga de forma asíncrona en loadCurrentUser()

  // Categorías de comentarios con conteo y nueva paleta
  const categories = [
    { id: 'all', name: 'Todos', count: comments.length, color: 'bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald text-white shadow-lg border-eco-mountain-meadow' },
    { id: 'general', name: 'General', count: comments.filter(c => c.tipo_comentario === 'general').length, color: isDarkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-eco-pear/20 text-theme-primary border-eco-pear/30' },
    { id: 'riego', name: 'Riego', count: comments.filter(c => c.tipo_comentario === 'riego').length, color: isDarkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-eco-mountain-meadow/20 text-eco-mountain-meadow-dark border-eco-mountain-meadow/30' },
    { id: 'siembra', name: 'Siembra', count: comments.filter(c => c.tipo_comentario === 'siembra').length, color: isDarkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-eco-emerald/20 text-eco-emerald-dark border-eco-emerald/30' },
    { id: 'cosecha', name: 'Cosecha', count: comments.filter(c => c.tipo_comentario === 'cosecha').length, color: isDarkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-eco-pear/30 text-theme-primary border-eco-pear/30' },
    { id: 'abono', name: 'Abono', count: comments.filter(c => c.tipo_comentario === 'abono').length, color: isDarkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-orange-100 text-orange-700 border-orange-200' },
    { id: 'plagas', name: 'Plagas', count: comments.filter(c => c.tipo_comentario === 'plagas').length, color: isDarkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-red-100 text-red-700 border-red-200' },
    { id: 'mantenimiento', name: 'Mantenimiento', count: comments.filter(c => c.tipo_comentario === 'mantenimiento').length, color: isDarkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-purple-100 text-purple-700 border-purple-200' }
  ];


  useEffect(() => {
    if (gardenId) {
      loadGardenData();
      loadComments();
      loadCurrentUser();
    }
  }, [gardenId]);

  const loadGardenData = async () => {
    try {
      const response = await getGardenDetails(gardenId);
      setGarden(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        // Huerto no encontrado, redirigir a selección de huertos
        navigate('/select-garden');
        return;
      }
      setError('Error al cargar datos del huerto: ' + err.message);
    }
  };

  const loadComments = async () => {
    try {
      const response = await getCommentsByGarden(gardenId);
      setComments(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        // Huerto no encontrado, redirigir a selección de huertos
        navigate('/select-garden');
        return;
      }
      setError('Error al cargar comentarios: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const user = getCurrentUser();
      console.log('👤 Usuario cargado:', user);
      console.log('👤 Rol del usuario:', user?.rol || user?.role);
      console.log('👤 ID del usuario:', user?.id);
      setCurrentUser(user);
    } catch (err) {
      console.error('Error al cargar usuario actual:', err);
      // No es crítico si no se puede cargar el usuario
    }
  };

  // Función para obtener siembras disponibles para cosecha
  const getSiembrasDisponibles = () => {
    const siembras = comments.filter(comment => comment.tipo_comentario === 'siembra');
    
    // Crear lista con nombres de siembra o fechas como fallback
    const siembrasFormateadas = siembras.map(siembra => {
      const fecha = new Date(siembra.fecha_creacion).toLocaleDateString('es-ES');
      const nombre = siembra.nombre_siembra || `Siembra del ${fecha}`;
      
      return {
        id: siembra.id,
        label: nombre,
        fecha: fecha,
        cantidad: siembra.cantidad_siembra || 0,
        nombre_siembra: siembra.nombre_siembra
      };
    });

    // Ordenar por fecha de creación (más reciente primero)
    return siembrasFormateadas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  };

  // Función para obtener el nombre de una siembra por ID
  const getSiembraNameById = (siembraId) => {
    const siembras = getSiembrasDisponibles();
    const siembra = siembras.find(s => s.id === siembraId);
    return siembra ? siembra.label : 'Siembra no encontrada';
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const commentData = {
        huerto_id: gardenId,
        contenido: newComment,
        tipo_comentario: statsData.tipo_comentario,
        ...(statsData.tipo_comentario !== 'general' && {
          cantidad_agua: statsData.cantidad_agua ? parseFloat(statsData.cantidad_agua) : undefined,
          unidad_agua: statsData.unidad_agua || 'ml',
          cantidad_siembra: statsData.cantidad_siembra ? parseInt(statsData.cantidad_siembra) : undefined,
          cantidad_cosecha: statsData.cantidad_cosecha ? parseInt(statsData.cantidad_cosecha) : undefined,
          cantidad_abono: statsData.cantidad_abono ? parseFloat(statsData.cantidad_abono) : undefined,
          unidad_abono: statsData.unidad_abono || 'kg',
          // Nuevo formato plagas
          plaga_especie: statsData.plaga_especie || undefined,
          plaga_nivel: statsData.plaga_nivel || undefined,
          cantidad_mantenimiento: statsData.cantidad_mantenimiento ? parseFloat(statsData.cantidad_mantenimiento) : undefined,
          unidad_mantenimiento: statsData.unidad_mantenimiento || 'minutos',
          fecha_actividad: new Date().toISOString().split('T')[0],
          // Relación siembra-cosecha
          siembra_relacionada: statsData.siembra_relacionada || undefined,
          // Nuevos campos - usar la misma lógica que siembra_relacionada
          cambio_tierra: statsData.cambio_tierra || undefined,
          huerto_siembra_id: statsData.huerto_siembra_id || undefined,
          nombre_siembra: statsData.nombre_siembra || undefined
        })
      };

      // Log para debuggear datos de plagas
      if (statsData.tipo_comentario === 'plagas') {
        console.log('🐛 Frontend - Datos de plagas a enviar:', {
          plaga_especie: statsData.plaga_especie,
          plaga_nivel: statsData.plaga_nivel,
          commentData: commentData
        });
      }

      // Log para debuggear datos de mantenimiento
      if (statsData.tipo_comentario === 'mantenimiento') {
        console.log('🔧 Frontend - Datos de mantenimiento a enviar:', {
          cantidad_mantenimiento: statsData.cantidad_mantenimiento,
          unidad_mantenimiento: statsData.unidad_mantenimiento,
          commentData: commentData
        });
      }

      const response = await createComment(gardenId, commentData);
      setComments(prev => [response.data, ...prev]);
      setNewComment('');
      setStatsData({
        tipo_comentario: 'general',
        cantidad_agua: '',
        unidad_agua: 'ml',
        cantidad_siembra: '',
        cantidad_cosecha: '',
        cantidad_abono: '',
        cantidad_plagas: '',
        cantidad_mantenimiento: '',
        unidad_mantenimiento: 'minutos',
        plaga_especie: '',
        plaga_nivel: 'pocos',
        siembra_relacionada: '',
        cambio_tierra: '',
        huerto_siembra_id: '',
        nombre_siembra: ''
      });
      setShowCommentModal(false);
    } catch (err) {
      setSuccessMessage('Error al crear comentario: ' + err.message);
      setShowSuccessNotification(true);
    }
  };

  const handleUpdateComment = async (commentId, content) => {
    try {
      const response = await updateComment(commentId, { contenido: content });
      setComments(prev => 
        prev.map(comment => 
          comment.id === commentId ? response.data : comment
        )
      );
      setEditingComment(null);
    } catch (err) {
      setSuccessMessage('Error al actualizar comentario: ' + err.message);
      setShowSuccessNotification(true);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const comment = comments.find(c => c.id === commentId);
    setCommentToDelete(comment);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!commentToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteComment(commentToDelete.id);
      setComments(prev => prev.filter(comment => comment.id !== commentToDelete.id));
      // Si el comentario eliminado estaba seleccionado, cerrar el modal
      if (selectedComment && selectedComment.id === commentToDelete.id) {
        setShowCommentDetailModal(false);
        setSelectedComment(null);
      }
      setSuccessMessage('Comentario eliminado exitosamente');
      setShowSuccessNotification(true);
    } catch (err) {
      setSuccessMessage('Error al eliminar comentario: ' + err.message);
      setShowSuccessNotification(true);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setCommentToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setCommentToDelete(null);
  };

  // Funciones para eliminar jardín
  const handleDeleteGarden = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDeleteGarden = async () => {
    if (!garden) return;
    
    setDeleting(true);
    try {
      await deleteGarden(garden.id);
      setSuccessMessage(`Jardín "${garden.nombre}" eliminado exitosamente`);
      setShowSuccessNotification(true);
      
      // Redirigir a la página de selección de jardines después de un breve delay
      setTimeout(() => {
        navigate('/select-garden');
      }, 2000);
    } catch (error) {
      console.error('Error al eliminar jardín:', error);
      setSuccessMessage('Error al eliminar el jardín: ' + error.message);
      setShowSuccessNotification(true);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleCancelDeleteGarden = () => {
    setShowDeleteModal(false);
  };

  const handleViewCommentDetail = (comment) => {
    setSelectedComment(comment);
    setShowCommentDetailModal(true);
  };

  const handleCloseCommentDetail = () => {
    setShowCommentDetailModal(false);
    setSelectedComment(null);
  };

  const handleUpdateCommentFromDetail = async (commentId, newContent) => {
    try {
      await updateComment(commentId, { contenido: newContent });
      setComments(comments.map(comment => 
        comment.id === commentId 
          ? { ...comment, contenido: newContent }
          : comment
      ));
      // Actualizar el comentario seleccionado si es el mismo
      if (selectedComment && selectedComment.id === commentId) {
        setSelectedComment({ ...selectedComment, contenido: newContent });
      }
    } catch (err) {
      setSuccessMessage('Error al actualizar comentario: ' + err.message);
      setShowSuccessNotification(true);
    }
  };

  const handleOpenEditModal = (comment) => {
    setEditData({
      contenido: comment.contenido,
      tipo_comentario: comment.tipo_comentario,
      cantidad_agua: comment.cantidad_agua || '',
      unidad_agua: comment.unidad_agua || 'ml',
      cantidad_siembra: comment.cantidad_siembra || '',
      cantidad_cosecha: comment.cantidad_cosecha || '',
      cantidad_abono: comment.cantidad_abono || '',
      unidad_abono: comment.unidad_abono || 'kg',
      cantidad_plagas: comment.cantidad_plagas || '',
      cantidad_mantenimiento: comment.cantidad_mantenimiento || '',
      unidad_mantenimiento: comment.unidad_mantenimiento || 'minutos',
      plaga_especie: comment.plaga_especie || '',
      plaga_nivel: comment.plaga_nivel || 'pocos',
      siembra_relacionada: comment.siembra_relacionada || '',
      cambio_tierra: comment.cambio_tierra || '',
      huerto_siembra_id: comment.huerto_siembra_id || '',
      nombre_siembra: comment.nombre_siembra || ''
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditData({
      contenido: '',
      tipo_comentario: 'general',
      cantidad_agua: '',
      unidad_agua: 'ml',
      cantidad_siembra: '',
      cantidad_cosecha: '',
      cantidad_abono: '',
      cantidad_plagas: '',
      cantidad_mantenimiento: '',
      unidad_mantenimiento: 'minutos',
      plaga_especie: '',
      plaga_nivel: 'pocos',
      siembra_relacionada: '',
      cambio_tierra: '',
      huerto_siembra_id: '',
      nombre_siembra: ''
    });
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!editData.contenido.trim()) return;

    try {
      const updateData = {
        contenido: editData.contenido,
        tipo_comentario: editData.tipo_comentario,
        ...(editData.tipo_comentario !== 'general' && {
          cantidad_agua: editData.cantidad_agua ? parseFloat(editData.cantidad_agua) : undefined,
          unidad_agua: editData.unidad_agua || 'ml',
          cantidad_siembra: editData.cantidad_siembra ? parseInt(editData.cantidad_siembra) : undefined,
          cantidad_cosecha: editData.cantidad_cosecha ? parseInt(editData.cantidad_cosecha) : undefined,
          cantidad_abono: editData.cantidad_abono ? parseFloat(editData.cantidad_abono) : undefined,
          unidad_abono: editData.unidad_abono || 'kg',
          plaga_especie: editData.plaga_especie || undefined,
          plaga_nivel: editData.plaga_nivel || undefined,
          cantidad_mantenimiento: editData.cantidad_mantenimiento ? parseFloat(editData.cantidad_mantenimiento) : undefined,
          unidad_mantenimiento: editData.unidad_mantenimiento || 'minutos',
          fecha_actividad: new Date().toISOString().split('T')[0],
          siembra_relacionada: editData.siembra_relacionada || undefined,
          // Nuevos campos - usar la misma lógica que siembra_relacionada
          cambio_tierra: editData.cambio_tierra || undefined,
          huerto_siembra_id: editData.huerto_siembra_id || undefined,
          nombre_siembra: editData.nombre_siembra || undefined
        })
      };

      const response = await updateComment(selectedComment.id, updateData);
      setComments(prev => 
        prev.map(comment => 
          comment.id === selectedComment.id ? response.data : comment
        )
      );
      
      // Actualizar el comentario seleccionado
      setSelectedComment(response.data);
      
      handleCloseEditModal();
      setShowCommentDetailModal(false);
    } catch (err) {
      setSuccessMessage('Error al actualizar comentario: ' + err.message);
      setShowSuccessNotification(true);
    }
  };

  const handleUpdateImage = async () => {
    if (!newImageUrl.trim()) return;
    
    setIsUpdatingImage(true);
    try {
      await updateGardenImage(gardenId, newImageUrl);
      setGarden(prev => ({ ...prev, imagen_url: newImageUrl }));
      setNewImageUrl('');
      setShowImageModal(false);
      setSuccessMessage('Imagen actualizada exitosamente en la base de datos');
      setShowSuccessNotification(true);
    } catch (err) {
      setSuccessMessage('Error al actualizar imagen: ' + err.message);
      setShowSuccessNotification(true);
    } finally {
      setIsUpdatingImage(false);
    }
  };

  // Filtrar comentarios basado en búsqueda y categoría
  const filteredComments = comments.filter(comment => {
    const matchesSearch = comment.contenido.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         comment.usuario_nombre?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || comment.tipo_comentario === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Paginación para comentarios
  const {
    paginatedData: paginatedComments,
    currentPage,
    totalPages,
    goToPage,
    goToNextPage,
    goToPrevPage,
    resetPagination
  } = usePagination(filteredComments, 6); // 6 comentarios por página

  // Resetear paginación cuando cambien los filtros
  useEffect(() => {
    resetPagination();
  }, [searchQuery, selectedCategory, resetPagination]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-eco-scotch-mist via-white to-eco-pear/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-eco-mountain-meadow mx-auto"></div>
          <p className="mt-6 text-theme-primary font-bold text-xl">Cargando comentarios...</p>
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
      <Header type="Administrador" />
      <main className={`min-h-screen pt-24 ${isDarkMode ? 'bg-theme-primary' : 'bg-gradient-to-br from-eco-scotch-mist via-white to-eco-pear/10'}`}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header del Huerto con diseño mejorado */}
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
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => navigate('/select-garden')}
                    className="flex items-center gap-3 text-white/80 hover:text-white transition-colors hover:scale-105"
                  >
                    <ArrowLeft size={24} />
                    <span className="font-bold text-lg">Escoger Huerto</span>
                  </button>
                  
                  {/* Botón eliminar jardín - propietarios de sus huertos + admin/técnicos de cualquier huerto */}
                  {((garden?.usuario_creador === currentUser?.id) || 
                    ((currentUser?.rol || currentUser?.role) === 'administrador' || 
                     (currentUser?.rol || currentUser?.role) === 'tecnico')) && (
                    <button
                      onClick={handleDeleteGarden}
                      className="flex items-center gap-2 text-red-300 hover:text-red-200 hover:bg-red-500/20 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                      title="Eliminar jardín"
                    >
                      <Trash2 size={20} />
                      <span className="font-medium">Eliminar Jardín</span>
                    </button>
                  )}
                </div>
                <h1 className="text-5xl font-bold mb-4 text-white drop-shadow-lg">
                  Comentarios - {garden?.nombre || 'Mi Huerto'}
                </h1>
                <p className="text-white/90 text-xl leading-relaxed">
                  {garden?.descripcion || 'Sin descripción disponible'}
                </p>
              </div>
              
              {/* Imagen del Huerto mejorada */}
              <div className="ml-8 flex-shrink-0">
                <div className="relative group">
                  <div className="w-56 h-56 rounded-3xl overflow-hidden border-4 border-white/30 shadow-2xl bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm">
                    {garden?.imagen_url ? (
                      <img 
                        src={garden.imagen_url} 
                        alt={`Imagen de ${garden?.nombre || 'huerto'}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          console.error('❌ Error cargando imagen del huerto:', garden.imagen_url);
                          // Mostrar mensaje de error en lugar de reemplazar la imagen
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                        onLoad={() => {
                          console.log('✅ Imagen del huerto cargada correctamente:', garden.imagen_url);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-6xl mb-3">🌱</div>
                          <p className="text-white/80 text-sm font-medium">Sin imagen</p>
                        </div>
                      </div>
                    )}
                    {/* Mensaje de error de imagen (solo se muestra si falla la carga) */}
                    <div className="w-full h-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center" style={{ display: 'none' }}>
                      <div className="text-center">
                        <div className="text-6xl mb-3">⚠️</div>
                        <p className="text-red-600 text-sm font-medium">Error cargando imagen</p>
                        <p className="text-red-500 text-xs mt-1 break-all">URL: {garden?.imagen_url}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Overlay para cambiar imagen (admin/tecnico o dueño del huerto) */}
                  {((currentUser?.rol === 'administrador' || currentUser?.rol === 'tecnico') || 
                    (garden?.usuario_creador === currentUser?.id)) && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 rounded-3xl flex items-center justify-center">
                      <button
                        onClick={() => setShowImageModal(true)}
                        className="opacity-0 group-hover:opacity-100 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-2xl font-bold hover:bg-white/30 transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl hover:scale-105"
                      >
                        <span className="text-xl">📷</span>
                        Cambiar Imagen
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="relative z-10 flex items-center justify-between mb-8">
              {(() => {
                console.log('🔍 Debug permisos:', {
                  canCreate: permissions.canCreate,
                  reason: permissions.reason,
                  userRole: currentUser?.rol || currentUser?.role,
                  userId: currentUser?.id,
                  permissionsLoading
                });
                return permissions.canCreate;
              })() ? (
                <button
                  onClick={() => setShowCommentModal(true)}
                  className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-2xl hover:bg-white/30 transition-all duration-300 font-bold flex items-center gap-3 shadow-lg hover:shadow-xl border border-white/30 hover:scale-105"
                >
                  <Plus size={24} />
                  Agregar Comentario
                </button>
              ) : (
                <div className="bg-gradient-to-r from-eco-pear/20 to-eco-emerald/20 border-2 border-eco-pear/30 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xl font-bold">ℹ️</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-theme-primary font-bold text-xl mb-2">
                        Información Importante
                      </h3>
                      <p className="text-theme-primary/80 font-medium leading-relaxed">
                        {permissions.reason === 'residente_no_asignado' 
                          ? 'Solo puedes comentar en huertos donde eres residente asignado. Puedes ver todos los comentarios, pero para participar necesitas ser invitado por el administrador del huerto.'
                          : 'No tienes permisos para crear comentarios en este huerto. Contacta al administrador si necesitas acceso.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Botón de darse de baja para residentes */}
              {permissions.canUnsubscribe && (
                <GardenUnsubscribeButton 
                  gardenId={gardenId}
                  gardenName={garden?.nombre}
                  currentUser={currentUser}
                  onUnsubscribe={() => {
                    // Recargar la página o actualizar el estado
                    window.location.reload();
                  }}
                />
              )}
            </div>
            
            {/* Información del huerto con diseño mejorado */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-6 p-8 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105 group">
                <div className="w-16 h-16 bg-white/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <User size={28} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/80 font-bold mb-2">Creador</p>
                  <p className="font-bold text-white text-xl">{garden?.creador_nombre || 'Usuario'}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 p-8 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105 group">
                <div className="w-16 h-16 bg-white/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Calendar size={28} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/80 font-bold mb-2">Creado</p>
                  <p className="font-bold text-white text-xl">
                    {garden?.created_at ? new Date(garden.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 p-8 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105 group">
                <div className="w-16 h-16 bg-white/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Tag size={28} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/80 font-bold mb-2">Tipo</p>
                  <p className="font-bold text-white text-xl">{garden?.tipo || 'Privado'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Gestión de Residentes (solo para administradores) */}
          {(() => {
            console.log('🔍 Debug gestión de residentes:', {
              canManageResidents: permissions.canManageResidents,
              userRole: currentUser?.rol || currentUser?.role,
              userId: currentUser?.id,
              permissionsLoading
            });
            return permissions.canManageResidents;
          })() && (
            <div className="mb-8">
              <GardenResidentManager 
                gardenId={gardenId}
                gardenName={garden?.nombre}
                currentUser={currentUser}
                onResidentChange={handleResidentChange}
              />
            </div>
          )}

          {/* Panel de Búsqueda y Filtros con diseño mejorado */}
          <div className="bg-gradient-to-br from-theme-secondary to-theme-tertiary dark:from-theme-primary dark:to-theme-secondary rounded-3xl shadow-strong border border-eco-pear/20 dark:border-eco-pear/30 p-8 mb-8 backdrop-blur-sm">
            {/* Barra de Búsqueda */}
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-theme-secondary" size={24} />
                <input
                  type="text"
                  placeholder="Buscar comentarios, usuarios o contenido..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-16 pr-6 py-5 border-2 border-eco-pear dark:border-eco-pear/70 rounded-2xl focus:outline-none focus:ring-4 focus:ring-eco-mountain-meadow/30 focus:border-eco-mountain-meadow bg-theme-secondary dark:bg-theme-tertiary backdrop-blur-sm text-theme-primary font-medium text-lg placeholder-theme-secondary/50"
                />
              </div>
            </div>

            {/* Filtros por Categoría */}
            <div>
              <h3 className="text-2xl font-bold text-theme-primary mb-8 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald rounded-2xl flex items-center justify-center">
                  <Filter size={20} className="text-white" />
                </div>
                Filtrar por categoría:
              </h3>
              <div className="flex flex-wrap gap-4">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 border-2 ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald text-white shadow-lg border-eco-mountain-meadow hover:scale-105'
                        : `${category.color} hover:shadow-md hover:scale-105 border-eco-pear/30`
                    }`}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Lista de Comentarios */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedComments.length > 0 ? (
              paginatedComments.map((comment) => (
                <div 
                  key={comment.id} 
                  onClick={() => handleViewCommentDetail(comment)}
                  className={`bg-white dark:bg-slate-900 rounded-3xl shadow-strong border-2 p-6 hover:shadow-xl transition-all duration-300 h-fit cursor-pointer hover:scale-105 backdrop-blur-sm ${
                    comment.tipo_comentario === 'riego' ? 'border-eco-mountain-meadow/30 dark:border-eco-mountain-meadow/50 hover:border-eco-mountain-meadow/50 dark:hover:border-eco-mountain-meadow/70' :
                    comment.tipo_comentario === 'siembra' ? 'border-eco-emerald/30 dark:border-eco-emerald/50 hover:border-eco-emerald/50 dark:hover:border-eco-emerald/70' :
                    comment.tipo_comentario === 'cosecha' ? 'border-eco-pear/30 dark:border-eco-pear/50 hover:border-eco-pear/50 dark:hover:border-eco-pear/70' :
                    comment.tipo_comentario === 'abono' ? 'border-orange-300/30 dark:border-orange-400/50 hover:border-orange-300/50 dark:hover:border-orange-400/70' :
                    comment.tipo_comentario === 'plagas' ? 'border-red-300/30 dark:border-red-400/50 hover:border-red-300/50 dark:hover:border-red-400/70' :
                    comment.tipo_comentario === 'mantenimiento' ? 'border-purple-300/30 dark:border-purple-400/50 hover:border-purple-300/50 dark:hover:border-purple-400/70' :
                    'border-eco-pear/30 dark:border-eco-pear/50 hover:border-eco-pear/50 dark:hover:border-eco-pear/70'
                  }`}
                >
                  {/* Header de la tarjeta con categoría en la esquina superior derecha */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      {/* Título del comentario */}
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">
                        {comment.tipo_comentario === 'general' ? 'Comentario General' : 
                         comment.tipo_comentario === 'riego' ? 'Actividad de Riego' :
                         comment.tipo_comentario === 'siembra' ? 'Actividad de Siembra' :
                         comment.tipo_comentario === 'cosecha' ? 'Actividad de Cosecha' :
                         comment.tipo_comentario === 'abono' ? 'Actividad de Abono' :
                         comment.tipo_comentario === 'plagas' ? 'Control de Plagas' :
                         comment.tipo_comentario === 'mantenimiento' ? 'Mantenimiento' : 'Comentario'}
                      </h3>
                      
                      {/* Descripción del comentario */}
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3 line-clamp-3">
                        {comment.contenido}
                      </p>
                      
                      {/* Indicador de click */}
                      <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mb-2">
                        <span>👆</span>
                        <span>Haz clic para ver detalles</span>
                      </div>

                      {/* Datos asociados solo del tipo de comentario */}
                      {comment.tipo_comentario === 'riego' && (
                        <div className="mt-2 space-y-1">
                          <div className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md inline-block">
                            💧 Agua: {comment.cantidad_agua ? `${comment.cantidad_agua} ${comment.unidad_agua || 'ml'}` : 'No especificada'}
                          </div>
                          {comment.huerto_siembra_id && (
                            <div className="text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-md inline-block">
                              🌱 Huerto de: {getSiembraNameById(comment.huerto_siembra_id)}
                            </div>
                          )}
                        </div>
                      )}
                      {comment.tipo_comentario === 'siembra' && (
                        <div className="mt-2 text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-md inline-block">
                          🌱 Siembra: {comment.cantidad_siembra ? `${parseInt(comment.cantidad_siembra)} unidades` : 'No especificada'}
                        </div>
                      )}
                      {comment.tipo_comentario === 'cosecha' && (
                        <div className="mt-2 space-y-1">
                          <div className="text-xs bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded-md inline-block">
                            ✂️ Producción: {comment.cantidad_cosecha ? `${parseInt(comment.cantidad_cosecha)} unidades` : 'No especificada'}
                          </div>
                          {comment.siembra_relacionada && (
                            <div className="text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-md inline-block">
                              🌱 De siembra: {getSiembraNameById(comment.siembra_relacionada)}
                            </div>
                          )}
                        </div>
                      )}
                      {comment.tipo_comentario === 'abono' && (
                        <div className="mt-2 space-y-1">
                          <div className="text-xs bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-md inline-block">
                            🍃 Abono: {comment.cantidad_abono ? `${parseFloat(comment.cantidad_abono)} kg` : 'No especificado'}
                          </div>
                          {comment.cambio_tierra && (
                            <div className="text-xs bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-md inline-block">
                              🌱 Tierra: {comment.cambio_tierra === 'si' ? 'Cambiada completamente' : 'Agregada por encima'}
                            </div>
                          )}
                          {comment.huerto_siembra_id && (
                            <div className="text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-md inline-block">
                              🌱 Huerto de: {getSiembraNameById(comment.huerto_siembra_id)}
                            </div>
                          )}
                        </div>
                      )}
                      {comment.tipo_comentario === 'plagas' && (
                        <div className="mt-2 space-y-1">
                          <div className="text-xs bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded-md inline-flex items-center gap-2">
                            <span>🐛</span>
                            <span>Nivel: {comment.plaga_nivel_texto || comment.plaga_nivel || 'No especificado'}</span>
                            {comment.plaga_especie && (
                              <span className="ml-2">| Especie: {comment.plaga_especie}</span>
                            )}
                          </div>
                          {comment.huerto_siembra_id && (
                            <div className="text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-md inline-block">
                              🌱 Huerto de: {getSiembraNameById(comment.huerto_siembra_id)}
                            </div>
                          )}
                        </div>
                      )}
                      {comment.tipo_comentario === 'mantenimiento' && (
                        <div className="mt-2 space-y-1">
                          <div className="text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-md inline-block">
                            🔧 {comment.cantidad_mantenimiento && comment.unidad_mantenimiento 
                              ? `${comment.cantidad_mantenimiento} ${comment.unidad_mantenimiento}`
                              : 'Tiempo no registrado'
                            }
                          </div>
                          {comment.huerto_siembra_id && (
                            <div className="text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-md inline-block">
                              🌱 Huerto de: {getSiembraNameById(comment.huerto_siembra_id)}
                            </div>
                          )}
                        </div>
                      )}
                      {comment.tipo_comentario === 'general' && (
                        <div className="mt-2 text-xs bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md inline-block">
                          📝 Comentario general
                        </div>
                      )}
                    </div>

                    {/* Etiqueta de categoría destacada en la esquina superior derecha */}
                    <div className="ml-3 flex-shrink-0">
                      <span className={`px-3 py-2 rounded-2xl text-sm font-bold text-white shadow-lg ${
                        comment.tipo_comentario === 'riego' ? 'bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald' :
                        comment.tipo_comentario === 'siembra' ? 'bg-gradient-to-r from-eco-emerald to-eco-pear' :
                        comment.tipo_comentario === 'cosecha' ? 'bg-gradient-to-r from-eco-pear to-yellow-400' :
                        comment.tipo_comentario === 'abono' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                        comment.tipo_comentario === 'plagas' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                        comment.tipo_comentario === 'mantenimiento' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                        'bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald'
                      }`}>
                        {comment.tipo_comentario.charAt(0).toUpperCase() + comment.tipo_comentario.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Tags del comentario con nueva paleta */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-2 bg-eco-pear/20 dark:bg-eco-pear/30 text-theme-primary dark:text-white text-sm rounded-xl font-bold flex items-center gap-2">
                      <div className="w-2 h-2 bg-eco-cape-cod rounded-full"></div>
                      {comment.tipo_comentario.charAt(0).toUpperCase() + comment.tipo_comentario.slice(1)}
                    </span>
                    {comment.usuario_nombre && (
                      <span className="px-3 py-2 bg-eco-mountain-meadow/20 dark:bg-eco-mountain-meadow/30 text-eco-mountain-meadow-dark dark:text-eco-mountain-meadow text-sm rounded-xl font-bold flex items-center gap-2">
                        <div className="w-2 h-2 bg-eco-mountain-meadow rounded-full"></div>
                        {comment.usuario_nombre}
                      </span>
                    )}
                    {/* Etiqueta de rol cuando el usuario no es el dueño del huerto */}
                    {comment.usuario_rol && !isGardenOwner(comment) && (
                      <span className={`px-3 py-2 text-sm rounded-xl font-bold flex items-center gap-2 border ${getRoleTagStyle(comment.usuario_rol)}`}>
                        <div className={`w-2 h-2 rounded-full ${
                          comment.usuario_rol === 'administrador' ? 'bg-red-500' :
                          comment.usuario_rol === 'tecnico' ? 'bg-blue-500' :
                          comment.usuario_rol === 'residente' ? 'bg-green-500' :
                          'bg-gray-500'
                        }`}></div>
                        {getRoleText(comment.usuario_rol)}
                      </span>
                    )}
                    <span className="px-3 py-2 bg-eco-emerald/20 dark:bg-eco-emerald/30 text-eco-emerald-dark dark:text-eco-emerald-light text-sm rounded-xl font-bold flex items-center gap-2">
                      <div className="w-2 h-2 bg-eco-emerald rounded-full"></div>
                      Actividad
                    </span>
                  </div>

                  {/* Metadata con autor y fecha */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5">
                        <User size={12} />
                        {comment.usuario_nombre || 'Usuario'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        {new Date(comment.fecha_creacion).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Botones de acción */}
                    {(canEditComment(comment) || canDeleteComment(comment)) && (
                      <div 
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {canEditComment(comment) && (
                          <button
                            onClick={() => setEditingComment(editingComment === comment.id ? null : comment.id)}
                            className="p-1 text-gray-400 dark:text-gray-500 hover:text-[#2E8B57] hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Editar comentario"
                          >
                            <MessageCircle size={14} />
                          </button>
                        )}
                        {canDeleteComment(comment) && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Eliminar comentario"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Formulario de edición inline */}
                  {editingComment === comment.id && (
                    <div 
                      className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <textarea
                        defaultValue={comment.contenido}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E8B57] resize-none text-xs"
                        rows="2"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleUpdateComment(comment.id, document.querySelector(`textarea[defaultvalue="${comment.contenido}"]`).value)}
                          className="px-2 py-1 bg-[#2E8B57] text-white text-xs rounded-lg hover:bg-[#1f6b3f] transition-colors font-medium"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditingComment(null)}
                          className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded-lg hover:bg-gray-400 transition-colors font-medium"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-strong border border-gray-200 dark:border-gray-600 backdrop-blur-sm">
                <div className="w-20 h-20 bg-gradient-to-r from-eco-mountain-meadow/20 to-eco-emerald/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle size={40} className="text-theme-primary/50" />
                </div>
                <h3 className="text-2xl font-bold text-theme-primary mb-3">No hay comentarios</h3>
                <p className="text-theme-primary/70 dark:text-white text-lg mb-6">¡Sé el primero en comentar sobre este huerto!</p>
                <button
                  onClick={() => setShowCommentModal(true)}
                  className="bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald text-white px-8 py-4 rounded-2xl hover:from-eco-mountain-meadow-dark hover:to-eco-emerald-dark transition-all duration-300 font-bold flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Plus size={20} />
                  Agregar Primer Comentario
                </button>
              </div>
            )}
          </div>

          {/* Controles de Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-eco-mountain-meadow/30 rounded-lg hover:bg-eco-mountain-meadow/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
                Anterior
              </button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-eco-mountain-meadow text-white'
                        : 'bg-white border border-eco-mountain-meadow/30 text-theme-primary hover:bg-eco-mountain-meadow/10'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-eco-mountain-meadow/30 rounded-lg hover:bg-eco-mountain-meadow/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Modal para Agregar Comentario */}
          {showCommentModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-theme-secondary dark:bg-theme-primary rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-eco-pear/20 dark:border-eco-pear/30">
                  <h3 className="text-xl font-bold text-theme-primary">Agregar Comentario</h3>
                  <button
                    onClick={() => setShowCommentModal(false)}
                    className="text-theme-secondary hover:text-theme-primary p-2 hover:bg-theme-tertiary dark:hover:bg-theme-secondary rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmitComment} className="p-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-theme-secondary mb-3">
                        Comentario
                      </label>
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Escribe tu comentario o actividad..."
                        className="w-full p-4 border border-eco-pear/30 dark:border-eco-pear/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow resize-none bg-theme-secondary dark:bg-theme-tertiary text-theme-primary"
                        rows="4"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-secondary mb-3">
                        Tipo de Actividad
                      </label>
                      <select
                        value={statsData.tipo_comentario}
                        onChange={(e) => setStatsData(prev => ({ ...prev, tipo_comentario: e.target.value }))}
                        className="w-full p-3 border border-eco-pear/30 dark:border-eco-pear/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-eco-mountain-meadow bg-theme-secondary dark:bg-theme-tertiary text-theme-primary"
                      >
                        <option value="general">📝 Comentario General</option>
                        <option value="riego">💧 Actividad de Riego</option>
                        <option value="siembra">🌱 Actividad de Siembra</option>
                        <option value="cosecha">✂️ Actividad de Cosecha</option>
                        <option value="abono">🍃 Actividad de Abono</option>
                        <option value="plagas">🐛 Control de Plagas</option>
                        <option value="mantenimiento">🔧 Actividad de Mantenimiento</option>
                      </select>
                    </div>

                    {statsData.tipo_comentario !== 'general' && (
                      <div className={`p-6 rounded-xl border ${
                        isDarkMode 
                          ? 'bg-gradient-to-r from-gray-700 to-gray-600 border-gray-600' 
                          : 'bg-gradient-to-r from-green-50 to-blue-50 border-green-100'
                      }`}>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-6 h-6 bg-[#2E8B57] rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">⚡</span>
                          </div>
                          <h4 className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            {statsData.tipo_comentario === 'riego' ? 'Datos de Riego' :
                             statsData.tipo_comentario === 'siembra' ? 'Datos de Siembra' :
                             statsData.tipo_comentario === 'cosecha' ? 'Datos de Cosecha' :
                             statsData.tipo_comentario === 'abono' ? 'Datos de Abono' :
                             statsData.tipo_comentario === 'plagas' ? 'Datos de Control de Plagas' :
                             'Datos de Mantenimiento'}
                          </h4>
                        </div>

                        {/* Campo de Agua - Solo para Riego */}
                        {statsData.tipo_comentario === 'riego' && (
                            <div className={`p-4 rounded-lg border ${
                              isDarkMode 
                                ? 'bg-gray-700 border-gray-600' 
                                : 'bg-white border-blue-200'
                            }`}>
                              <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${
                                isDarkMode ? 'text-blue-300' : 'text-blue-700'
                              }`}>
                              <span>💧</span>
                              Cantidad de Agua
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="md:col-span-2">
                                <input
                                  type="number"
                                  value={statsData.cantidad_agua}
                                  onChange={(e) => setStatsData(prev => ({ ...prev, cantidad_agua: e.target.value }))}
                                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                      isDarkMode 
                                        ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                                        : 'border-blue-300 bg-blue-50'
                                    }`}
                                  min="0"
                                  step="0.1"
                                  placeholder="Ej: 500"
                                />
                              </div>
                              <div>
                                <select
                                  value={statsData.unidad_agua}
                                  onChange={(e) => setStatsData(prev => ({ ...prev, unidad_agua: e.target.value }))}
                                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                      isDarkMode 
                                        ? 'bg-gray-600 border-gray-500 text-white' 
                                        : 'border-blue-300 bg-blue-50'
                                    }`}
                                >
                                  <option value="ml">mL (Mililitros)</option>
                                  <option value="l">L (Litros)</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Campo de Plantas Sembradas - Solo para Siembra */}
                        {statsData.tipo_comentario === 'siembra' && (
                          <div className="space-y-4">
                            {/* Nombre de la Siembra */}
                            <div className={`p-4 rounded-lg border ${
                              isDarkMode 
                                ? 'bg-gray-700 border-gray-600' 
                                : 'bg-white border-green-200'
                            }`}>
                              <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${
                                isDarkMode ? 'text-green-300' : 'text-green-700'
                              }`}>
                                <span>📝</span>
                                Nombre de la Siembra
                              </label>
                              <input
                                type="text"
                                value={statsData.nombre_siembra}
                                onChange={(e) => setStatsData(prev => ({ ...prev, nombre_siembra: e.target.value }))}
                                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                  isDarkMode 
                                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                                    : 'border-green-300 bg-green-50'
                                }`}
                                placeholder="Ej: Tomates Cherry, Lechugas Romana, etc."
                                maxLength="255"
                              />
                            </div>
                            
                            {/* Número de Plantas Sembradas */}
                            <div className={`p-4 rounded-lg border ${
                              isDarkMode 
                                ? 'bg-gray-700 border-gray-600' 
                                : 'bg-white border-green-200'
                            }`}>
                              <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${
                                isDarkMode ? 'text-green-300' : 'text-green-700'
                              }`}>
                                <span>🌱</span>
                                Número de Plantas Sembradas
                              </label>
                              <input
                                type="number"
                                value={statsData.cantidad_siembra}
                                onChange={(e) => setStatsData(prev => ({ ...prev, cantidad_siembra: e.target.value }))}
                                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                  isDarkMode 
                                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                                    : 'border-green-300 bg-green-50'
                                }`}
                                min="0"
                                placeholder="Ej: 12"
                              />
                            </div>
                          </div>
                        )}

                        {/* Campo de Cosecha - Solo para Cosecha */}
                        {statsData.tipo_comentario === 'cosecha' && (
                          <div className="space-y-4">
                            {/* Selector de Siembra Relacionada */}
                            <div className={`p-4 rounded-lg border ${
                              isDarkMode 
                                ? 'bg-gray-700 border-gray-600' 
                                : 'bg-white border-yellow-200'
                            }`}>
                              <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${
                                isDarkMode ? 'text-yellow-300' : 'text-yellow-700'
                              }`}>
                                <span>🌱</span>
                                Cosechado de:
                              </label>
                              <select
                                value={statsData.siembra_relacionada}
                                onChange={(e) => setStatsData(prev => ({ ...prev, siembra_relacionada: e.target.value }))}
                                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                                  isDarkMode 
                                    ? 'bg-gray-600 border-gray-500 text-white' 
                                    : 'border-yellow-300 bg-yellow-50'
                                }`}
                                required
                              >
                                <option value="">Selecciona la siembra...</option>
                                {getSiembrasDisponibles().map((siembra) => (
                                  <option key={siembra.id} value={siembra.id}>
                                    {siembra.label} - {siembra.cantidad} unidades
                                  </option>
                                ))}
                              </select>
                              {getSiembrasDisponibles().length === 0 && (
                                <p className="text-sm text-gray-500 mt-2">
                                  No hay siembras disponibles. Primero crea una siembra.
                                </p>
                              )}
                            </div>

                            {/* Cantidad Cosechada */}
                            <div className={`p-4 rounded-lg border ${
                              isDarkMode 
                                ? 'bg-gray-700 border-gray-600' 
                                : 'bg-white border-yellow-200'
                            }`}>
                              <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${
                                isDarkMode ? 'text-yellow-300' : 'text-yellow-700'
                              }`}>
                                <span>✂️</span>
                                Producción
                              </label>
                              <input
                                type="number"
                                value={statsData.cantidad_cosecha}
                                onChange={(e) => setStatsData(prev => ({ ...prev, cantidad_cosecha: e.target.value }))}
                                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                                  isDarkMode 
                                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                                    : 'border-yellow-300 bg-yellow-50'
                                }`}
                                min="0"
                                placeholder="Ej: 8"
                                required
                              />
                            </div>
                          </div>
                        )}

                        {/* Campo de Abono - Solo para Abono */}
                        {statsData.tipo_comentario === 'abono' && (
                          <div className="space-y-4">
                            {/* Cantidad de Abono */}
                            <div className={`p-4 rounded-lg border ${
                              isDarkMode 
                                ? 'bg-gray-700 border-gray-600' 
                                : 'bg-white border-orange-200'
                            }`}>
                              <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${
                                isDarkMode ? 'text-orange-300' : 'text-orange-700'
                              }`}>
                                <span>🍃</span>
                                Cantidad de Abono
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  value={statsData.cantidad_abono}
                                  onChange={(e) => setStatsData(prev => ({ ...prev, cantidad_abono: e.target.value }))}
                                  className={`flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                                    isDarkMode 
                                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                                      : 'border-orange-300 bg-orange-50'
                                  }`}
                                  min="0"
                                  step="0.1"
                                  placeholder="Ej: 2.5"
                                />
                                <select
                                  value={statsData.unidad_abono || 'kg'}
                                  onChange={(e) => setStatsData(prev => ({ ...prev, unidad_abono: e.target.value }))}
                                  className={`p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                                    isDarkMode 
                                      ? 'bg-gray-600 border-gray-500 text-white' 
                                      : 'border-orange-300 bg-orange-50'
                                  }`}
                                >
                                  <option value="kg">Kg</option>
                                  <option value="g">G</option>
                                </select>
                              </div>
                            </div>
                            
                            {/* Pregunta sobre cambio de tierra */}
                            <div className={`p-4 rounded-lg border ${
                              isDarkMode 
                                ? 'bg-gray-700 border-gray-600' 
                                : 'bg-white border-orange-200'
                            }`}>
                              <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${
                                isDarkMode ? 'text-orange-300' : 'text-orange-700'
                              }`}>
                                <span>🌱</span>
                                ¿Se cambió la tierra?
                              </label>
                              <select
                                value={statsData.cambio_tierra}
                                onChange={(e) => setStatsData(prev => ({ ...prev, cambio_tierra: e.target.value }))}
                                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                                  isDarkMode 
                                    ? 'bg-gray-600 border-gray-500 text-white' 
                                    : 'border-orange-300 bg-orange-50'
                                }`}
                              >
                                <option value="">Selecciona una opción...</option>
                                <option value="si">Sí</option>
                                <option value="por_encima">Por encima</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {/* Campo de Plagas - Solo para Control de Plagas */}
                        {statsData.tipo_comentario === 'plagas' && (
                          <div className={`p-4 rounded-lg border space-y-3 ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600' 
                              : 'bg-white border-red-200'
                          }`}>
                            <div>
                              <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${
                                isDarkMode ? 'text-red-300' : 'text-red-700'
                              }`}>
                                <span>🐛</span>
                                Especie de Plaga
                              </label>
                              <input
                                type="text"
                                value={statsData.plaga_especie || ''}
                                onChange={(e) => setStatsData(prev => ({ ...prev, plaga_especie: e.target.value }))}
                                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                                  isDarkMode 
                                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                                    : 'border-red-300 bg-red-50'
                                }`}
                                placeholder="Ej: pulgón, mosca blanca"
                              />
                            </div>
                            <div>
                              <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${
                                isDarkMode ? 'text-red-300' : 'text-red-700'
                              }`}>
                                <span>📊</span>
                                Nivel de Infestación
                              </label>
                              <select
                                value={statsData.plaga_nivel || 'pocos'}
                                onChange={(e) => setStatsData(prev => ({ ...prev, plaga_nivel: e.target.value }))}
                                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                                  isDarkMode 
                                    ? 'bg-gray-600 border-gray-500 text-white' 
                                    : 'border-red-300 bg-red-50'
                                }`}
                              >
                                <option value="pocos">Pocos</option>
                                <option value="medio">Medio</option>
                                <option value="muchos">Muchos</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {/* Campo de Mantenimiento - Solo para Mantenimiento */}
                        {statsData.tipo_comentario === 'mantenimiento' && (
                          <div className={`p-4 rounded-lg border ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600' 
                              : 'bg-white border-purple-200'
                          }`}>
                            <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${
                              isDarkMode ? 'text-purple-300' : 'text-purple-700'
                            }`}>
                              <span>🔧</span>
                              Tiempo de Mantenimiento
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                value={statsData.cantidad_mantenimiento || ''}
                                onChange={(e) => setStatsData(prev => ({ ...prev, cantidad_mantenimiento: e.target.value }))}
                                className={`flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                  isDarkMode 
                                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                                    : 'border-purple-300 bg-purple-50'
                                }`}
                                min="0"
                                step="0.5"
                                placeholder="Ej: 30"
                              />
                              <select
                                value={statsData.unidad_mantenimiento || 'minutos'}
                                onChange={(e) => setStatsData(prev => ({ ...prev, unidad_mantenimiento: e.target.value }))}
                                className={`p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                  isDarkMode 
                                    ? 'bg-gray-600 border-gray-500 text-white' 
                                    : 'border-purple-300 bg-purple-50'
                                }`}
                              >
                                <option value="minutos">Minutos</option>
                                <option value="horas">Horas</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {/* Campo "Huerto de:" - Para todos excepto general, cosecha y siembra */}
                        {statsData.tipo_comentario !== 'general' && statsData.tipo_comentario !== 'cosecha' && statsData.tipo_comentario !== 'siembra' && (
                          <div className={`p-4 rounded-lg border ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600' 
                              : 'bg-white border-gray-200'
                          }`}>
                            <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              <span>🌱</span>
                              Huerto de:
                            </label>
                            <select
                              value={statsData.huerto_siembra_id}
                              onChange={(e) => setStatsData(prev => ({ ...prev, huerto_siembra_id: e.target.value }))}
                              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E8B57] ${
                                isDarkMode 
                                  ? 'bg-gray-600 border-gray-500 text-white' 
                                  : 'border-gray-300 bg-gray-50'
                              }`}
                            >
                              <option value="">Selecciona la siembra...</option>
                              {getSiembrasDisponibles().map((siembra) => (
                                <option key={siembra.id} value={siembra.id}>
                                  {siembra.label} - {siembra.cantidad} unidades
                                </option>
                              ))}
                            </select>
                            {getSiembrasDisponibles().length === 0 && (
                              <p className="text-sm text-gray-500 mt-2">
                                No hay siembras disponibles. Primero crea una siembra.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-end gap-4 pt-6 border-t border-eco-pear/20 dark:border-eco-pear/30">
                      <button
                        type="button"
                        onClick={() => setShowCommentModal(false)}
                        className="px-6 py-3 border border-eco-pear/30 dark:border-eco-pear/50 text-theme-primary rounded-xl hover:bg-theme-tertiary dark:hover:bg-theme-secondary transition-colors font-medium"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald text-white rounded-xl hover:from-eco-mountain-meadow-dark hover:to-eco-emerald-dark transition-all duration-300 font-medium flex items-center gap-2 shadow-lg hover:shadow-xl"
                      >
                        <Plus size={18} />
                        Publicar
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal para Cambiar Imagen del Huerto */}
          {showImageModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900">Cambiar Imagen del Huerto</h3>
                  <button
                    onClick={() => setShowImageModal(false)}
                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL de la Imagen
                      </label>
                      <input
                        type="url"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="https://ejemplo.com/imagen.jpg"
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E8B57] focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Vista previa de la imagen */}
                    {newImageUrl && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Vista Previa
                        </label>
                        <div className="w-full h-32 rounded-lg overflow-hidden border border-gray-200">
                          <img 
                            src={newImageUrl} 
                            alt="Vista previa"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop&crop=center';
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowImageModal(false)}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleUpdateImage}
                        disabled={!newImageUrl.trim() || isUpdatingImage}
                        className="px-6 py-3 bg-[#2E8B57] text-white rounded-xl hover:bg-[#1f6b3f] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isUpdatingImage ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Actualizando...
                          </>
                        ) : (
                          <>
                            <span>📷</span>
                            Actualizar Imagen
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal de Vista Detallada del Comentario */}
          {showCommentDetailModal && selectedComment && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
                <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedComment.tipo_comentario === 'general' ? 'Comentario General' : 
                     selectedComment.tipo_comentario === 'riego' ? 'Actividad de Riego' :
                     selectedComment.tipo_comentario === 'siembra' ? 'Actividad de Siembra' :
                     selectedComment.tipo_comentario === 'cosecha' ? 'Actividad de Cosecha' :
                     selectedComment.tipo_comentario === 'abono' ? 'Actividad de Abono' :
                     selectedComment.tipo_comentario === 'plagas' ? 'Control de Plagas' :
                     selectedComment.tipo_comentario === 'mantenimiento' ? 'Mantenimiento' : 'Comentario'}
                  </h3>
                  <button
                    onClick={handleCloseCommentDetail}
                    className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300 p-2 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100'} rounded-lg transition-colors`}
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Información del comentario */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${
                            selectedComment.tipo_comentario === 'riego' ? 'bg-blue-500' :
                            selectedComment.tipo_comentario === 'siembra' ? 'bg-green-500' :
                            selectedComment.tipo_comentario === 'cosecha' ? 'bg-yellow-500' :
                            selectedComment.tipo_comentario === 'abono' ? 'bg-orange-500' :
                            selectedComment.tipo_comentario === 'plagas' ? 'bg-red-500' :
                            selectedComment.tipo_comentario === 'mantenimiento' ? 'bg-purple-500' :
                            'bg-[#2E8B57]'
                          }`}>
                            {selectedComment.tipo_comentario.charAt(0).toUpperCase() + selectedComment.tipo_comentario.slice(1)}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(selectedComment.fecha_creacion).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                          <User size={16} />
                          <span>Por: {selectedComment.usuario_nombre || 'Usuario'}</span>
                          {/* Etiqueta de rol cuando el usuario no es el dueño del huerto */}
                          {selectedComment.usuario_rol && !isGardenOwner(selectedComment) && (
                            <span className={`px-2 py-1 text-xs rounded-lg font-medium border ${getRoleTagStyle(selectedComment.usuario_rol)}`}>
                              {getRoleText(selectedComment.usuario_rol)}
                            </span>
                          )}
                        </div>

                        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                          <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Descripción:</h4>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {selectedComment.contenido}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Datos específicos del comentario */}
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Datos de la Actividad:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedComment.tipo_comentario === 'riego' && (
                          <div className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Droplets size={20} className="text-blue-600" />
                              <span className="font-medium text-blue-800 dark:text-blue-200">Cantidad de Agua</span>
                            </div>
                            <p className="text-blue-700 dark:text-blue-300 text-lg font-semibold">
                              {selectedComment.cantidad_agua ? 
                                `${selectedComment.cantidad_agua} ${selectedComment.unidad_agua || 'ml'}` : 
                                'No especificada'
                              }
                            </p>
                          </div>
                        )}

                        {selectedComment.tipo_comentario === 'siembra' && (
                          <div className="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Sprout size={20} className="text-green-600" />
                              <span className="font-medium text-green-800 dark:text-green-200">Cantidad Sembrada</span>
                            </div>
                            <p className="text-green-700 text-lg font-semibold">
                              {selectedComment.cantidad_siembra ? 
                                `${parseInt(selectedComment.cantidad_siembra)} unidades` : 
                                'No especificada'
                              }
                            </p>
                          </div>
                        )}

                        {selectedComment.tipo_comentario === 'cosecha' && (
                          <div className="bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Scissors size={20} className="text-yellow-600" />
                              <span className="font-medium text-yellow-800 dark:text-yellow-200">Cantidad Cosechada</span>
                            </div>
                            <p className="text-yellow-700 text-lg font-semibold">
                              {selectedComment.cantidad_cosecha ? 
                                `${parseInt(selectedComment.cantidad_cosecha)} unidades` : 
                                'No especificada'
                              }
                            </p>
                          </div>
                        )}

                        {selectedComment.tipo_comentario === 'abono' && (
                          <div className="bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Leaf size={20} className="text-orange-600" />
                              <span className="font-medium text-orange-800 dark:text-orange-200">Cantidad de Abono</span>
                            </div>
                            <p className="text-orange-700 text-lg font-semibold">
                              {selectedComment.cantidad_abono ? 
                                `${parseFloat(selectedComment.cantidad_abono)} kg` : 
                                'No especificada'
                              }
                            </p>
                          </div>
                        )}

                        {selectedComment.tipo_comentario === 'plagas' && (
                          <div className="bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Bug size={20} className="text-red-600" />
                              <span className="font-medium text-red-800 dark:text-red-200">Información de Plagas</span>
                            </div>
                            <div className="space-y-2">
                              <p className="text-red-700">
                                <span className="font-medium">Especie:</span> {selectedComment.plaga_especie || 'No especificada'}
                              </p>
                              <p className="text-red-700">
                                <span className="font-medium">Nivel:</span> {selectedComment.plaga_nivel_texto || selectedComment.plaga_nivel || 'No especificado'}
                              </p>
                            </div>
                          </div>
                        )}

                        {selectedComment.tipo_comentario === 'mantenimiento' && (
                          <div className="bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Wrench size={20} className="text-purple-600" />
                              <span className="font-medium text-purple-800 dark:text-purple-200">Mantenimiento</span>
                            </div>
                            <p className="text-purple-700">
                              {selectedComment.cantidad_mantenimiento && selectedComment.unidad_mantenimiento 
                                ? `${selectedComment.cantidad_mantenimiento} ${selectedComment.unidad_mantenimiento}`
                                : 'Actividad de mantenimiento registrada'
                              }
                            </p>
                          </div>
                        )}

                        {selectedComment.tipo_comentario === 'general' && (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageCircle size={20} className="text-gray-600" />
                              <span className="font-medium text-gray-800">Comentario General</span>
                            </div>
                            <p className="text-gray-700">
                              Comentario sin datos estadísticos específicos
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Información de Huerto de: */}
                      {selectedComment.huerto_siembra_id && (
                        <div className="mt-4">
                          <h4 className="font-semibold text-gray-800 mb-3">Información del Huerto:</h4>
                          <div className="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Sprout size={20} className="text-green-600" />
                              <span className="font-medium text-green-800 dark:text-green-200">Huerto de:</span>
                            </div>
                            <p className="text-green-700 text-lg font-semibold">
                              {getSiembraNameById(selectedComment.huerto_siembra_id)}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Información de cambio de tierra para abono */}
                      {selectedComment.tipo_comentario === 'abono' && selectedComment.cambio_tierra && (
                        <div className="mt-4">
                          <h4 className="font-semibold text-gray-800 mb-3">Información de Tierra:</h4>
                          <div className="bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Leaf size={20} className="text-orange-600" />
                              <span className="font-medium text-orange-800 dark:text-orange-200">Estado de la Tierra:</span>
                            </div>
                            <p className="text-orange-700 text-lg font-semibold">
                              {selectedComment.cambio_tierra === 'si' ? 'Cambiada completamente' : 'Agregada por encima'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className={`flex justify-end gap-4 pt-4 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <button
                      onClick={handleCloseCommentDetail}
                      className={`px-6 py-3 border rounded-xl transition-colors font-medium ${
                        isDarkMode 
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Cerrar
                    </button>
                    {canEditComment(selectedComment) && (
                      <button
                        onClick={() => handleOpenEditModal(selectedComment)}
                        className="px-6 py-3 bg-[#2E8B57] text-white rounded-xl hover:bg-[#1f6b3f] transition-colors font-medium flex items-center gap-2"
                      >
                        <MessageCircle size={18} />
                        Editar
                      </button>
                    )}
                    {canDeleteComment(selectedComment) && (
                      <button
                        onClick={() => {
                          setCommentToDelete(selectedComment);
                          setShowDeleteDialog(true);
                          setShowCommentDetailModal(false);
                        }}
                        className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium flex items-center gap-2"
                      >
                        <X size={18} />
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>


      <Footer />

      {/* Diálogo de confirmación para eliminar comentario */}
      <ConfirmDialog
        isVisible={showDeleteDialog}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Eliminar Comentario"
        message="¿Estás seguro de que quieres eliminar este comentario? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="delete"
        itemName={commentToDelete ? `Comentario de ${commentToDelete.usuario_nombre}` : ""}
        isLoading={isDeleting}
      />

      {/* Modal de Edición Completa */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Editar Comentario</h2>
                <button
                  onClick={handleCloseEditModal}
                  className={`p-2 rounded-full transition-colors ${
                    isDarkMode 
                      ? 'hover:bg-gray-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <X size={24} className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitEdit} className="p-6">
              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Comentario
                  </label>
                  <textarea
                    value={editData.contenido}
                    onChange={(e) => setEditData(prev => ({ ...prev, contenido: e.target.value }))}
                    placeholder="Escribe tu comentario o actividad..."
                    className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E8B57] resize-none ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                    }`}
                    rows="4"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tipo de Actividad
                  </label>
                  <select
                    value={editData.tipo_comentario}
                    onChange={(e) => setEditData(prev => ({ ...prev, tipo_comentario: e.target.value }))}
                    className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E8B57] ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="general">📝 Comentario General</option>
                    <option value="riego">💧 Actividad de Riego</option>
                    <option value="siembra">🌱 Actividad de Siembra</option>
                    <option value="cosecha">✂️ Actividad de Cosecha</option>
                    <option value="abono">🍃 Actividad de Abono</option>
                    <option value="plagas">🐛 Control de Plagas</option>
                    <option value="mantenimiento">🔧 Actividad de Mantenimiento</option>
                  </select>
                </div>

                {/* Campos específicos por tipo */}
                {editData.tipo_comentario === 'riego' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                        <span>💧</span>
                        Cantidad de Agua
                      </label>
                      <input
                        type="number"
                        value={editData.cantidad_agua}
                        onChange={(e) => setEditData(prev => ({ ...prev, cantidad_agua: e.target.value }))}
                        placeholder="Ej: 500"
                        className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                        Unidad
                      </label>
                      <select
                        value={editData.unidad_agua}
                        onChange={(e) => setEditData(prev => ({ ...prev, unidad_agua: e.target.value }))}
                        className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
                      >
                        <option value="ml">mL (Mililitros)</option>
                        <option value="l">L (Litros)</option>
                      </select>
                    </div>
                  </div>
                )}

                {editData.tipo_comentario === 'siembra' && (
                  <div className="space-y-4">
                    {/* Nombre de la Siembra */}
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-2 flex items-center gap-2">
                        <span>📝</span>
                        Nombre de la Siembra
                      </label>
                      <input
                        type="text"
                        value={editData.nombre_siembra}
                        onChange={(e) => setEditData(prev => ({ ...prev, nombre_siembra: e.target.value }))}
                        placeholder="Ej: Tomates Cherry, Lechugas Romana, etc."
                        className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-50"
                        maxLength="255"
                      />
                    </div>
                    
                    {/* Cantidad de Semillas */}
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-2 flex items-center gap-2">
                        <span>🌱</span>
                        Cantidad de Semillas
                      </label>
                      <input
                        type="number"
                        value={editData.cantidad_siembra}
                        onChange={(e) => setEditData(prev => ({ ...prev, cantidad_siembra: e.target.value }))}
                        placeholder="Ej: 10"
                        className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-50"
                        min="0"
                      />
                    </div>
                  </div>
                )}

                {editData.tipo_comentario === 'cosecha' && (
                  <div className="space-y-4">
                    {/* Selector de Siembra Relacionada */}
                    <div>
                      <label className="block text-sm font-medium text-orange-700 mb-2 flex items-center gap-2">
                        <span>🌱</span>
                        Cosechado de:
                      </label>
                      <select
                        value={editData.siembra_relacionada}
                        onChange={(e) => setEditData(prev => ({ ...prev, siembra_relacionada: e.target.value }))}
                        className="w-full p-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-orange-50"
                        required
                      >
                        <option value="">Selecciona la siembra...</option>
                        {getSiembrasDisponibles().map((siembra) => (
                          <option key={siembra.id} value={siembra.id}>
                            {siembra.label} - {siembra.cantidad} unidades
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Cantidad Cosechada */}
                    <div>
                      <label className="block text-sm font-medium text-orange-700 mb-2 flex items-center gap-2">
                        <span>✂️</span>
                        Producción
                      </label>
                      <input
                        type="number"
                        value={editData.cantidad_cosecha}
                        onChange={(e) => setEditData(prev => ({ ...prev, cantidad_cosecha: e.target.value }))}
                        placeholder="Ej: 5"
                        className="w-full p-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-orange-50"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                )}

                {editData.tipo_comentario === 'abono' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-yellow-700 mb-2 flex items-center gap-2">
                        <span>🍃</span>
                        Cantidad de Abono
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={editData.cantidad_abono}
                          onChange={(e) => setEditData(prev => ({ ...prev, cantidad_abono: e.target.value }))}
                          placeholder="Ej: 2.5"
                          className="flex-1 p-3 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-yellow-50"
                          min="0"
                          step="0.1"
                        />
                        <select
                          value={editData.unidad_abono || 'kg'}
                          onChange={(e) => setEditData(prev => ({ ...prev, unidad_abono: e.target.value }))}
                          className="p-3 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-yellow-50"
                        >
                          <option value="kg">Kg</option>
                          <option value="g">G</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-yellow-700 mb-2 flex items-center gap-2">
                        <span>🌱</span>
                        ¿Se cambió la tierra?
                      </label>
                      <select
                        value={editData.cambio_tierra}
                        onChange={(e) => setEditData(prev => ({ ...prev, cambio_tierra: e.target.value }))}
                        className="w-full p-3 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-yellow-50"
                      >
                        <option value="">Selecciona una opción...</option>
                        <option value="si">Sí</option>
                        <option value="por_encima">Por encima</option>
                      </select>
                    </div>
                  </div>
                )}

                {editData.tipo_comentario === 'plagas' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-red-700 mb-2 flex items-center gap-2">
                        <span>🐛</span>
                        Tipo de Plaga
                      </label>
                      <input
                        type="text"
                        value={editData.plaga_especie}
                        onChange={(e) => setEditData(prev => ({ ...prev, plaga_especie: e.target.value }))}
                        placeholder="Ej: hormigas, gusanos, pulgones"
                        className="w-full p-3 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-red-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-red-700 mb-2 flex items-center gap-2">
                        <span>📊</span>
                        Nivel de Infestación
                      </label>
                      <select
                        value={editData.plaga_nivel || 'pocos'}
                        onChange={(e) => setEditData(prev => ({ ...prev, plaga_nivel: e.target.value }))}
                        className="w-full p-3 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-red-50"
                      >
                        <option value="pocos">Pocos</option>
                        <option value="medio">Medio</option>
                        <option value="muchos">Muchos</option>
                      </select>
                    </div>
                  </div>
                )}

                {editData.tipo_comentario === 'mantenimiento' && (
                  <div>
                    <label className="block text-sm font-medium text-purple-700 mb-2 flex items-center gap-2">
                      <span>🔧</span>
                      Tiempo de Mantenimiento
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={editData.cantidad_mantenimiento}
                        onChange={(e) => setEditData(prev => ({ ...prev, cantidad_mantenimiento: e.target.value }))}
                        placeholder="Ej: 30"
                        className="flex-1 p-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-purple-50"
                        min="0"
                        step="0.5"
                      />
                      <select
                        value={editData.unidad_mantenimiento || 'minutos'}
                        onChange={(e) => setEditData(prev => ({ ...prev, unidad_mantenimiento: e.target.value }))}
                        className="p-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-purple-50"
                      >
                        <option value="minutos">Minutos</option>
                        <option value="horas">Horas</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Campo "Huerto de:" - Para todos excepto general, cosecha y siembra */}
                {editData.tipo_comentario !== 'general' && editData.tipo_comentario !== 'cosecha' && editData.tipo_comentario !== 'siembra' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <span>🌱</span>
                      Huerto de:
                    </label>
                    <select
                      value={editData.huerto_siembra_id}
                      onChange={(e) => setEditData(prev => ({ ...prev, huerto_siembra_id: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E8B57] bg-gray-50"
                    >
                      <option value="">Selecciona la siembra...</option>
                      {getSiembrasDisponibles().map((siembra) => (
                        <option key={siembra.id} value={siembra.id}>
                          {siembra.label} - {siembra.cantidad} unidades
                        </option>
                      ))}
                    </select>
                    {getSiembrasDisponibles().length === 0 && (
                      <p className="text-sm text-gray-500 mt-2">
                        No hay siembras disponibles. Primero crea una siembra.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className={`flex justify-end gap-4 pt-6 border-t mt-6 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className={`px-6 py-3 border rounded-xl transition-colors font-medium ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#2E8B57] text-white rounded-xl hover:bg-[#1f6b3f] transition-colors font-medium"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Modal de confirmación de eliminación de jardín */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-md w-full p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <Trash2 size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                Eliminar Jardín
              </h3>
            </div>
            
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
              ¿Estás seguro de que quieres eliminar el jardín <strong>"{garden?.nombre}"</strong>?
              <br />
              <span className="text-red-600 dark:text-red-400 font-medium">Esta acción no se puede deshacer.</span>
              <br />
              <span className="text-orange-600 dark:text-orange-400 font-medium">Se eliminarán todos los comentarios y datos asociados.</span>
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelDeleteGarden}
                disabled={deleting}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } disabled:opacity-50`}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDeleteGarden}
                disabled={deleting}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Eliminando...
                  </>
                ) : (
                  'Eliminar Jardín'
                )}
              </button>
            </div>
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
