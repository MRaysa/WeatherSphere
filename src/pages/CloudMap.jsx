import React, { useEffect, useState, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiRefreshCw,
  FiCloud,
  FiSun,
  FiCloudRain,
  FiCloudSnow,
  FiZap,
} from "react-icons/fi";

// API Configuration
const WEATHER_API_KEY = "1dec1896e77e4da5b0c195326251603";
const MAPBOX_TOKEN =
  "pk.eyJ1IjoiYXlzYSIsImEiOiJjbTkwYXNidzYwajlrMmpzZHk1OWM4Zjk1In0.-4Im1sYjHHWGokgOrFw-qg";

const CloudMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const animationRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cities, setCities] = useState([]);
  const [viewMode, setViewMode] = useState("3d");
  const [timeOfDay, setTimeOfDay] = useState("day");

  // Weather configuration with enhanced animations
  const weatherConfig = {
    Sunny: {
      color: "rgba(247, 184, 0, 0.8)",
      icon: <FiSun className="text-yellow-400" />,
      pulseScale: 1.2,
    },
    Clear: {
      color: "rgba(247, 184, 0, 0.8)",
      icon: <FiSun className="text-yellow-400" />,
      pulseScale: 1.1,
    },
    "Partly cloudy": {
      color: "rgba(163, 188, 209, 0.8)",
      icon: <FiCloud className="text-gray-400" />,
      pulseScale: 1.3,
    },
    Cloudy: {
      color: "rgba(96, 108, 118, 0.8)",
      icon: <FiCloud className="text-gray-500" />,
      pulseScale: 1.4,
    },
    Overcast: {
      color: "rgba(96, 108, 118, 0.8)",
      icon: <FiCloud className="text-gray-600" />,
      pulseScale: 1.5,
    },
    Mist: {
      color: "rgba(179, 205, 224, 0.8)",
      icon: <FiCloud className="text-gray-200" />,
      pulseScale: 1.6,
    },
    Rain: {
      color: "rgba(42, 157, 143, 0.8)",
      icon: <FiCloudRain className="text-blue-400" />,
      pulseScale: 1.7,
    },
    Thunderstorm: {
      color: "rgba(230, 57, 70, 0.8)",
      icon: <FiZap className="text-yellow-200" />,
      pulseScale: 1.8,
    },
    Snow: {
      color: "rgba(255, 255, 255, 0.8)",
      icon: <FiCloudSnow className="text-white" />,
      pulseScale: 1.9,
    },
  };

  // Initialize map with cloud animations
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: `mapbox://styles/mapbox/${
        timeOfDay === "day" ? "light" : "dark"
      }-v10`,
      center: [100, 30],
      zoom: 3,
      pitch: viewMode === "3d" ? 45 : 0,
      bearing: 0,
      antialias: true,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.on("load", async () => {
      try {
        if (viewMode === "3d") {
          map.current.addSource("mapbox-dem", {
            type: "raster-dem",
            url: "mapbox://mapbox.mapbox-terrain-dem-v1",
            tileSize: 512,
            maxzoom: 14,
          });
          map.current.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });

          map.current.addLayer({
            id: "sky",
            type: "sky",
            paint: {
              "sky-type": "atmosphere",
              "sky-atmosphere-sun": [0.0, 0.0],
              "sky-atmosphere-sun-intensity": 15,
            },
          });
        }

        await fetchWeatherData();
        startCloudAnimation();
      } catch (err) {
        console.error("Map load error:", err);
        setError("Failed to load map data");
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      cancelAnimationFrame(animationRef.current);
    };
  }, [viewMode, timeOfDay]);

  // Enhanced cloud animation with different pulse rates
  const startCloudAnimation = () => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    const animate = (timestamp) => {
      if (!map.current || !map.current.isStyleLoaded()) return;

      if (map.current.getLayer("weather-points-pulse")) {
        // Animate each city with different pulse rates based on weather
        cities.forEach((city, index) => {
          const weatherType = city.weather[0].description;
          const config = weatherConfig[weatherType] || weatherConfig["Clear"];
          const pulseRate = 0.001 * config.pulseScale;

          map.current.setPaintProperty(
            `weather-point-${index}-pulse`,
            "circle-radius",
            [
              "interpolate",
              ["linear"],
              ["zoom"],
              3,
              ["+", 8, ["*", ["sin", ["*", pulseRate, timestamp]], 4]],
              8,
              ["+", 20, ["*", ["sin", ["*", pulseRate, timestamp]], 10]],
            ]
          );
          map.current.setPaintProperty(
            `weather-point-${index}-pulse`,
            "circle-opacity",
            [
              "interpolate",
              ["linear"],
              ["sin", ["*", pulseRate, timestamp]],
              -1,
              0.2,
              1,
              0.6,
            ]
          );
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  // Fetch weather data with enhanced cloud coverage simulation
  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Major Asian cities with coordinates
      const asianCities = [
        { name: "Tokyo", coords: [139.6917, 35.6895] },
        { name: "Delhi", coords: [77.1025, 28.7041] },
        { name: "Shanghai", coords: [121.4737, 31.2304] },
        { name: "Beijing", coords: [116.4074, 39.9042] },
        { name: "Mumbai", coords: [72.8777, 19.076] },
        { name: "Osaka", coords: [135.5022, 34.6937] },
        { name: "Karachi", coords: [67.0011, 24.8607] },
        { name: "Dhaka", coords: [90.4125, 23.8103] },
        { name: "Bangkok", coords: [100.5018, 13.7563] },
        { name: "Seoul", coords: [126.978, 37.5665] },
      ];

      // Simulate cloud coverage with random weather patterns
      const simulatedWeather = asianCities.map((city) => {
        const weatherTypes = Object.keys(weatherConfig);
        const randomWeather =
          weatherTypes[Math.floor(Math.random() * weatherTypes.length)];

        return {
          name: city.name,
          coord: { Lon: city.coords[0], Lat: city.coords[1] },
          weather: [{ description: randomWeather }],
          main: {
            temp: Math.floor(Math.random() * 30) + 10, // Random temp between 10-40°C
            humidity: Math.floor(Math.random() * 100),
          },
          clouds: {
            all: randomWeather.includes("cloud")
              ? Math.floor(Math.random() * 100) // Higher cloud coverage for cloudy weather
              : Math.floor(Math.random() * 30), // Lower for clear weather
          },
        };
      });

      setCities(simulatedWeather);
      visualizeWeatherData(simulatedWeather);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setError("Weather data unavailable. Showing simulated weather patterns.");

      // Fallback with simulated data
      const fallbackData = [
        {
          name: "Tokyo",
          coord: { Lon: 139.6917, Lat: 35.6895 },
          weather: [{ description: "Partly cloudy" }],
          main: { temp: 22 },
          clouds: { all: 70 },
        },
        {
          name: "Delhi",
          coord: { Lon: 77.1025, Lat: 28.7041 },
          weather: [{ description: "Sunny" }],
          main: { temp: 32 },
          clouds: { all: 10 },
        },
      ];
      setCities(fallbackData);
      visualizeWeatherData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced visualization with animated cloud layers
  const visualizeWeatherData = (citiesData) => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    // Remove existing layers
    const existingLayers = map.current.getStyle().layers || [];
    existingLayers.forEach((layer) => {
      if (layer.id.includes("weather-point")) {
        map.current.removeLayer(layer.id);
      }
    });
    if (map.current.getSource("weather-points")) {
      map.current.removeSource("weather-points");
    }

    // Create GeoJSON with enhanced cloud properties
    const geoJsonData = {
      type: "FeatureCollection",
      features: citiesData.map((city, index) => {
        const weatherType = city.weather[0].description;
        const config = weatherConfig[weatherType] || weatherConfig["Clear"];
        const cloudCoverage = city.clouds?.all || 50;

        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [city.coord.Lon, city.coord.Lat],
          },
          properties: {
            id: `weather-point-${index}`,
            name: city.name,
            description: weatherType,
            temperature: city.main.temp,
            color: config.color,
            icon: weatherType,
            cloudCoverage: cloudCoverage,
            pulseScale: config.pulseScale,
          },
        };
      }),
    };

    // Add source
    map.current.addSource("weather-points", {
      type: "geojson",
      data: geoJsonData,
      cluster: false,
      generateId: true,
    });

    // Add base weather points with size based on cloud coverage
    map.current.addLayer({
      id: "weather-points-base",
      type: "circle",
      source: "weather-points",
      paint: {
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["get", "cloudCoverage"],
          0,
          ["interpolate", ["linear"], ["zoom"], 3, 5, 8, 10],
          100,
          ["interpolate", ["linear"], ["zoom"], 3, 15, 8, 30],
        ],
        "circle-color": ["get", "color"],
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
        "circle-opacity": 0.8,
        "circle-pitch-scale": viewMode === "3d" ? "map" : "viewport",
      },
    });

    // Add individual pulsing layers for each city
    citiesData.forEach((_, index) => {
      map.current.addLayer({
        id: `weather-point-${index}-pulse`,
        type: "circle",
        source: "weather-points",
        filter: ["==", "id", `weather-point-${index}`],
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["get", "cloudCoverage"],
            0,
            ["interpolate", ["linear"], ["zoom"], 3, 5, 8, 10],
            100,
            ["interpolate", ["linear"], ["zoom"], 3, 15, 8, 30],
          ],
          "circle-color": ["get", "color"],
          "circle-stroke-width": 1,
          "circle-stroke-color": "#ffffff",
          "circle-opacity": 0.4,
          "circle-pitch-scale": viewMode === "3d" ? "map" : "viewport",
        },
      });
    });

    // Add floating cloud icons above points
    map.current.addLayer({
      id: "weather-icons",
      type: "symbol",
      source: "weather-points",
      layout: {
        "icon-image": "cloud-icon",
        "icon-size": [
          "interpolate",
          ["linear"],
          ["get", "cloudCoverage"],
          0,
          0.5,
          100,
          1.5,
        ],
        "icon-allow-overlap": true,
      },
      paint: {
        "icon-opacity": ["interpolate", ["linear"], ["zoom"], 3, 0.8, 8, 1],
      },
    });

    // Add interactivity
    map.current.on("click", "weather-points-base", (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const props = e.features[0].properties;
      const config = weatherConfig[props.description] || weatherConfig["Clear"];

      // Fly to the point with smooth animation
      map.current.flyTo({
        center: coordinates,
        zoom: Math.min(map.current.getZoom() + 1, 10),
        speed: 1.2,
        curve: 1,
      });

      // Create animated popup
      new mapboxgl.Popup({ offset: 25, className: "weather-popup" })
        .setLngLat(coordinates)
        .setHTML(
          `
          <div class="p-2">
            <div class="flex items-center gap-2">
              <div class="text-2xl animate-pulse">${config.icon}</div>
              <h3 class="text-lg font-bold">${props.name}</h3>
            </div>
            <div class="mt-2">
              <p><strong>Weather:</strong> ${props.description}</p>
              <p><strong>Temp:</strong> ${props.temperature}°C</p>
              <p><strong>Cloud Coverage:</strong> ${props.cloudCoverage}%</p>
            </div>
          </div>
        `
        )
        .addTo(map.current);
    });

    // Visual feedback on hover
    map.current.on("mouseenter", "weather-points-base", () => {
      map.current.getCanvas().style.cursor = "pointer";
      map.current.setPaintProperty(
        "weather-points-base",
        "circle-stroke-width",
        3
      );
    });

    map.current.on("mouseleave", "weather-points-base", () => {
      map.current.getCanvas().style.cursor = "";
      map.current.setPaintProperty(
        "weather-points-base",
        "circle-stroke-width",
        2
      );
    });

    // Start the cloud animations
    startCloudAnimation();
  };

  // Toggle between views with smooth transitions
  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "3d" ? "2d" : "3d"));
    if (map.current) {
      map.current.easeTo({
        pitch: viewMode === "3d" ? 0 : 45,
        duration: 1500,
        easing: (t) => t * (2 - t),
      });
    }
  };

  // Toggle day/night mode with style transition
  const toggleTimeOfDay = () => {
    setTimeOfDay((prev) => (prev === "day" ? "night" : "day"));
    if (map.current) {
      map.current
        .setStyle(
          `mapbox://styles/mapbox/${
            timeOfDay === "day" ? "light" : "dark"
          }-v10`,
          { diff: false }
        )
        .then(() => {
          // Re-apply data after style change
          if (cities.length > 0) {
            visualizeWeatherData(cities);
          }
        });
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Floating controls with animations */}
      <div className="absolute top-4 left-4 z-[9999] flex gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleViewMode}
          className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 p-3 rounded-full shadow-lg flex items-center gap-2 backdrop-blur-sm"
        >
          <motion.span
            animate={{ rotate: viewMode === "3d" ? 0 : 180 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {viewMode === "3d" ? "2D" : "3D"}
          </motion.span>
        </motion.button>

        {/* <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTimeOfDay}
          className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 p-3 rounded-full shadow-lg flex items-center gap-2 backdrop-blur-sm"
        >
          {timeOfDay === "day" ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            >
              <FiSun className="text-yellow-500 text-xl" />
            </motion.div>
          ) : (
            <motion.div
              animate={{ y: [0, -2, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <FiMoon className="text-blue-300 text-xl" />
            </motion.div>
          )}
        </motion.button> */}
      </div>

      {/* Enhanced loading animation with floating clouds */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[9998] bg-black bg-opacity-20 flex items-center justify-center flex-col gap-4 backdrop-blur-sm"
          >
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.2, 1],
                y: [0, -10, 0],
              }}
              transition={{
                rotate: { repeat: Infinity, duration: 8, ease: "linear" },
                scale: { repeat: Infinity, duration: 3, ease: "easeInOut" },
                y: { repeat: Infinity, duration: 4, ease: "easeInOut" },
              }}
              className="w-24 h-24 border-4 border-purple-400 border-t-transparent rounded-full relative"
            >
              <FiCloud className="text-white text-4xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </motion.div>
            <motion.p
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-white text-xl font-medium"
            >
              Loading weather data...
            </motion.p>

            {/* Floating mini clouds */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * 400 - 200,
                  y: Math.random() * 400 - 200,
                }}
                animate={{
                  x: [0, Math.random() * 100 - 50, 0],
                  y: [0, Math.random() * 100 - 50, 0],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 5 + Math.random() * 10,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
                className="absolute text-white text-2xl"
                style={{
                  left: `${50 + (Math.random() * 40 - 20)}%`,
                  top: `${50 + (Math.random() * 40 - 20)}%`,
                }}
              >
                <FiCloud />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced error message with animation */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[9999] bg-red-100 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-r-lg shadow-xl max-w-md"
        >
          <div className="flex items-start">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-red-500 mr-3 mt-1"
            >
              <FiAlertTriangle className="text-xl" />
            </motion.div>
            <div>
              <p className="font-bold">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-red-600 hover:text-red-800 flex items-center gap-1"
              >
                <FiX className="inline" /> Dismiss
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Refresh button with enhanced animation */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={fetchWeatherData}
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[9999] bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 backdrop-blur-sm"
      >
        <motion.span
          animate={{ rotate: loading ? 360 : 0 }}
          transition={{ duration: 1, ease: "linear" }}
        >
          <FiRefreshCw className="h-5 w-5" />
        </motion.span>
        <span className="font-medium">Refresh Weather Data</span>
      </motion.button>

      {/* Enhanced legend with animations */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, type: "spring" }}
        className="absolute top-20 right-4 z-[9999] bg-white bg-opacity-90 border border-gray-200 rounded-xl p-4 max-w-xs shadow-2xl backdrop-blur-sm"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200"
        >
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <FiCloud className="text-blue-400 text-xl" />
          </motion.div>
          <h4 className="text-lg font-bold">Weather Legend</h4>
        </motion.div>
        <div className="space-y-3">
          {Object.entries(weatherConfig).map(([desc, config]) => (
            <motion.div
              key={desc}
              whileHover={{ x: 5 }}
              className="flex items-center gap-3"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="flex items-center justify-center w-7 h-7"
              >
                {config.icon}
              </motion.div>
              <div
                className="w-5 h-5 rounded-full mr-2 shadow-inner"
                style={{
                  backgroundColor: config.color,
                  boxShadow: `0 0 8px ${config.color}`,
                }}
              ></div>
              <span className="capitalize text-sm font-medium">{desc}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default CloudMap;
