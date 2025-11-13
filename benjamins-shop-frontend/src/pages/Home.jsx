// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MapWrapper from "../components/MapWrapper";
import "../styles/location.css";

const Home = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Shop location coordinates (Maseno, Kenya)
  const shopLocation = {
    lat: -0.00432,
    lng: 34.61184,
    address: "XJW6+7Q Luanda, Maseno, Kenya",
    city: "Maseno",
    phone: "+254 725 364 152",
    hours: {
      weekdays: "9:00 AM - 10:00 PM",
      saturday: "10:00 AM - 9:00 PM",
      sunday: "11:00 AM - 5:00 PM",
    },
  };

  // Prepare markers for the map - SIMPLIFIED VERSION
  const getMapMarkers = () => {
    const markers = [
      {
        position: shopLocation,
        title: "Benjamin's Shop",
        address: shopLocation.address,
        phone: shopLocation.phone,
      },
    ];

    // Add user location marker if available
    if (userLocation) {
      markers.push({
        position: userLocation,
        title: "Your Location",
      });
    }

    return markers;
  };

  useEffect(() => {
    // Get user's location for distance calculation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          setLocationError(
            "Unable to get your location. Please enable location services."
          );
          console.log("Location error:", error);
        }
      );
    }
  }, []);

  // Calculate distance between user and shop
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance.toFixed(1);
  };

  const distance = userLocation
    ? calculateDistance(
        userLocation.lat,
        userLocation.lng,
        shopLocation.lat,
        shopLocation.lng
      )
    : null;

  const handleGetDirections = () => {
    if (userLocation) {
      // Open Google Maps with directions from user location to shop
      window.open(
        `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${shopLocation.lat},${shopLocation.lng}`,
        "_blank"
      );
    } else {
      // Fallback to just showing the shop location
      window.open(
        `https://maps.google.com/?q=${shopLocation.lat},${shopLocation.lng}`,
        "_blank"
      );
    }
  };

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Welcome to Benjamin's Shop</h1>
            <p>Discover amazing products at unbeatable prices</p>
            <Link to="/products" className="btn btn-primary btn-large">
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <div className="features-grid">
            <div className="feature">
              <h3>🚚 Free Shipping</h3>
              <p>At your door step</p>
            </div>
            <div className="feature">
              <h3>💳 Trust Services</h3>
              <p>Pay After Delivery</p>
            </div>
            <div className="feature">
              <h3>↩️ Easy Returns</h3>
              <p>30-day return policy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Location Section with Interactive Maps */}
      <section className="location-section">
        <div className="container">
          <div className="location-header">
            <h2>Visit Our Store</h2>
            <p>Come see us in person and experience our products firsthand</p>
          </div>

          <div className="location-content">
            <div className="location-info">
              <div className="info-card">
                <h3>📍 Store Location</h3>
                <div className="address">
                  <p>
                    <strong>Address:</strong>
                  </p>
                  <p>{shopLocation.address}</p>
                </div>

                <div className="contact-info">
                  <p>
                    <strong>📞 Phone:</strong> {shopLocation.phone}
                  </p>
                  <p>
                    <strong>🕒 Store Hours:</strong>
                  </p>
                  <ul className="hours-list">
                    <li>Mon-Fri: {shopLocation.hours.weekdays}</li>
                    <li>Saturday: {shopLocation.hours.saturday}</li>
                    <li>Sunday: {shopLocation.hours.sunday}</li>
                  </ul>
                </div>

                {distance && (
                  <div className="distance-info">
                    <p>
                      <strong>📍 You are {distance} km away</strong>
                    </p>
                    <small>Based on your current location</small>
                  </div>
                )}

                {locationError && (
                  <div className="location-error">
                    <small>{locationError}</small>
                  </div>
                )}

                <div className="location-actions">
                  <button
                    className="btn btn-outline"
                    onClick={handleGetDirections}
                  >
                    📱 Get Directions
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => window.open(`tel:${shopLocation.phone}`)}
                  >
                    📞 Call Store
                  </button>
                </div>
              </div>
            </div>

            <div className="location-map">
              <div className="map-container">
                <h4>🗺️ {shopLocation.city}</h4>
                <p>Find us easily with interactive maps</p>

                {/* Interactive Google Map */}
                <div className="interactive-map">
                  <MapWrapper
                    center={shopLocation}
                    zoom={15}
                    markers={getMapMarkers()}
                    height="400px"
                  />
                </div>

                <div className="map-features">
                  <div className="map-legend">
                    <div className="legend-item">
                      <div className="legend-color shop-marker"></div>
                      <span>Benjamin's Shop</span>
                    </div>
                    {userLocation && (
                      <div className="legend-item">
                        <div className="legend-color user-marker"></div>
                        <span>Your Location</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Service Area Map */}
          <div className="service-area-map">
            <h3>🏙️ Our Service Area</h3>
            <div className="service-map-container">
              <MapWrapper
                center={{ lat: -0.00432, lng: 34.61184 }}
                zoom={12}
                height="300px"
                markers={[
                  {
                    position: shopLocation,
                    title: "Benjamin's Shop - Main Store",
                    address: shopLocation.address,
                    phone: shopLocation.phone,
                  },
                ]}
              />
              <div className="service-coverage">
                <h4>Delivery Coverage</h4>
                <ul>
                  <li>✅ Free delivery</li>
                  <li>✅ Maseno 10Km radius</li>
                  <li>✅ Same-day delivery available</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
