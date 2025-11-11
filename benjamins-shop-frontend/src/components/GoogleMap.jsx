// src/components/GoogleMap.jsx
import React, { useEffect, useRef } from "react";

const GoogleMap = ({
  center = { lat: -0.00432, lng: 34.61184 },
  zoom = 15,
  markers = [],
  className = "",
  height = "400px",
}) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!window.google) {
      console.error("Google Maps API not loaded");
      return;
    }

    // Initialize map
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center,
      zoom,
      styles: [
        {
          featureType: "all",
          elementType: "geometry",
          stylers: [{ color: "#f5f5f5" }],
        },
        {
          featureType: "all",
          elementType: "labels.text.fill",
          stylers: [{ color: "#616161" }],
        },
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    });

    // Add markers
    markers.forEach((markerConfig) => {
      new window.google.maps.Marker({
        position: markerConfig.position,
        map: mapInstance.current,
        title: markerConfig.title,
        icon: markerConfig.icon,
      });
    });

    // Add shop info window
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 10px;">
          <h3 style="margin: 0 0 8px 0; color: #2c3e50;">Benjamin's Shop</h3>
          <p style="margin: 0 0 5px 0; color: #555;">${
            markers[0]?.address || "XJW6+7Q Luanda"
          }</p>
          <p style="margin: 0; color: #555;">${
            markers[0]?.phone || "+254 725 364 152"
          }</p>
        </div>
      `,
    });

    // Open info window by default for the first marker
    if (markers.length > 0) {
      infoWindow.open(mapInstance.current, markers[0].marker);
    }
  }, [center, zoom, markers]);

  return (
    <div
      ref={mapRef}
      className={`google-map ${className}`}
      style={{ height, width: "100%", borderRadius: "12px" }}
    />
  );
};

export default GoogleMap;
