import L from "leaflet";

// Configuración global de Leaflet
export const configureLeaflet = () => {
  // Arreglar íconos de Leaflet
  delete L.Icon.Default.prototype._getIconUrl;
  
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });

  // Configuración adicional para mejorar el rendimiento
  L.TileLayer.prototype.options.updateWhenIdle = true;
  L.TileLayer.prototype.options.updateWhenZooming = false;
  
  // Configuración para el control de zoom
  L.Control.Zoom.prototype.options.position = 'topright';
  
  // Configuración para mejorar la visualización del mapa
  L.Map.prototype.options.zoomControl = false;
  L.Map.prototype.options.attributionControl = true;
  
  // Configuración de tiles para mejor rendimiento
  L.TileLayer.prototype.options.maxZoom = 19;
  L.TileLayer.prototype.options.subdomains = ['a', 'b', 'c'];
  
  console.log("Leaflet configurado correctamente");
};

// Función para crear controles de zoom personalizados
export const createZoomControl = (options = {}) => {
  const defaultOptions = {
    position: 'topright',
    zoomInTitle: 'Acercar',
    zoomOutTitle: 'Alejar',
    ...options
  };
  
  return L.control.zoom(defaultOptions);
};

// Función para remover controles de manera segura
export const removeControlSafely = (map, control) => {
  if (!map || !control) return;
  
  try {
    if (typeof map.removeControl === 'function') {
      map.removeControl(control);
    } else if (typeof control.remove === 'function') {
      control.remove();
    }
  } catch (error) {
    console.log("Error al remover control:", error);
  }
};

export default configureLeaflet;
