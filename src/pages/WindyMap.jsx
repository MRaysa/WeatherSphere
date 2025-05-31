import React, { useEffect, useState, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { motion, AnimatePresence } from "framer-motion";

// Initialize Mapbox
mapboxgl.accessToken =
  "pk.eyJ1IjoiYXlzYSIsImEiOiJjbTkwYXNidzYwajlrMmpzZHk1OWM4Zjk1In0.-4Im1sYjHHWGokgOrFw-qg";

const AqiMap = () => {
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState("");
  const [map, setMap] = useState(null);
  const [aqiData, setAqiData] = useState([]);
  const mapContainer = useRef(null);

  const CONFIG = {
    apiKey: "04994a992d9d9276534eb3a83ce9cf99",
    gridSpacing: 2,
    maxRequests: 60,
    requestDelay: 1100,
  };

  // AQI color scale
  const aqiColorScale = (aqi) => {
    if (aqi <= 50) return "#00e400";
    if (aqi <= 100) return "#ffff00";
    if (aqi <= 150) return "#ff7e00";
    if (aqi <= 200) return "#ff0000";
    if (aqi <= 300) return "#8f3f97";
    return "#000000";
  };

  // Convert OpenWeatherMap AQI to standard AQI
  const convertToStandardAQI = (owmAqi) => {
    const scale = {
      1: 25,
      2: 75,
      3: 125,
      4: 175,
      5: 250,
    };
    return scale[owmAqi] || 0;
  };

  // Generate grid points for global coverage
  const generateGridPoints = (spacing) => {
    const grid = [];
    for (let lat = -85; lat <= 85; lat += spacing) {
      for (let lon = -180; lon <= 180; lon += spacing) {
        grid.push([lat, lon]);
      }
    }
    return grid;
  };

  // Get AQI description
  const getAqiDescription = (aqi) => {
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy for Sensitive Groups";
    if (aqi <= 200) return "Unhealthy";
    if (aqi <= 300) return "Very Unhealthy";
    return "Hazardous";
  };

  // Legend items
  const legendItems = [
    { color: "#00e400", label: "Good (0-50)" },
    { color: "#ffff00", label: "Moderate (51-100)" },
    { color: "#ff7e00", label: "Unhealthy for Sensitive Groups (101-150)" },
    { color: "#ff0000", label: "Unhealthy (151-200)" },
    { color: "#8f3f97", label: "Very Unhealthy (201-300)" },
    { color: "#000000", label: "Hazardous (301-500)" },
  ];

  // Fetch AQI data with rate limiting
  const fetchAQIData = async () => {
    setLoading(true);
    setAqiData([]);

    try {
      const gridPoints = generateGridPoints(CONFIG.gridSpacing);
      const newAqiData = [];
      let requestCount = 0;

      for (const [lat, lon] of gridPoints) {
        requestCount++;
        setLoadingProgress(
          `Loading data... (${requestCount}/${gridPoints.length})`
        );

        // Rate limiting
        if (requestCount % CONFIG.maxRequests === 0) {
          await new Promise((resolve) =>
            setTimeout(resolve, CONFIG.requestDelay)
          );
        }

        try {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${CONFIG.apiKey}`
          );
          const data = await response.json();

          if (data.list && data.list[0]) {
            const aqi = convertToStandardAQI(data.list[0].main.aqi);
            newAqiData.push({
              lat,
              lon,
              aqi,
              timestamp: new Date(data.list[0].dt * 1000),
            });
          }
        } catch (error) {
          console.error(`Failed to fetch ${lat},${lon}:`, error);
        }
      }

      setAqiData(newAqiData);
    } catch (error) {
      console.error("Error fetching AQI data:", error);
      setLoadingProgress(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Initialize map
  useEffect(() => {
    if (mapContainer.current && !map) {
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v10",
        center: [0, 20],
        zoom: 2,
        pitch: 45, // Add some 3D perspective
        bearing: 0,
        antialias: true,
      });

      newMap.on("load", () => {
        setMap(newMap);
        fetchAQIData();
      });

      // Add navigation control
      newMap.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Add 3D terrain (optional)
      newMap.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });

      newMap.setTerrain({ source: "mapbox-dem", exaggeration: 0.5 });

      setMap(newMap);
    }

    return () => {
      if (map) map.remove();
    };
  }, []);

  // Visualize data when aqiData or map changes
  useEffect(() => {
    if (!map || !aqiData.length) return;

    // Remove existing layers and sources if they exist
    if (map.getLayer("aqi-heat")) map.removeLayer("aqi-heat");
    if (map.getSource("aqi-heat")) map.removeSource("aqi-heat");
    if (map.getLayer("aqi-points")) map.removeLayer("aqi-points");
    if (map.getSource("aqi-points")) map.removeSource("aqi-points");

    // Prepare heatmap data
    const heatmapData = {
      type: "FeatureCollection",
      features: aqiData.map((point) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [point.lon, point.lat],
        },
        properties: {
          aqi: point.aqi,
        },
      })),
    };

    // Add heatmap layer
    map.addSource("aqi-heat", {
      type: "geojson",
      data: heatmapData,
    });

    map.addLayer({
      id: "aqi-heat",
      type: "heatmap",
      source: "aqi-heat",
      maxzoom: 9,
      paint: {
        "heatmap-weight": [
          "interpolate",
          ["linear"],
          ["get", "aqi"],
          0,
          0,
          300,
          1,
        ],
        "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 9, 3],
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0,
          "rgba(0, 228, 0, 0)",
          0.2,
          "rgba(0, 228, 0, 1)",
          0.4,
          "rgba(255, 255, 0, 1)",
          0.6,
          "rgba(255, 126, 0, 1)",
          0.8,
          "rgba(255, 0, 0, 1)",
          1,
          "rgba(143, 63, 151, 1)",
        ],
        "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 2, 9, 20],
        "heatmap-opacity": 0.8,
      },
    });

    // Add circle markers for points
    map.addSource("aqi-points", {
      type: "geojson",
      data: heatmapData,
    });

    map.addLayer({
      id: "aqi-points",
      type: "circle",
      source: "aqi-points",
      minzoom: 5,
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 2, 10, 8],
        "circle-color": [
          "case",
          ["<=", ["get", "aqi"], 50],
          "#00e400",
          ["<=", ["get", "aqi"], 100],
          "#ffff00",
          ["<=", ["get", "aqi"], 150],
          "#ff7e00",
          ["<=", ["get", "aqi"], 200],
          "#ff0000",
          ["<=", ["get", "aqi"], 300],
          "#8f3f97",
          "#000000",
        ],
        "circle-stroke-width": 1,
        "circle-stroke-color": "#ffffff",
        "circle-opacity": 0.8,
      },
    });

    // Add click interaction
    map.on("click", "aqi-points", (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const aqi = e.features[0].properties.aqi;
      const description = getAqiDescription(aqi);

      // Ensure the popup appears in the correct position
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(
          `
          <div style="font-family: Arial, sans-serif; padding: 10px;">
            <h3 style="margin-top: 0; color: ${aqiColorScale(
              aqi
            )}">AQI: ${aqi} (${description})</h3>
            <p><strong>Location:</strong> ${e.lngLat.lat.toFixed(
              2
            )}, ${e.lngLat.lng.toFixed(2)}</p>
          </div>
        `
        )
        .addTo(map);
    });

    // Change cursor to pointer when hovering over points
    map.on("mouseenter", "aqi-points", () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", "aqi-points", () => {
      map.getCanvas().style.cursor = "";
    });

    // Add fly-to animation for better UX
    const flyToRandomLocation = () => {
      if (aqiData.length > 0) {
        const randomPoint = aqiData[Math.floor(Math.random() * aqiData.length)];
        map.flyTo({
          center: [randomPoint.lon, randomPoint.lat],
          zoom: 5,
          speed: 1.2,
          curve: 1.42,
          essential: true,
        });
      }
    };

    // Fly to a random location every 20 seconds
    const intervalId = setInterval(flyToRandomLocation, 20000);

    return () => {
      clearInterval(intervalId);
      if (map) {
        map.off("click", "aqi-points");
        map.off("mouseenter", "aqi-points");
        map.off("mouseleave", "aqi-points");
      }
    };
  }, [aqiData, map]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1000,
              background: "rgba(0, 0, 0, 0.8)",
              padding: "20px",
              borderRadius: "10px",
              color: "white",
              textAlign: "center",
            }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 0.8,
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "10px" }}>🌍</div>
            </motion.div>
            <div>{loadingProgress}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          zIndex: 1000,
          background: "rgba(0, 0, 0, 0.7)",
          padding: "15px",
          borderRadius: "10px",
          color: "white",
          backdropFilter: "blur(5px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "10px" }}>AQI Levels</h3>
        {legendItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ x: 20 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            style={{
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                backgroundColor: item.color,
                marginRight: "10px",
                borderRadius: "4px",
              }}
            />
            <div>{item.label}</div>
          </motion.div>
        ))}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchAQIData}
          style={{
            marginTop: "15px",
            padding: "8px 16px",
            cursor: "pointer",
            background: "linear-gradient(135deg, #00b4db, #0083b0)",
            color: "white",
            border: "none",
            borderRadius: "5px",
            width: "100%",
            fontWeight: "bold",
          }}
        >
          Refresh Data
        </motion.button>
      </motion.div>
    </div>
  );
};

export default AqiMap;
