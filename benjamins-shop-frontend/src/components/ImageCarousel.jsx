// src/components/ImageCarousel.jsx
import React, { useState, useEffect } from "react";
import "../styles/carousel.css";
import { Link } from "react-router-dom";

const ImageCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Sample images - replace these with your actual product/shop images
  const slides = [
    {
      id: 1,
      image:
        "https://res.cloudinary.com/dpsojbi11/image/upload/v1763014031/WhatsApp_Image_2025-11-13_at_08.42.44_vwo8k3.jpg",
      title: "Shop Glimpse",
      description: "Visit us anytime within the working hours",
    },
    {
      id: 2,
      image:
        "https://res.cloudinary.com/dpsojbi11/image/upload/v1763013975/WhatsApp_Image_2025-11-13_at_08.42.45_nbaf9b.jpg",
      title: "Founder",
      description: "Meet the Founder and our crew members",
    },
    {
      id: 3,
      image:
        "https://res.cloudinary.com/dpsojbi11/image/upload/v1763013974/WhatsApp_Image_2025-11-13_at_08.42.43_smj642.jpg",
      title: "Products",
      description: "trustworthy honest transparent",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [currentSlide]);

  return (
    <section className="carousel-section">
      <div className="container">
        <div className="carousel-header">
          <h2>Featured Products</h2>
          <p>Discover our most popular items</p>
        </div>

        <div className="carousel-container">
          <div className="carousel">
            <button
              className="carousel-btn carousel-btn--prev"
              onClick={prevSlide}
            >
              ‹
            </button>

            <div className="carousel-track">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`carousel-slide ${
                    index === currentSlide ? "active" : ""
                  }`}
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  <img src={slide.image} alt={slide.title} />
                  <div className="slide-content">
                    <h3>{slide.title}</h3>
                    <p>{slide.description}</p>
                    <Link to="/products" className="btn btn-primary">
                      Shop Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="carousel-btn carousel-btn--next"
              onClick={nextSlide}
            >
              ›
            </button>
          </div>

          {/* Indicators */}
          <div className="carousel-indicators">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`indicator ${
                  index === currentSlide ? "active" : ""
                }`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImageCarousel;
