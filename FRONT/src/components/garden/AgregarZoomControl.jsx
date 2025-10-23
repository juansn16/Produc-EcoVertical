import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { createZoomControl, removeControlSafely } from "./LeafletConfig";

const AgregarZoomControl = ({ enabled = true } = {}) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    let zoomControl = null;

    if (enabled) {
      // Crear control de zoom usando la configuración robusta
      zoomControl = createZoomControl();
      zoomControl.addTo(map);
    }

    return () => {
      if (zoomControl) {
        removeControlSafely(map, zoomControl);
      }
    };
  }, [enabled, map]);

  return null;
};

export default AgregarZoomControl;
