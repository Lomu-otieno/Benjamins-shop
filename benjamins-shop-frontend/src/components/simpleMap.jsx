// src/components/SimpleMap.jsx
import React from "react";

const SimpleMap = ({ location }) => {
  const { lat, lng, address } = location;

  return (
    <div className="simple-map">
      <div className="map-placeholder">
        <div className="static-map-content">
          <h4>📍 Store Location</h4>
          <p>{address}</p>
          <div className="map-actions">
            <button
              className="btn btn-outline"
              onClick={() =>
                window.open(
                  `https://maps.google.com/?q=${lat},${lng}`,
                  "_blank"
                )
              }
            >
              Open in Google Maps
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleMap;
