import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

const AqiMap = () => {
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState("");

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

  // Create legend items
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

    try {
      const gridPoints = generateGridPoints(CONFIG.gridSpacing);
      const aqiData = [];
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
            aqiData.push({
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

      visualizeData(aqiData);
    } catch (error) {
      console.error("Error fetching AQI data:", error);
      setLoadingProgress(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Visualize data on the map
  const visualizeData = (aqiData) => {
    const map = L.map("map").setView([20, 0], 2);

    // Add tile layer with proper attribution
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    // Create heatmap data
    const heatData = aqiData.map((point) => [
      point.lat,
      point.lon,
      point.aqi / 5,
    ]);

    // Add heatmap layer
    L.heatLayer(heatData, {
      radius: 15,
      blur: 20,
      maxZoom: 10,
      gradient: {
        0.1: "#00e400",
        0.3: "#ffff00",
        0.5: "#ff7e00",
        0.7: "#ff0000",
        0.9: "#8f3f97",
        1.0: "#000000",
      },
    }).addTo(map);

    // Add clickable markers for detailed info
    aqiData.forEach((point) => {
      const marker = L.circleMarker([point.lat, point.lon], {
        radius: 5,
        color: aqiColorScale(point.aqi),
        fillColor: aqiColorScale(point.aqi),
        fillOpacity: 0.7,
        weight: 1,
      }).addTo(map);

      marker.bindPopup(`
        <strong>Location:</strong> ${point.lat.toFixed(2)}, ${point.lon.toFixed(
        2
      )}<br>
        <strong>AQI:</strong> ${point.aqi} (${getAqiDescription(point.aqi)})<br>
        <strong>Last update:</strong> ${point.timestamp.toLocaleString()}
      `);
    });
  };

  useEffect(() => {
    // Initialize map and fetch data when component mounts
    fetchAQIData();

    // Cleanup function to remove map when component unmounts
    return () => {
      const mapElement = document.getElementById("map");
      if (mapElement) {
        mapElement._leaflet_id = null;
        mapElement.innerHTML = "";
      }
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div id="map" style={{ width: "100%", height: "100%" }}></div>

      <div
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          zIndex: 1000,
          background: "rgba(255, 255, 255, 0.9)",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
        }}
      >
        <h3 style={{ marginTop: 0 }}>AQI Levels</h3>
        {legendItems.map((item, index) => (
          <div key={index}>
            <span
              style={{
                display: "inline-block",
                width: "20px",
                height: "20px",
                backgroundColor: item.color,
                marginRight: "5px",
                verticalAlign: "middle",
              }}
            ></span>
            {item.label}
          </div>
        ))}
        <button
          onClick={fetchAQIData}
          style={{
            marginTop: "10px",
            padding: "5px 10px",
            cursor: "pointer",
          }}
        >
          Refresh Data
        </button>
      </div>

      {loading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1000,
            background: "rgba(255, 255, 255, 0.9)",
            padding: "20px",
            borderRadius: "5px",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
          }}
        >
          {loadingProgress}
        </div>
      )}
    </div>
  );
};

export default AqiMap;
