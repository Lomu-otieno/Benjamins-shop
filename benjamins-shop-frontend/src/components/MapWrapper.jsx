// src/components/MapWrapper.jsx
import React from "react";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import GoogleMap from "./GoogleMap";

const render = (status) => {
  if (status === Status.LOADING)
    return <div className="map-loading">Loading map...</div>;
  if (status === Status.FAILURE)
    return <div className="map-error">Error loading map</div>;
  return null;
};

const MapWrapper = ({ center, zoom, markers, className, height }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="map-error">
        <p>Google Maps API key not configured</p>
        <small>
          Please add VITE_GOOGLE_MAPS_API_KEY to your environment variables
        </small>
      </div>
    );
  }

  return (
    <Wrapper apiKey={apiKey} render={render}>
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
