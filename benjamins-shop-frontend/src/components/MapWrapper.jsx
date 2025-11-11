// src/components/MapWrapper.jsx
import React from "react";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import GoogleMap from "./GoogleMap";

const render = (status) => {
  if (status === Status.LOADING)
    return (
      <div
        className="map-loading"
        style={{
          height: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f9fa",
          borderRadius: "12px",
          color: "#6c757d",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🗺️</div>
          <p>Loading map...</p>
        </div>
      </div>
    );

  if (status === Status.FAILURE)
    return (
      <div
        className="map-error"
        style={{
          height: "400px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f9fa",
          borderRadius: "12px",
          color: "#dc3545",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>❌</div>
        <p>Error loading map</p>
        <small>Please check your Google Maps API key</small>
      </div>
    );

  return null;
};

const MapWrapper = ({ center, zoom, markers, className, height }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div
        className="map-error"
        style={{
          height: "400px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f9fa",
          borderRadius: "12px",
          color: "#dc3545",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔑</div>
        <p>Google Maps API key not configured</p>
        <small>
          Please add VITE_GOOGLE_MAPS_API_KEY to your environment variables
        </small>
      </div>
    );
  }

  return (
    <Wrapper apiKey={apiKey} render={render} libraries={["places"]}>
      <GoogleMap
        center={center}
        zoom={zoom}
        markers={markers}
        className={className}
        height={height}
      />
    </Wrapper>
  );
};

export default MapWrapper;
