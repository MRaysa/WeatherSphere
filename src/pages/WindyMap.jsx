import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../contexts/ThemeContext";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  FaLocationArrow,
  FaWind,
  FaCompass,
  FaPlay,
  FaPause,
  FaSearchLocation,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

// Set Mapbox access token
mapboxgl.accessToken =
  "pk.eyJ1IjoiYXlzYSIsImEiOiJjbTkwYXNidzYwajlrMmpzZHk1OWM4Zjk1In0.-4Im1sYjHHWGokgOrFw-qg";

const WindyMap = () => {
  const { theme } = useTheme();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [loading, setLoading] = useState(true);
  const [locationInput, setLocationInput] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);
  const [windData, setWindData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [searchedLocations, setSearchedLocations] = useState([]);
  const animationId = useRef(null);
  const particles = useRef([]);
  const arrows = useRef([]);
  const tooltipRef = useRef(null);
  const markers = useRef([]);

  // Theme-based colors
  const themeStyles = {
    light: {
      bg: "bg-white",
      cardBg: "bg-gray-50",
      text: "text-gray-800",
      border: "border-gray-200",
      button: "bg-blue-600 hover:bg-blue-700",
      input:
        "bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500",
    },
    dark: {
      bg: "bg-gray-900",
      cardBg: "bg-gray-800",
      text: "text-gray-100",
      border: "border-gray-700",
      button: "bg-blue-700 hover:bg-blue-800",
      input:
        "bg-gray-700 border-gray-600 focus:ring-blue-500 focus:border-blue-500",
    },
  };

  // Initialize map
  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [0, 20],
      zoom: 1.5,
    });

    map.current.addControl(new mapboxgl.NavigationControl());
    map.current.on("load", () => {
      setLoading(false);
      initializeWindVisualization();
    });

    return () => {
      if (map.current) map.current.remove();
      cancelAnimation();
      clearMarkers();
    };
  }, []);

  // Update map style based on theme
  useEffect(() => {
    if (!map.current) return;
    const style =
      theme === "dark"
        ? "mapbox://styles/mapbox/dark-v10"
        : "mapbox://styles/mapbox/streets-v11";
    map.current.setStyle(style);
  }, [theme]);

  // Clear all markers
  const clearMarkers = () => {
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];
  };

  // Fetch wind data
  const fetchWindData = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=wind_speed_10m,wind_direction_10m`
      );
      if (!response.ok) throw new Error("Weather data not found");

      const data = await response.json();
      const current = data.current;

      const degToCardinal = (deg) => {
        const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
        return directions[Math.round((deg % 360) / 45) % 8];
      };

      return {
        speed: current.wind_speed_10m,
        direction: degToCardinal(current.wind_direction_10m),
        degree: current.wind_direction_10m,
        lat: lat,
        lon: lon,
      };
    } catch (error) {
      console.error("Error fetching wind data:", error);
      return {
        speed: Math.random() * 50,
        direction: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][
          Math.floor(Math.random() * 8)
        ],
        degree: Math.random() * 360,
        lat: lat,
        lon: lon,
      };
    }
  };

  // Fetch location data
  const fetchLocationData = async (location) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          location
        )}.json?access_token=${mapboxgl.accessToken}`
      );
      if (!response.ok) throw new Error("Location not found");

      const data = await response.json();
      if (data.features.length === 0) throw new Error("Location not found");

      const feature = data.features[0];
      return {
        name: feature.text,
        country:
          feature.context?.find((c) => c.id.includes("country"))?.text || "",
        lat: feature.center[1],
        lon: feature.center[0],
      };
    } catch (error) {
      console.error("Error fetching location data:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Initialize wind visualization
  const initializeWindVisualization = () => {
    tooltipRef.current = document.createElement("div");
    tooltipRef.current.className =
      "hidden bg-white p-2 rounded shadow-lg text-sm pointer-events-none absolute z-50";
    tooltipRef.current.innerHTML = `
      <div class="font-bold" id="windMapLocation">Location</div>
      <div>Wind: <span id="windMapWindSpeed">--</span> km/h</div>
      <div>Direction: <span id="windMapWindDir">--</span></div>
    `;
    mapContainer.current.appendChild(tooltipRef.current);

    map.current.on("mousemove", async (e) => {
      const { lng, lat } = e.lngLat;
      const windData = await fetchWindData(lat, lng);

      tooltipRef.current.style.display = "block";
      tooltipRef.current.style.left = `${e.point.x + 10}px`;
      tooltipRef.current.style.top = `${e.point.y + 10}px`;

      document.getElementById(
        "windMapLocation"
      ).textContent = `Lat: ${lat.toFixed(2)}, Lon: ${lng.toFixed(2)}`;
      document.getElementById("windMapWindSpeed").textContent =
        windData.speed.toFixed(1);
      document.getElementById("windMapWindDir").textContent = `${
        windData.direction
      } (${windData.degree.toFixed(0)}°)`;
    });

    map.current.on("mouseout", () => {
      tooltipRef.current.style.display = "none";
    });
  };

  // Create wind particles
  const createWindParticles = () => {
    particles.current.forEach((p) => p.parentNode?.removeChild(p));
    arrows.current.forEach((a) => a.parentNode?.removeChild(a));
    particles.current = [];
    arrows.current = [];

    if (!windData) return;

    const particleCount = Math.min(500, Math.max(50, windData.speed * 10));
    const windAngle = windData.degree * (Math.PI / 180);

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      const size = 1 + Math.random() * 4;
      const opacity = 0.3 + Math.random() * 0.7;
      const speedFactor = 0.5 + Math.random() * 1.5;

      const particleStyle = {
        background: `hsla(${200 + windData.speed * 2}, 80%, 70%, ${opacity})`,
        borderRadius: "50%",
        width: `${size}px`,
        height: `${size}px`,
        boxShadow: `0 0 ${size * 2}px hsla(${
          200 + windData.speed * 2
        }, 80%, 70%, 0.7)`,
        position: "absolute",
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        willChange: "transform",
        zIndex: 10,
      };

      if (windData.speed > 15) {
        particleStyle.width = `${size * 0.5}px`;
        particleStyle.height = `${size}px`;
        particleStyle.transform = `rotate(${windAngle}rad)`;
      }
      if (windData.speed > 30) {
        particleStyle.background = `linear-gradient(to right, hsla(${
          200 + windData.speed
        }, 80%, 50%, ${opacity}), hsla(${200 + windData.speed}, 80%, 50%, 0))`;
        particleStyle.width = `${size * (4 + windData.speed / 10)}px`;
      }

      Object.assign(particle.style, particleStyle);
      mapContainer.current.appendChild(particle);
      particles.current.push({
        element: particle,
        speed: speedFactor,
        x: parseFloat(particle.style.left),
        y: parseFloat(particle.style.top),
      });
    }

    const indicatorCount = Math.min(100, Math.max(10, windData.speed * 2));
    for (let i = 0; i < indicatorCount; i++) {
      const arrow = document.createElement("div");
      const size = 8 + Math.random() * 12;
      const opacity = 0.6 + Math.random() * 0.4;
      const speedFactor = 0.7 + Math.random() * 1.3;

      Object.assign(arrow.style, {
        position: "absolute",
        borderLeft: `${size / 2}px solid transparent`,
        borderRight: `${size / 2}px solid transparent`,
        borderBottom: `${size}px solid hsla(200, 80%, 60%, ${opacity})`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        transform: `rotate(${windData.degree}deg)`,
        filter: "drop-shadow(0 0 4px rgba(0,0,0,0.3))",
        willChange: "transform",
        zIndex: 10,
      });

      mapContainer.current.appendChild(arrow);
      arrows.current.push({
        element: arrow,
        speed: speedFactor,
        x: parseFloat(arrow.style.left),
        y: parseFloat(arrow.style.top),
      });
    }

    if (windData.speed > 15) {
      const lineCount = Math.floor(windData.speed / 5);
      for (let i = 0; i < lineCount; i++) {
        const line = document.createElement("div");
        const length = 50 + Math.random() * 150;
        const thickness = 1 + Math.random() * 3;
        const opacity = 0.2 + Math.random() * 0.4;
        const speedFactor = 0.8 + Math.random() * 1.2;

        Object.assign(line.style, {
          position: "absolute",
          background: `linear-gradient(to right, hsla(200, 80%, 60%, ${opacity}), hsla(200, 80%, 60%, 0))`,
          width: `${length}px`,
          height: `${thickness}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          transform: `rotate(${windData.degree}deg)`,
          transformOrigin: "left center",
          willChange: "transform",
          zIndex: 10,
        });

        mapContainer.current.appendChild(line);
        arrows.current.push({
          element: line,
          speed: speedFactor,
          x: parseFloat(line.style.left),
          y: parseFloat(line.style.top),
        });
      }
    }
  };

  // Animate wind particles
  const animateWindParticles = () => {
    if (!windData || !isPlaying) return;

    const angle = windData.degree * (Math.PI / 180);
    const baseSpeed = windData.speed * 0.015 * animationSpeed;
    const time = Date.now() * 0.001;
    const turbulenceIntensity = Math.min(2, windData.speed / 20);

    particles.current.forEach((particle, index) => {
      particle.x += Math.cos(angle) * baseSpeed * particle.speed;
      particle.y -= Math.sin(angle) * baseSpeed * particle.speed;

      particle.x += Math.sin(time * 2 + index * 0.1) * turbulenceIntensity;
      particle.y += Math.cos(time * 1.7 + index * 0.1) * turbulenceIntensity;

      particle.x = (particle.x + 100) % 100;
      particle.y = (particle.y + 100) % 100;

      particle.element.style.transition = `left ${
        0.3 / (animationSpeed * particle.speed)
      }s ease-out, top ${0.3 / (animationSpeed * particle.speed)}s ease-out`;
      particle.element.style.left = `${particle.x}%`;
      particle.element.style.top = `${particle.y}%`;

      if (Math.random() < 0.005 * animationSpeed) {
        particle.element.style.transition = "none";
        particle.x = Math.random() * 100;
        particle.y = Math.random() * 100;
        particle.element.style.left = `${particle.x}%`;
        particle.element.style.top = `${particle.y}%`;
      }
    });

    arrows.current.forEach((arrow, index) => {
      arrow.x += Math.cos(angle) * baseSpeed * arrow.speed;
      arrow.y -= Math.sin(angle) * baseSpeed * arrow.speed;

      const wobbleIntensity = Math.min(10, windData.speed / 5);
      const wobbleAngle =
        angle +
        (Math.sin(time * 3 + index * 0.2) * wobbleIntensity * Math.PI) / 180;

      arrow.element.style.transform = `rotate(${
        wobbleAngle * (180 / Math.PI)
      }deg)`;
      arrow.element.style.transition = `transform ${
        0.2 / (animationSpeed * arrow.speed)
      }s ease-out`;

      arrow.x = (arrow.x + 100) % 100;
      arrow.y = (arrow.y + 100) % 100;

      arrow.element.style.transition = `left ${
        0.3 / (animationSpeed * arrow.speed)
      }s ease-out, top ${0.3 / (animationSpeed * arrow.speed)}s ease-out`;
      arrow.element.style.left = `${arrow.x}%`;
      arrow.element.style.top = `${arrow.y}%`;

      if (Math.random() < 0.003 * animationSpeed) {
        arrow.element.style.transition = "none";
        arrow.x = Math.random() * 100;
        arrow.y = Math.random() * 100;
        arrow.element.style.left = `${arrow.x}%`;
        arrow.element.style.top = `${arrow.y}%`;
      }
    });

    if (windData.speed > 20 && Math.random() < 0.03) {
      const gustIntensity = 1 + windData.speed / 30;
      particles.current.forEach((particle) => {
        particle.x +=
          Math.cos(angle) * baseSpeed * particle.speed * gustIntensity;
        particle.y -=
          Math.sin(angle) * baseSpeed * particle.speed * gustIntensity;
        particle.element.style.transition = `left ${
          0.1 / (animationSpeed * particle.speed)
        }s linear, top ${0.1 / (animationSpeed * particle.speed)}s linear`;
        particle.element.style.left = `${particle.x}%`;
        particle.element.style.top = `${particle.y}%`;
      });
      arrows.current.forEach((arrow) => {
        arrow.x += Math.cos(angle) * baseSpeed * arrow.speed * gustIntensity;
        arrow.y -= Math.sin(angle) * baseSpeed * arrow.speed * gustIntensity;
        arrow.element.style.transition = `left ${
          0.1 / (animationSpeed * arrow.speed)
        }s linear, top ${0.1 / (animationSpeed * arrow.speed)}s linear`;
        arrow.element.style.left = `${arrow.x}%`;
        arrow.element.style.top = `${arrow.y}%`;
      });
    }

    animationId.current = requestAnimationFrame(animateWindParticles);
  };

  // Cancel animation
  const cancelAnimation = () => {
    if (animationId.current) {
      cancelAnimationFrame(animationId.current);
      animationId.current = null;
    }
  };

  // Toggle wind animation
  const toggleWindAnimation = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      createWindParticles();
      animateWindParticles();
    } else {
      cancelAnimation();
    }
  };

  // Handle location search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!locationInput.trim()) return;

    try {
      const locationData = await fetchLocationData(locationInput);
      const windData = await fetchWindData(locationData.lat, locationData.lon);

      const newWindData = {
        ...windData,
        location: locationData.name,
        country: locationData.country,
        coords: [locationData.lon, locationData.lat],
      };

      setWindData(newWindData);
      setCurrentLocation(locationData);

      if (!searchedLocations.some((loc) => loc.name === locationData.name)) {
        setSearchedLocations((prev) => [
          ...prev,
          {
            name: locationData.name,
            country: locationData.country,
            coords: [locationData.lon, locationData.lat],
            windSpeed: windData.speed,
            windDir: windData.direction,
          },
        ]);
      }

      map.current.flyTo({
        center: [locationData.lon, locationData.lat],
        zoom: 8,
        essential: true,
      });

      clearMarkers();

      const marker = new mapboxgl.Marker({
        color: "#3b82f6",
        draggable: false,
      })
        .setLngLat([locationData.lon, locationData.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-2">
              <h3 class="font-bold text-lg">${locationData.name}, ${
            locationData.country
          }</h3>
              <div class="my-2">
                <p class="text-sm"><strong>Wind Speed:</strong> ${windData.speed.toFixed(
                  1
                )} km/h</p>
                <p class="text-sm"><strong>Direction:</strong> ${
                  windData.direction
                } (${windData.degree.toFixed(0)}°)</p>
              </div>
              <p class="text-xs text-gray-500">
                Lat: ${locationData.lat.toFixed(
                  4
                )}, Lon: ${locationData.lon.toFixed(4)}
              </p>
            </div>
          `)
        )
        .addTo(map.current);

      markers.current.push(marker);

      Swal.fire({
        title: "Location Found!",
        text: `${locationData.name}, ${locationData.country}`,
        icon: "success",
        confirmButtonText: "OK",
        timer: 2000,
        timerProgressBar: true,
      });

      if (!isPlaying) toggleWindAnimation();
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        title: "Location Not Found",
        text: "Please try another location name",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  // Handle location click from list
  const handleLocationClick = (coords) => {
    map.current.flyTo({
      center: coords,
      zoom: 8,
      essential: true,
    });
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div
      className={`min-h-screen ${themeStyles[theme].bg} ${themeStyles[theme].text} transition-colors duration-300`}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <section className="mb-8">
          <motion.form
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto relative"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className={`flex items-center rounded-full p-2 shadow-lg ${themeStyles[theme].cardBg}`}
            >
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="Search for a city or location..."
                className={`flex-grow px-6 py-3 border-0 rounded-full focus:outline-none focus:ring-2 ${themeStyles[theme].input}`}
              />
              <motion.button
                type="submit"
                className={`ml-2 px-4 md:px-6 py-3 rounded-full text-white transition flex items-center shrink-0 ${themeStyles[theme].button}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaSearchLocation className="h-5 w-5 md:mr-2" />
                <span className="hidden md:inline">Search</span>
              </motion.button>
            </div>
          </motion.form>
        </section>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map Container */}
          <div className="lg:col-span-3">
            <motion.div
              className="relative rounded-xl overflow-hidden shadow-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {/* Loading overlay */}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-lg font-medium text-white">
                        Loading map data...
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Map */}
              <div ref={mapContainer} className="w-full h-[600px] rounded-xl" />

              {/* Controls */}
              <motion.div
                className={`absolute bottom-4 right-4 p-4 rounded-lg shadow-lg z-10 ${themeStyles[theme].cardBg}`}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-4">
                    <motion.button
                      onClick={toggleWindAnimation}
                      className={`px-4 py-2 rounded-lg text-white flex items-center ${themeStyles[theme].button}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isPlaying ? (
                        <>
                          <FaPause className="h-5 w-5 md:mr-2" />
                          <span className="hidden md:inline">Pause</span>
                        </>
                      ) : (
                        <>
                          <FaPlay className="h-5 w-5 md:mr-2" />
                          <span className="hidden md:inline">Play</span>
                        </>
                      )}
                    </motion.button>
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-2">Speed:</span>
                      <input
                        type="range"
                        min="0.1"
                        max="2"
                        step="0.1"
                        value={animationSpeed}
                        onChange={(e) =>
                          setAnimationSpeed(parseFloat(e.target.value))
                        }
                        className="w-24"
                      />
                      <span className="text-sm ml-2 w-8">
                        {animationSpeed}x
                      </span>
                    </div>
                  </div>
                  {windData && (
                    <motion.div
                      className="grid grid-cols-2 gap-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div
                        className={`p-3 rounded-lg ${
                          theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                        }`}
                      >
                        <p className="text-xs text-gray-500">Wind Speed</p>
                        <p className="text-xl font-bold">
                          {windData.speed.toFixed(1)}{" "}
                          <span className="text-sm">km/h</span>
                        </p>
                      </div>
                      <div
                        className={`p-3 rounded-lg ${
                          theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                        }`}
                      >
                        <p className="text-xs text-gray-500">Direction</p>
                        <div className="flex items-center">
                          <motion.div
                            className="w-6 h-6 mr-2"
                            style={{
                              transform: `rotate(${windData.degree}deg)`,
                            }}
                            animate={{ rotate: windData.degree }}
                            transition={{ duration: 1 }}
                          >
                            <FaLocationArrow className="text-blue-500" />
                          </motion.div>
                          <p className="text-xl font-bold">
                            {windData.direction}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Location list overlay */}
              {searchedLocations.length > 0 && (
                <motion.div
                  className={`absolute top-4 left-4 p-4 rounded-lg shadow-lg z-10 max-h-[80%] overflow-y-auto ${themeStyles[theme].cardBg}`}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <h3 className="font-semibold mb-3 text-lg">Locations</h3>
                  <ul className="space-y-2">
                    {searchedLocations.map((location, index) => {
                      const colors = [
                        "bg-blue-500",
                        "bg-green-500",
                        "bg-yellow-500",
                        "bg-red-500",
                        "bg-purple-500",
                        "bg-pink-500",
                        "bg-indigo-500",
                        "bg-teal-500",
                      ];
                      const color = colors[index % colors.length];

                      return (
                        <motion.li
                          key={`${location.name}-${index}`}
                          className={`flex items-center hover:bg-opacity-20 hover:bg-gray-500 p-2 rounded cursor-pointer ${themeStyles[theme].text}`}
                          onClick={() => handleLocationClick(location.coords)}
                          whileHover={{ x: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <span
                            className={`w-3 h-3 ${color} rounded-full mr-2`}
                          ></span>
                          {location.name}, {location.country}
                        </motion.li>
                      );
                    })}
                  </ul>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Wind Data Card */}
          <motion.div
            className={`rounded-xl shadow-lg p-6 ${themeStyles[theme].cardBg}`}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FaWind className="mr-2 text-blue-500" />
              Wind Conditions
            </h3>

            {windData ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className="text-sm text-gray-500">Speed</p>
                    <p className="text-2xl font-bold">
                      {windData.speed.toFixed(1)} km/h
                    </p>
                    <div className="w-full h-2 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full mt-2">
                      <motion.div
                        className="h-2 bg-white rounded-full"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(
                            100,
                            (windData.speed / 100) * 100
                          )}%`,
                        }}
                        transition={{ duration: 1, type: "spring" }}
                      ></motion.div>
                    </div>
                  </motion.div>

                  {/* Enhanced Compass */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className="text-sm text-gray-500">Direction</p>
                    <p className="text-2xl font-bold">{windData.direction}</p>
                    <div className="relative w-40 h-40 mx-auto mt-4">
                      {/* Compass outer circle */}
                      <div className="absolute inset-0 rounded-full border-4 border-gray-400 dark:border-gray-500"></div>

                      {/* Compass directions */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="absolute top-1 w-6 h-6 flex items-center justify-center font-bold text-red-500">
                          N
                        </div>
                        <div className="absolute right-1 w-6 h-6 flex items-center justify-center font-bold">
                          E
                        </div>
                        <div className="absolute bottom-1 w-6 h-6 flex items-center justify-center font-bold">
                          S
                        </div>
                        <div className="absolute left-1 w-6 h-6 flex items-center justify-center font-bold">
                          W
                        </div>
                        <div className="absolute top-3 right-3 w-4 h-4 flex items-center justify-center text-xs">
                          NE
                        </div>
                        <div className="absolute bottom-3 right-3 w-4 h-4 flex items-center justify-center text-xs">
                          SE
                        </div>
                        <div className="absolute bottom-3 left-3 w-4 h-4 flex items-center justify-center text-xs">
                          SW
                        </div>
                        <div className="absolute top-3 left-3 w-4 h-4 flex items-center justify-center text-xs">
                          NW
                        </div>
                      </div>

                      {/* Compass inner circle */}
                      <div className="absolute inset-8 rounded-full bg-white dark:bg-gray-200 shadow-md"></div>

                      {/* Wind direction indicator */}
                      <motion.div
                        className="absolute top-1/2 left-1/2 w-16 h-1 bg-red-500 origin-left z-10"
                        style={{ transformOrigin: "left center" }}
                        initial={{ rotate: 0 }}
                        animate={{ rotate: windData.degree }}
                        transition={{
                          type: "spring",
                          damping: 10,
                          stiffness: 100,
                        }}
                      >
                        <div className="absolute right-0 top-1/2 transform translate-y-1/2 w-0 h-0 border-l-8 border-r-8 border-b-12 border-transparent border-b-red-500"></div>
                      </motion.div>

                      {/* Degree marker */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center mt-12">
                        <span className="text-lg font-bold">
                          {Math.round(windData.degree)}°
                        </span>
                        <span className="block text-sm">
                          {windData.direction}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {currentLocation && (
                  <motion.div
                    className="mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h4 className="font-semibold mb-2">Current Location</h4>
                    <p>
                      {currentLocation.name}, {currentLocation.country}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Lat: {currentLocation.lat.toFixed(4)}, Lon:{" "}
                      {currentLocation.lon.toFixed(4)}
                    </p>
                  </motion.div>
                )}
              </>
            ) : (
              <motion.div
                className="text-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <FaCompass className="mx-auto text-4xl text-gray-400 mb-4" />
                </motion.div>
                <p>Search for a location to see wind data</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WindyMap;
