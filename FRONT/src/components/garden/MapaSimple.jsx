import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MapaSimple = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Mapa Simple - Prueba Básica</h2>
      <div className="h-64 w-full border border-gray-300 rounded-lg overflow-hidden">
        <MapContainer
          center={[10.5, -66.9]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </MapContainer>
      </div>
      <p className="mt-2 text-sm text-gray-600">
        Si puedes ver este mapa, la configuración básica de Leaflet funciona correctamente.
      </p>
    </div>
  );
};

export default MapaSimple;
