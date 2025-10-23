import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./MapaStyles.css";
import { configureLeaflet } from "./LeafletConfig";
import AgregarZoomControl from "./AgregarZoomControl";

// Configurar Leaflet al importar
configureLeaflet();

// Coordenadas por defecto (Caracas, Venezuela)
const DEFAULT_LOCATION = [10.5, -66.9];

// Componente para manejar eventos del mapa
const ManejadorMapa = ({ onClick }) => {
  useMapEvents({
    click(e) {
      onClick(e);
    },
  });
  return null;
};

// Componente para centrar el mapa cuando esté listo
const CentrarMapa = ({ marcador }) => {
  const map = useMap();
  
  useEffect(() => {
    if (map && marcador) {
      map.setView(marcador, 16);
    }
  }, [map, marcador]);
  
  return null;
};

// Componente para inicializar el mapa
const InicializadorMapa = ({ onMapReady }) => {
  const map = useMap();
  
  useEffect(() => {
    if (map) {
      onMapReady(map);
    }
  }, [map, onMapReady]);
  
  return null;
};

const MapaSelector = ({
  onUbicacionSeleccionada,
  mostrarControles,
  initialLocation,
}) => {
  const [posicionInicial, setPosicionInicial] = useState(DEFAULT_LOCATION);
  const [marcador, setMarcador] = useState(null);
  const [loadingGeo, setLoadingGeo] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [geolocationStatus, setGeolocationStatus] = useState('pending'); // 'pending', 'success', 'denied', 'error'
  const mapRef = useRef();
  const [error, setError] = useState(null);

  // Función para normalizar coordenadas a una precisión específica
  const normalizarCoordenadas = useCallback((lat, lng, precision = 2) => {
    const factor = Math.pow(10, precision);
    return [
      Math.round(lat * factor) / factor,
      Math.round(lng * factor) / factor
    ];
  }, []);

  // Función para obtener la ubicación del usuario
  const obtenerUbicacionUsuario = useCallback(async () => {
    if (!navigator.geolocation) {
      console.log("Geolocalización no soportada");
      setGeolocationStatus('error');
      setLoadingGeo(false);
      return;
    }

    try {
      setLoadingGeo(true);
      setError(null);
      
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 30000,
        });
      });

      const { latitude, longitude } = position.coords;
      console.log("Ubicación obtenida:", latitude, longitude);

      // Redondear coordenadas a 2 decimales para la base de datos
      const latRounded = Math.round(latitude * 100) / 100;
      const lngRounded = Math.round(longitude * 100) / 100;

      // Usar coordenadas redondeadas
      setPosicionInicial([latRounded, lngRounded]);
      setMarcador([latRounded, lngRounded]);
      setGeolocationStatus('success');

      // Mover el mapa a la nueva posición
      if (mapRef.current && mapReady) {
        mapRef.current.flyTo([latRounded, lngRounded], 16);
      }

      // Obtener dirección con coordenadas redondeadas
      await obtenerDireccion(latRounded, lngRounded);
      
    } catch (err) {
      console.log("Error de geolocalización:", err);
      
      if (err.code === 1) {
        // Usuario denegó permisos
        setGeolocationStatus('denied');
        setError("Permisos de ubicación denegados. Puedes hacer clic en el mapa para seleccionar manualmente.");
      } else if (err.code === 2) {
        // Posición no disponible
        setGeolocationStatus('error');
        setError("No se pudo obtener tu ubicación. Puedes hacer clic en el mapa para seleccionar manualmente.");
      } else if (err.code === 3) {
        // Timeout
        setGeolocationStatus('error');
        setError("Tiempo de espera agotado. Puedes hacer clic en el mapa para seleccionar manualmente.");
      } else {
        // Otro error
        setGeolocationStatus('error');
        setError("Error al obtener ubicación. Puedes hacer clic en el mapa para seleccionar manualmente.");
      }
      
      // Usar ubicación inicial si está disponible
      if (initialLocation?.latitud && initialLocation?.longitud) {
        // Usar coordenadas de la ubicación inicial
        const lat = parseFloat(initialLocation.latitud);
        const lng = parseFloat(initialLocation.longitud);
        setPosicionInicial([lat, lng]);
        setMarcador([lat, lng]);
      }
    } finally {
      setLoadingGeo(false);
    }
  }, [mapReady, initialLocation]);

  // Función para obtener dirección desde coordenadas
  const obtenerDireccion = useCallback(async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Error en la respuesta de Nominatim');
      }

      const data = await response.json();
      const address = data.address || {};

      const formData = {
        calle: address.road || address.street || "",
        ciudad:
          address.city ||
          address.town ||
          address.village ||
          address.municipality ||
          address.suburb ||
          address.hamlet ||
          address.locality ||
          address.county ||
          "",
        estado: address.state || address.province || "",
        pais: address.country || "",
        latitud: lat, // Ya viene redondeada
        longitud: lng, // Ya viene redondeada
      };

      if (onUbicacionSeleccionada) {
        onUbicacionSeleccionada(formData);
      }
    } catch (error) {
      console.error("Error al obtener la dirección:", error);
    }
  }, [onUbicacionSeleccionada]);

  // Función para manejar clics en el mapa
  const handleMapClick = useCallback(async (e) => {
    const { lat, lng } = e.latlng;
    
    try {
      // Redondear coordenadas a 2 decimales
      const latRounded = Math.round(lat * 100) / 100;
      const lngRounded = Math.round(lng * 100) / 100;
      
      // Usar coordenadas redondeadas para la búsqueda de dirección
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latRounded}&lon=${lngRounded}&zoom=18&addressdetails=1&extratags=1`
      );
      
      if (!response.ok) {
        throw new Error('Error en la respuesta de Nominatim');
      }

      const data = await response.json();
      const address = data.address || {};

      // Usar coordenadas redondeadas para la base de datos
      let finalLat = latRounded;
      let finalLng = lngRounded;

      // Si hay un edificio específico, usar sus coordenadas pero redondeadas
      if (data.osm_type && data.osm_id) {
        try {
          const placeResponse = await fetch(
            `https://nominatim.openstreetmap.org/lookup?osm_ids=${data.osm_type[0].toUpperCase()}${data.osm_id}&format=jsonv2`
          );
          
          if (placeResponse.ok) {
            const places = await placeResponse.json();
            if (places.length > 0) {
              // Usar coordenadas del edificio pero redondeadas
              finalLat = Math.round(parseFloat(places[0].lat) * 100) / 100;
              finalLng = Math.round(parseFloat(places[0].lon) * 100) / 100;
            }
          }
        } catch (buildingError) {
          console.log("No se pudo obtener coordenadas específicas del edificio, usando coordenadas del clic");
        }
      }

      // Actualizar marcador con coordenadas redondeadas
      setMarcador([finalLat, finalLng]);

      // Obtener dirección final con coordenadas redondeadas
      await obtenerDireccion(finalLat, finalLng);

    } catch (error) {
      console.error("Error al procesar el clic del mapa:", error);
      setError("Error al obtener la dirección. Intenta de nuevo.");
    }
  }, [obtenerDireccion]);

  // Función para manejar cuando el mapa esté listo
  const handleMapReady = useCallback((map) => {
    mapRef.current = map;
    setMapReady(true);
  }, []);

  // Efecto para inicializar la geolocalización
  useEffect(() => {
    if (mapReady) {
      // Si hay una ubicación inicial, usarla primero
      if (initialLocation?.latitud && initialLocation?.longitud) {
        const lat = parseFloat(initialLocation.latitud);
        const lng = parseFloat(initialLocation.longitud);
        setPosicionInicial([lat, lng]);
        setMarcador([lat, lng]);
        setGeolocationStatus('success');
        setLoadingGeo(false);
        
        // Obtener dirección de la ubicación inicial
        obtenerDireccion(lat, lng);
      } else {
        // Si no hay ubicación inicial, obtener la ubicación del usuario
        obtenerUbicacionUsuario();
      }
    }
  }, [mapReady, obtenerUbicacionUsuario, initialLocation, obtenerDireccion]);

  // Efecto para limpiar errores
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Función para solicitar permisos de ubicación
  const solicitarPermisosUbicacion = useCallback(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          obtenerUbicacionUsuario();
        } else if (result.state === 'prompt') {
          obtenerUbicacionUsuario();
        } else {
          setError("Permisos de ubicación denegados. Haz clic en el mapa para seleccionar manualmente.");
        }
      });
    } else {
      obtenerUbicacionUsuario();
    }
  }, [obtenerUbicacionUsuario]);

  return (
    <div className="relative h-full w-full">
      {/* Overlay de carga */}
      {loadingGeo && (
        <div className="absolute inset-0 map-loading-overlay flex items-center justify-center z-20 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eco-mountain-meadow mx-auto mb-3"></div>
            <p className="text-gray-700 font-medium">Obteniendo tu ubicación...</p>
            <p className="text-gray-500 text-sm mt-1">Por favor espera</p>
          </div>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="absolute top-2 left-2 right-2 z-20 map-error-message animate-fade-in">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm">{error}</p>
              {geolocationStatus === 'denied' && (
                <p className="text-xs mt-1 opacity-75">
                  💡 Puedes hacer clic en el mapa para seleccionar tu ubicación manualmente
                </p>
              )}
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-400 hover:text-red-600 text-lg font-bold"
              title="Cerrar mensaje"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Botón para obtener ubicación manualmente */}
      {!loadingGeo && (
        <button
          onClick={solicitarPermisosUbicacion}
          className="absolute top-2 right-2 z-20 map-control-button"
          title="Obtener mi ubicación"
        >
          📍 Mi ubicación
        </button>
      )}

      {/* Indicador de estado de geolocalización */}
      {!loadingGeo && geolocationStatus === 'denied' && (
        <div className="absolute top-2 left-2 z-20 bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-2 rounded-lg text-xs shadow-lg">
          <div className="flex items-center space-x-1">
            <span>⚠️</span>
            <span>Ubicación manual</span>
          </div>
        </div>
      )}

      {/* Contenedor del mapa */}
      <MapContainer
        center={posicionInicial}
        zoom={16}
        style={{ height: "100%", width: "100%", borderRadius: "8px" }}
        zoomControl={false}
        className="z-10"
        attributionControl={true}
        preferCanvas={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          subdomains={['a', 'b', 'c']}
          updateWhenIdle={true}
          updateWhenZooming={false}
        />
        
        <InicializadorMapa onMapReady={handleMapReady} />
        <ManejadorMapa onClick={handleMapClick} />
        <CentrarMapa marcador={marcador} />
        <AgregarZoomControl enabled={mostrarControles} />
        
        {marcador && (
          <Marker 
            position={marcador}
            eventHandlers={{
              click: () => {
                // Mostrar información del marcador
                console.log("Marcador seleccionado:", marcador);
              }
            }}
          />
        )}
      </MapContainer>

      {/* Información de coordenadas */}
      {marcador && (
        <div className="absolute bottom-2 left-2 z-20 coordinates-info text-xs text-gray-700 shadow-lg">
          <div className="font-medium">Ubicación seleccionada:</div>
          <div>Lat: {marcador[0].toFixed(2)}</div>
          <div>Lng: {marcador[1].toFixed(2)}</div>
          {geolocationStatus === 'denied' && (
            <div className="text-yellow-600 mt-1">📍 Selección manual</div>
          )}
        </div>
      )}

      {/* Instrucciones cuando se deniegan permisos */}
      {!loadingGeo && geolocationStatus === 'denied' && !marcador && (
        <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-20 rounded-lg">
          <div className="text-center p-6">
            <div className="text-4xl mb-4">📍</div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Selecciona tu ubicación
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Haz clic en cualquier punto del mapa para seleccionar la ubicación de tu huerto
            </p>
            <button
              onClick={solicitarPermisosUbicacion}
              className="bg-eco-mountain-meadow hover:bg-eco-mountain-meadow-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Intentar obtener mi ubicación
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapaSelector;
