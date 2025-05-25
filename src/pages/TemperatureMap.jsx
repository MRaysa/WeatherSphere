import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import mapboxgl from "mapbox-gl";
import * as d3 from "d3";
import {
  FiSearch,
  FiBookmark,
  FiClock,
  FiMoon,
  FiSun,
  FiAlertTriangle,
  FiX,
  FiSend,
  FiMapPin,
  FiChevronDown,
  FiChevronUp,
  FiInfo,
  FiNavigation,
} from "react-icons/fi";
import {
  FaTemperatureHigh,
  FaTint,
  FaWind,
  FaSun,
  FaEye,
  FaWeightHanging,
  FaCloudRain,
  FaSnowflake,
  FaCloud,
  FaCloudSun,
  FaCloudMoon,
  FaCloudShowersHeavy,
  FaBolt,
} from "react-icons/fa";
import { WiHumidity, WiBarometer, WiDaySunny, WiCloudy } from "react-icons/wi";
import { IoMdThermometer } from "react-icons/io";
import { BsDropletHalf, BsWind } from "react-icons/bs";
import { RiContrastDropLine } from "react-icons/ri";

// Mapbox setup
mapboxgl.accessToken =
  "pk.eyJ1IjoiYXlzYSIsImEiOiJjbTkwYXNidzYwajlrMmpzZHk1OWM4Zjk1In0.-4Im1sYjHHWGokgOrFw-qg";

const TemperatureMap = () => {
  const { theme, toggleTheme } = useTheme();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [loading, setLoading] = useState(true);
  const [isDayMode, setIsDayMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [useCelsius, setUseCelsius] = useState(true);
  const [cities, setCities] = useState([]);
  const [forecastData, setForecastData] = useState({});
  const [hourlyForecast, setHourlyForecast] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [savedLocations, setSavedLocations] = useState([]);
  const [showHourlyForecast, setShowHourlyForecast] = useState(false);
  const [showSavedLocations, setShowSavedLocations] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [weatherAlert, setWeatherAlert] = useState(null);
  const [hoverTemperature, setHoverTemperature] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDetails, setExpandedDetails] = useState(false);
  const [error, setError] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [showLegend, setShowLegend] = useState(true);
  const [activeTab, setActiveTab] = useState("current");

  // Configuration
  const CONFIG = {
    DEFAULT_CENTER: [90.4125, 23.8103], // Dhaka
    DEFAULT_ZOOM: 5,
    TEMP_MIN: -10,
    TEMP_MAX: 40,
    WEATHER_API_KEY: "1dec1896e77e4da5b0c195326251603",
    WEATHER_API_URL: "https://api.weatherapi.com/v1",
    DEFAULT_CITIES: [
      { name: "Dhaka", lat: 23.8103, lon: 90.4125 },
      { name: "Chittagong", lat: 22.3569, lon: 91.7832 },
      { name: "Rajshahi", lat: 24.3745, lon: 88.6042 },
      { name: "Khulna", lat: 22.8456, lon: 89.5403 },
      { name: "Barisal", lat: 22.701, lon: 90.3535 },
      { name: "Sylhet", lat: 24.8949, lon: 91.8687 },
      { name: "Rangpur", lat: 25.7439, lon: 89.2752 },
      { name: "Cox's Bazar", lat: 21.4272, lon: 92.0058 },
    ],
  };

  // Color scale
  const colorScale = d3
    .scaleSequential()
    .domain([CONFIG.TEMP_MIN, CONFIG.TEMP_MAX])
    .interpolator(
      d3.interpolateRgbBasis([
        "#313695",
        "#4575b4",
        "#74add1",
        "#abd9e9",
        "#e0f3f8",
        "#ffffbf",
        "#fee090",
        "#fdae61",
        "#f46d43",
        "#d73027",
        "#a50026",
      ])
    );

  // Initialize map
  useEffect(() => {
    if (map.current) return; // Initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v10",
      center: CONFIG.DEFAULT_CENTER,
      zoom: CONFIG.DEFAULT_ZOOM,
    });

    // Add controls
    map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    map.current.addControl(new mapboxgl.FullscreenControl(), "bottom-right");
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserLocation: true,
      }),
      "bottom-right"
    );

    // Load data when map is ready
    map.current.on("load", async () => {
      try {
        await fetchCitiesInView();
        await fetchForecastData();
        setLoading(false);
      } catch (err) {
        setError("Failed to load map data. Please try again.");
        setLoading(false);
      }
    });

    // Handle map movement
    map.current.on("moveend", async () => {
      try {
        await fetchCitiesInView();
        await fetchForecastData();
      } catch (err) {
        setError("Failed to update map data. Please try again.");
      }
    });

    // Initialize hover temperature
    initHoverTemperature();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update map style when theme changes
  useEffect(() => {
    if (!map.current) return;

    const mapStyle = isDayMode
      ? "mapbox://styles/mapbox/light-v10"
      : "mapbox://styles/mapbox/dark-v10";
    map.current.setStyle(mapStyle);

    if (map.current.getLayer("temperature-labels")) {
      map.current.setPaintProperty(
        "temperature-labels",
        "text-color",
        isDayMode ? "#000000" : "#FFFFFF"
      );
      map.current.setPaintProperty(
        "temperature-labels",
        "text-halo-color",
        isDayMode ? "#FFFFFF" : "#000000"
      );
    }
  }, [isDayMode]);

  // Load saved locations from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedLocations")) || [];
    setSavedLocations(saved);
  }, []);

  // Animation for play/pause
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentDayIndex((prev) => (prev + 1) % 4);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Update heatmap when day index or unit changes
  useEffect(() => {
    if (Object.keys(forecastData).length > 0) {
      updateHeatmap(currentDayIndex);
    }
  }, [currentDayIndex, useCelsius, forecastData]);

  // Fetch cities in current map view
  const fetchCitiesInView = async () => {
    try {
      const bounds = map.current.getBounds();
      const center = map.current.getCenter();

      // First get current location weather
      const currentWeather = await fetchCurrentWeather(center.lat, center.lng);

      // Then search for cities in the area
      const response = await fetch(
        `${CONFIG.WEATHER_API_URL}/search.json?key=${CONFIG.WEATHER_API_KEY}&q=${center.lat},${center.lng}`
      );

      if (!response.ok) throw new Error("Failed to fetch cities");
      const citiesData = await response.json();

      // Limit to 8 major cities
      const newCities = citiesData.slice(0, 8).map((city) => ({
        name: city.name,
        lat: city.lat,
        lon: city.lon,
      }));

      // Add current location if not already in the list
      if (!newCities.some((c) => c.name === currentWeather.location.name)) {
        newCities.unshift({
          name: currentWeather.location.name,
          lat: currentWeather.location.lat,
          lon: currentWeather.location.lon,
        });
      }

      setCities(newCities);
      return newCities;
    } catch (error) {
      console.error("Error fetching cities:", error);
      setCities(CONFIG.DEFAULT_CITIES);
      return CONFIG.DEFAULT_CITIES;
    }
  };

  // Fetch current weather for a location
  const fetchCurrentWeather = async (lat, lon) => {
    try {
      const response = await fetch(
        `${CONFIG.WEATHER_API_URL}/current.json?key=${CONFIG.WEATHER_API_KEY}&q=${lat},${lon}`
      );
      if (!response.ok) throw new Error("Failed to fetch current weather");
      const data = await response.json();
      setCurrentLocation(data.location);
      return data;
    } catch (error) {
      console.error("Error fetching current weather:", error);
      throw error;
    }
  };

  // Fetch forecast data for all cities
  const fetchForecastData = async () => {
    setLoading(true);
    setError(null);
    try {
      const newForecastData = {};
      const citiesToFetch = cities.length ? cities : CONFIG.DEFAULT_CITIES;

      for (const city of citiesToFetch) {
        const response = await fetch(
          `${CONFIG.WEATHER_API_URL}/forecast.json?key=${CONFIG.WEATHER_API_KEY}&q=${city.lat},${city.lon}&days=4&aqi=yes&alerts=yes`
        );
        if (!response.ok) throw new Error("Failed to fetch forecast data");
        const data = await response.json();

        // Store current location info for the first city
        if (city === (citiesToFetch[0] || CONFIG.DEFAULT_CITIES[0])) {
          setCurrentLocation(data.location);

          // Check for alerts
          if (data.alerts?.alert?.length > 0) {
            setWeatherAlert(data.alerts.alert[0].headline);
            setTimeout(() => setWeatherAlert(null), 10000);
          }

          // Store hourly forecast for first city
          setHourlyForecast(data.forecast.forecastday[0].hour);
        }

        const currentTemp = data.current.temp_c;

        newForecastData[city.name] = data.forecast.forecastday.map(
          (day, index) => ({
            lat: city.lat,
            lon: city.lon,
            temp: index === 0 ? currentTemp : day.day.avgtemp_c,
            temp_f:
              index === 0
                ? data.current.temp_f
                : (day.day.avgtemp_c * 9) / 5 + 32,
            date: day.date,
            name: city.name,
            condition:
              index === 0
                ? data.current.condition.text
                : day.day.condition.text,
            icon:
              index === 0
                ? data.current.condition.icon
                : day.day.condition.icon,
            feelslike:
              index === 0 ? data.current.feelslike_c : day.day.avgtemp_c,
            feelslike_f:
              index === 0
                ? data.current.feelslike_f
                : (day.day.avgtemp_c * 9) / 5 + 32,
            humidity: index === 0 ? data.current.humidity : day.day.avghumidity,
            wind_kph: index === 0 ? data.current.wind_kph : day.day.maxwind_kph,
            wind_dir: index === 0 ? data.current.wind_dir : "N/A",
            precip_mm:
              index === 0 ? data.current.precip_mm : day.day.totalprecip_mm,
            uv: index === 0 ? data.current.uv : day.day.uv,
            vis_km: index === 0 ? data.current.vis_km : day.day.avgvis_km,
            pressure_mb:
              index === 0 ? data.current.pressure_mb : day.day.avgpressure_mb,
            aqi:
              index === 0 && data.current.air_quality
                ? data.current.air_quality["us-epa-index"]
                : null,
          })
        );
      }

      setForecastData(newForecastData);
      setLoading(false);
      return newForecastData;
    } catch (error) {
      console.error("Error fetching forecast data:", error);
      setError("Failed to load weather data. Please try again.");
      setLoading(false);
      throw error;
    }
  };

  // Initialize hover temperature display
  const initHoverTemperature = () => {
    map.current.on("mousemove", async (e) => {
      const { lng, lat } = e.lngLat;

      try {
        const response = await fetch(
          `${CONFIG.WEATHER_API_URL}/current.json?key=${CONFIG.WEATHER_API_KEY}&q=${lat},${lng}`
        );

        if (response.ok) {
          const data = await response.json();
          const temp = useCelsius ? data.current.temp_c : data.current.temp_f;
          const description = getTemperatureDescription(data.current.temp_c);

          setHoverTemperature({
            x: e.point.x,
            y: e.point.y,
            name: data.location.name,
            temp: Math.round(temp),
            description,
            color: getTemperatureColor(data.current.temp_c),
          });
        }
      } catch (error) {
        console.error("Error fetching hover location data:", error);
        setHoverTemperature(null);
      }
    });

    map.current.on("mouseout", () => {
      setHoverTemperature(null);
    });
  };

  // Update heatmap layer
  const updateHeatmap = (dayIndex) => {
    if (
      !map.current ||
      !map.current.getSource("temperature-points") ||
      Object.keys(forecastData).length === 0
    )
      return;

    const features = [];
    for (const cityName in forecastData) {
      const dayData = forecastData[cityName][dayIndex];
      features.push({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [dayData.lon, dayData.lat],
        },
        properties: {
          temperature: dayData.temp,
          tempDisplay: useCelsius ? dayData.temp : dayData.temp_f,
          name: dayData.name,
          description: getTemperatureDescription(dayData.temp),
        },
      });
    }

    const geojson = {
      type: "FeatureCollection",
      features: features,
    };

    if (map.current.getSource("temperature-points")) {
      map.current.getSource("temperature-points").setData(geojson);

      map.current.setLayoutProperty("temperature-labels", "text-field", [
        "concat",
        ["get", "name"],
        "\n",
        ["to-string", ["round", ["get", "tempDisplay"]]],
        useCelsius ? "°C" : "°F",
        "\n",
        ["get", "description"],
      ]);
    } else {
      map.current.addSource("temperature-points", {
        type: "geojson",
        data: geojson,
      });

      // Add heatmap layer
      map.current.addLayer({
        id: "temperature-heat",
        type: "heatmap",
        source: "temperature-points",
        maxzoom: 9,
        paint: {
          "heatmap-intensity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0,
            2,
            9,
            4,
          ],
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(0, 0, 128, 0)",
            0.1,
            colorScale(-10),
            0.2,
            colorScale(0),
            0.3,
            colorScale(5),
            0.4,
            colorScale(10),
            0.5,
            colorScale(15),
            0.6,
            colorScale(20),
            0.7,
            colorScale(25),
            0.8,
            colorScale(30),
            0.9,
            colorScale(35),
            1,
            colorScale(40),
          ],
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 15, 9, 40],
          "heatmap-opacity": 0.8,
          "heatmap-weight": [
            "interpolate",
            ["linear"],
            ["get", "temperature"],
            -10,
            0.2,
            0,
            0.4,
            10,
            0.6,
            20,
            0.8,
            30,
            1,
            40,
            1.2,
          ],
        },
      });

      // Add circle layer
      map.current.addLayer({
        id: "temperature-circles",
        type: "circle",
        source: "temperature-points",
        minzoom: 5,
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 8, 9, 15],
          "circle-color": [
            "interpolate",
            ["linear"],
            ["get", "temperature"],
            -10,
            colorScale(-10),
            0,
            colorScale(0),
            5,
            colorScale(5),
            10,
            colorScale(10),
            15,
            colorScale(15),
            20,
            colorScale(20),
            25,
            colorScale(25),
            30,
            colorScale(30),
            35,
            colorScale(35),
            40,
            colorScale(40),
          ],
          "circle-opacity": 0.9,
          "circle-stroke-color": "white",
          "circle-stroke-width": 1,
        },
      });

      // Add labels layer
      map.current.addLayer({
        id: "temperature-labels",
        type: "symbol",
        source: "temperature-points",
        layout: {
          "text-field": [
            "concat",
            ["get", "name"],
            "\n",
            ["to-string", ["round", ["get", "tempDisplay"]]],
            useCelsius ? "°C" : "°F",
            "\n",
            ["get", "description"],
          ],
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-size": 12,
          "text-offset": [0, 1.5],
          "text-anchor": "top",
          "text-max-width": 8,
        },
        paint: {
          "text-color": isDayMode ? "#000000" : "#FFFFFF",
          "text-halo-color": isDayMode ? "#FFFFFF" : "#000000",
          "text-halo-width": 1,
        },
      });

      // Add interactivity
      addInteractivity();
    }
  };

  // Search for a city
  const searchCity = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    try {
      // First search for the city to get coordinates
      const searchResponse = await fetch(
        `${CONFIG.WEATHER_API_URL}/search.json?key=${CONFIG.WEATHER_API_KEY}&q=${searchQuery}`
      );
      if (!searchResponse.ok) throw new Error("City not found");
      const searchData = await searchResponse.json();

      if (searchData.length === 0) throw new Error("City not found");

      const firstResult = searchData[0];
      const lat = firstResult.lat;
      const lon = firstResult.lon;

      // Get current weather for the city
      const weatherResponse = await fetch(
        `${CONFIG.WEATHER_API_URL}/current.json?key=${CONFIG.WEATHER_API_KEY}&q=${lat},${lon}`
      );
      if (!weatherResponse.ok) throw new Error("Weather data not available");
      const weatherData = await weatherResponse.json();

      // Update cities list to include this location
      const newCity = {
        name: weatherData.location.name,
        lat: weatherData.location.lat,
        lon: weatherData.location.lon,
      };

      setCities([newCity]);
      setCurrentLocation(weatherData.location);

      // Fly to the location
      flyToLocation(newCity);

      // Add marker with popup
      const temp = useCelsius
        ? weatherData.current.temp_c
        : weatherData.current.temp_f;
      const popupContent = `
        <div style="color: ${colorScale(weatherData.current.temp_c)}">
          <strong>${weatherData.location.name}</strong><br>
          Temperature: ${Math.round(temp)}${useCelsius ? "°C" : "°F"}<br>
          Condition: ${weatherData.current.condition.text}
          <img src="https:${weatherData.current.condition.icon}" alt="${
        weatherData.current.condition.text
      }">
        </div>
      `;

      if (marker.current) marker.current.remove();
      marker.current = new mapboxgl.Marker()
        .setLngLat([lon, lat])
        .setPopup(new mapboxgl.Popup().setHTML(popupContent))
        .addTo(map.current)
        .togglePopup();

      // Fetch forecast for this location
      await fetchForecastData();
    } catch (error) {
      setError(error.message || "Failed to fetch city data");
    } finally {
      setLoading(false);
    }
  };

  // Fly to a location
  const flyToLocation = (location) => {
    map.current.flyTo({
      center: [location.lon, location.lat],
      zoom: 9,
      essential: true,
      duration: 2000,
      curve: 1.5,
    });
  };

  // Toggle day/night mode
  const toggleDayNightMode = () => {
    setIsDayMode(!isDayMode);
  };

  // Toggle temperature unit
  const toggleTemperatureUnit = () => {
    setUseCelsius(!useCelsius);
  };

  // Toggle play/pause animation
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Show hourly forecast
  const toggleHourlyForecast = () => {
    setShowHourlyForecast(!showHourlyForecast);
  };

  // Toggle saved locations panel
  const toggleSavedLocationsPanel = () => {
    setShowSavedLocations(!showSavedLocations);
  };

  // Save current location
  const saveCurrentLocation = () => {
    if (!currentLocation) return;

    const exists = savedLocations.some(
      (loc) => loc.name === currentLocation.name
    );

    if (!exists) {
      const newLocation = {
        name: currentLocation.name,
        lat: currentLocation.lat,
        lon: currentLocation.lon,
      };

      const updatedLocations = [...savedLocations, newLocation];
      setSavedLocations(updatedLocations);
      localStorage.setItem("savedLocations", JSON.stringify(updatedLocations));
    }
  };

  // Submit feedback
  const submitFeedback = () => {
    if (feedbackForm.name && feedbackForm.email && feedbackForm.message) {
      console.log("Feedback Submitted:", feedbackForm);
      alert("Thank you for your feedback!");
      setFeedbackForm({ name: "", email: "", message: "" });
      setShowFeedbackModal(false);
    } else {
      alert("Please fill out all fields.");
    }
  };

  // Helper functions
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
      dayNumber: date.getDate(),
      fullDate: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    };
  };

  const getTemperatureDescription = (temp) => {
    if (temp < -5) return "Freezing cold ❄️";
    if (temp < 0) return "Very cold 🥶";
    if (temp < 10) return "Cold 🧣";
    if (temp < 15) return "Cool 🍂";
    if (temp < 20) return "Mild 😊";
    if (temp < 25) return "Warm ☀️";
    if (temp < 30) return "Hot 🔥";
    if (temp < 35) return "Very hot 🥵";
    return "Extremely hot ☄️";
  };

  const getTemperatureColor = (temp) => {
    return colorScale(temp);
  };

  const getWeatherIcon = (condition) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes("rain")) {
      if (lowerCondition.includes("thunder"))
        return <FaBolt className="text-yellow-400" />;
      return <FaCloudRain className="text-blue-400" />;
    }
    if (lowerCondition.includes("snow"))
      return <FaSnowflake className="text-blue-200" />;
    if (lowerCondition.includes("sunny") || lowerCondition.includes("clear")) {
      return isDayMode ? (
        <FaSun className="text-yellow-400" />
      ) : (
        <FaCloudMoon className="text-gray-300" />
      );
    }
    if (lowerCondition.includes("cloud")) {
      return isDayMode ? (
        <FaCloudSun className="text-gray-400" />
      ) : (
        <FaCloud className="text-gray-300" />
      );
    }
    if (lowerCondition.includes("shower"))
      return <FaCloudShowersHeavy className="text-blue-300" />;
    return isDayMode ? (
      <WiDaySunny className="text-yellow-400" />
    ) : (
      <FaCloudMoon className="text-gray-300" />
    );
  };

  // Get current weather data for display
  const getCurrentWeatherData = () => {
    if (
      !forecastData ||
      Object.keys(forecastData).length === 0 ||
      !cities ||
      cities.length === 0
    ) {
      return null;
    }

    const firstCity = cities[0].name;
    if (forecastData[firstCity] && forecastData[firstCity][currentDayIndex]) {
      return forecastData[firstCity][currentDayIndex];
    }

    return null;
  };

  const weatherData = getCurrentWeatherData();

  return (
    <div
      className={`relative w-full h-screen transition-colors duration-500 ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      {/* Map container */}
      <div ref={mapContainer} className="absolute w-full h-full" />

      {/* Glass overlay effect */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: `radial-gradient(circle at center, transparent 0%, ${
            isDayMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
          } 100%)`,
        }}
      />

      {/* Hover temperature display */}
      {hoverTemperature && (
        <motion.div
          className="absolute z-50 p-3 bg-opacity-90 rounded-lg shadow-lg pointer-events-none text-center min-w-[120px] backdrop-blur-sm"
          style={{
            left: hoverTemperature.x,
            top: hoverTemperature.y,
            backgroundColor: isDayMode
              ? "rgba(255,255,255,0.9)"
              : "rgba(0,0,0,0.9)",
            color: hoverTemperature.color,
            transform: "translate(-50%, -120%)",
            border: `1px solid ${hoverTemperature.color}`,
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <strong className="block mb-1 text-lg">
            {hoverTemperature.name}
          </strong>
          {hoverTemperature.temp}
          {useCelsius ? "°C" : "°F"}
          <span className="block mt-1 text-sm opacity-90">
            {hoverTemperature.description}
          </span>
        </motion.div>
      )}
      {/* search bar */}

      <motion.div
        className="absolute top-5 left-1/2 transform -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div
          className="relative"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && searchCity()}
            placeholder="Search for a city..."
            className="px-5 py-3 pr-12 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-xl w-80 backdrop-blur-sm bg-white/90 border border-white/20"
          />
          <motion.button
            onClick={searchCity}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full"
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiSearch className="text-lg" />
          </motion.button>

          {/* Animated border effect */}
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6)",
              backgroundSize: "200% 200%",
              zIndex: -1,
              filter: "blur(8px)",
              opacity: 0.7,
            }}
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </motion.div>

        {/* Micro-interaction feedback */}
        <AnimatePresence>
          {searchQuery && (
            <motion.div
              className="absolute top-full left-0 right-0 text-center mt-2 text-sm text-white"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              Press Enter or click search
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Main weather card */}
      {weatherData && (
        <motion.div
          className="absolute top-20 left-5 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-20 overflow-hidden"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            background: isDayMode
              ? "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,248,255,0.9) 100%)"
              : "linear-gradient(135deg, rgba(31,41,55,0.9) 0%, rgba(17,24,39,0.9) 100%)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold dark:text-white">
                  {currentLocation?.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentDayIndex === 0
                    ? "Current Weather"
                    : formatDate(weatherData.date).fullDate}
                </p>
              </div>
              <div className="flex items-center">
                {getWeatherIcon(weatherData.condition)}
                <img
                  src={`https:${weatherData.icon}`}
                  alt={weatherData.condition}
                  className="w-12 h-12 ml-2"
                />
              </div>
            </div>

            <div className="mt-2 flex items-end justify-between">
              <div>
                <div
                  className="text-4xl font-bold"
                  style={{ color: colorScale(weatherData.temp) }}
                >
                  {Math.round(
                    useCelsius ? weatherData.temp : weatherData.temp_f
                  )}
                  {useCelsius ? "°C" : "°F"}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {weatherData.condition}
                </div>
              </div>

              <button
                onClick={() => setExpandedDetails(!expandedDetails)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                {expandedDetails ? <FiChevronUp /> : <FiChevronDown />}
              </button>
            </div>
          </div>

          {/* Expanded details */}
          {expandedDetails && (
            <motion.div
              className="px-4 pb-4 grid grid-cols-2 gap-3 text-sm"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center">
                <FaTemperatureHigh className="mr-2 text-blue-500" />
                <span className="text-gray-600 dark:text-gray-300">
                  Feels Like:
                </span>
                <span className="ml-auto font-medium">
                  {Math.round(
                    useCelsius ? weatherData.feelslike : weatherData.feelslike_f
                  )}
                  {useCelsius ? "°C" : "°F"}
                </span>
              </div>

              <div className="flex items-center">
                <BsDropletHalf className="mr-2 text-blue-500" />
                <span className="text-gray-600 dark:text-gray-300">
                  Humidity:
                </span>
                <span className="ml-auto font-medium">
                  {weatherData.humidity}%
                </span>
              </div>

              <div className="flex items-center">
                <BsWind className="mr-2 text-blue-500" />
                <span className="text-gray-600 dark:text-gray-300">Wind:</span>
                <span className="ml-auto font-medium">
                  {weatherData.wind_kph} kph {weatherData.wind_dir}
                </span>
              </div>

              <div className="flex items-center">
                <FaSun className="mr-2 text-yellow-500" />
                <span className="text-gray-600 dark:text-gray-300">
                  UV Index:
                </span>
                <span className="ml-auto font-medium">{weatherData.uv}</span>
              </div>

              <div className="flex items-center">
                <FaEye className="mr-2 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-300">
                  Visibility:
                </span>
                <span className="ml-auto font-medium">
                  {weatherData.vis_km} km
                </span>
              </div>

              <div className="flex items-center">
                <WiBarometer className="mr-2 text-purple-500 text-xl" />
                <span className="text-gray-600 dark:text-gray-300">
                  Pressure:
                </span>
                <span className="ml-auto font-medium">
                  {weatherData.pressure_mb} mb
                </span>
              </div>

              <div className="flex items-center">
                <RiContrastDropLine className="mr-2 text-blue-300" />
                <span className="text-gray-600 dark:text-gray-300">
                  Precipitation:
                </span>
                <span className="ml-auto font-medium">
                  {weatherData.precip_mm} mm
                </span>
              </div>

              <div className="flex items-center">
                <FiInfo className="mr-2 text-blue-400" />
                <span className="text-gray-600 dark:text-gray-300">AQI:</span>
                <span className="ml-auto font-medium">
                  {weatherData.aqi || "N/A"}
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Legend */}
      {showLegend && (
        <motion.div
          className="absolute bottom-32 left-5 bg-white dark:bg-gray-800 rounded-xl shadow-lg z-20 p-3 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          style={{
            backdropFilter: "blur(10px)",
            backgroundColor: isDayMode
              ? "rgba(255,255,255,0.8)"
              : "rgba(31,41,55,0.8)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="flex justify-between items-center mb-1">
            <div className="font-medium dark:text-white">
              Temperature ({useCelsius ? "°C" : "°F"})
            </div>
            <button
              onClick={() => setShowLegend(false)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <FiX size={16} />
            </button>
          </div>
          <div
            className="w-40 h-2 rounded-full mb-1"
            style={{
              background: `linear-gradient(to right, ${[-10, 0, 10, 20, 30, 40]
                .map((t) => colorScale(t))
                .join(", ")})`,
            }}
          />
          <div className="flex justify-between text-[10px] dark:text-gray-300">
            <span>{CONFIG.TEMP_MIN}</span>
            <span>0</span>
            <span>10</span>
            <span>20</span>
            <span>30</span>
            <span>{CONFIG.TEMP_MAX}</span>
          </div>
        </motion.div>
      )}

      {/* Controls */}
      <motion.div
        className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 bg-opacity-90 p-3 rounded-lg z-20 flex items-center space-x-3 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        style={{
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <span className="text-sm dark:text-white">Forecast Day:</span>
        <input
          type="range"
          min="0"
          max="3"
          value={currentDayIndex}
          onChange={(e) => setCurrentDayIndex(parseInt(e.target.value))}
          className="w-32"
        />
        <span className="text-sm w-12 dark:text-white">
          {currentDayIndex === 0
            ? "Now"
            : currentDayIndex === 1
            ? "Tomorrow"
            : `${currentDayIndex} days`}
        </span>
        <motion.button
          onClick={togglePlayPause}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isPlaying ? "⏸️" : "▶️"}
        </motion.button>
      </motion.div>

      {/* Timeline */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 bg-opacity-90 p-2 z-20 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        style={{
          backdropFilter: "blur(10px)",
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div className="flex justify-center space-x-4 overflow-x-auto py-1">
          {/* Now */}
          <motion.div
            className={`flex flex-col items-center px-3 py-1 rounded-lg cursor-pointer transition-colors ${
              currentDayIndex === 0
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
            whileHover={{ scale: 1.05 }}
            onClick={() => setCurrentDayIndex(0)}
          >
            <div className="font-bold">NOW</div>
          </motion.div>

          {/* Forecast days continued */}
          {weatherData &&
            forecastData[cities[0]?.name]?.slice(1).map((day, index) => {
              const date = formatDate(day.date);
              return (
                <motion.div
                  key={day.date}
                  className={`flex flex-col items-center px-3 py-1 rounded-lg cursor-pointer transition-colors ${
                    currentDayIndex === index + 1
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setCurrentDayIndex(index + 1)}
                >
                  <div className="font-bold">{date.dayName}</div>
                  <div className="text-xs">{date.dayNumber}</div>
                </motion.div>
              );
            })}
        </div>
      </motion.div>

      {/* Action buttons */}
      <div className="absolute right-5 top-20 space-y-3 z-20">
        {/* Theme toggle */}
        <motion.button
          onClick={toggleDayNightMode}
          className={`p-3 rounded-full shadow-lg flex items-center justify-center ${
            isDayMode
              ? "bg-yellow-400 text-yellow-800"
              : "bg-indigo-600 text-white"
          }`}
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.5 }}
        >
          {isDayMode ? <FiSun size={20} /> : <FiMoon size={20} />}
        </motion.button>

        {/* Unit toggle */}
        <motion.button
          onClick={toggleTemperatureUnit}
          className={`p-3 rounded-full shadow-lg flex items-center justify-center ${
            theme === "dark"
              ? "bg-gray-700 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.7 }}
        >
          {useCelsius ? "°C" : "°F"}
        </motion.button>

        {/* Legend toggle */}
        <motion.button
          onClick={() => setShowLegend(!showLegend)}
          className={`p-3 rounded-full shadow-lg flex items-center justify-center ${
            theme === "dark"
              ? "bg-gray-700 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.9 }}
        >
          <FiInfo size={20} />
        </motion.button>

        {/* Saved locations */}
        <motion.button
          onClick={toggleSavedLocationsPanel}
          className={`p-3 rounded-full shadow-lg flex items-center justify-center ${
            theme === "dark"
              ? "bg-gray-700 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 2.1 }}
        >
          <FiBookmark size={20} />
        </motion.button>

        {/* Hourly forecast */}
        <motion.button
          onClick={toggleHourlyForecast}
          className={`p-3 rounded-full shadow-lg flex items-center justify-center ${
            theme === "dark"
              ? "bg-gray-700 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 2.3 }}
        >
          <FiClock size={20} />
        </motion.button>

        {/* Feedback */}
        <motion.button
          onClick={() => setShowFeedbackModal(true)}
          className={`p-3 rounded-full shadow-lg flex items-center justify-center ${
            theme === "dark"
              ? "bg-gray-700 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 2.5 }}
        >
          <FiSend size={20} />
        </motion.button>
      </div>

      {/* Saved locations panel */}
      <AnimatePresence>
        {showSavedLocations && (
          <motion.div
            className="absolute top-32 right-5 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-20 max-h-80 w-64 overflow-hidden"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ type: "spring", damping: 25 }}
            style={{
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div className="p-3 border-b dark:border-gray-700">
              <h3 className="font-bold flex items-center dark:text-white">
                <FiBookmark className="mr-2" /> Saved Locations
              </h3>
            </div>

            <div className="overflow-y-auto max-h-60">
              {savedLocations.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No saved locations
                </div>
              ) : (
                savedLocations.map((location) => (
                  <motion.div
                    key={`${location.lat}-${location.lon}`}
                    className="p-3 border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                    whileHover={{ x: 5 }}
                    onClick={() => {
                      flyToLocation(location);
                      setShowSavedLocations(false);
                    }}
                  >
                    <FiMapPin className="mr-2 text-blue-500" />
                    <span className="dark:text-white">{location.name}</span>
                  </motion.div>
                ))
              )}
            </div>

            <button
              onClick={saveCurrentLocation}
              className="w-full p-3 bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors"
            >
              <FiBookmark className="mr-2" /> Save Current Location
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hourly forecast panel */}
      <AnimatePresence>
        {showHourlyForecast && hourlyForecast && (
          <motion.div
            className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-20 p-3 max-w-full overflow-x-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div className="flex space-x-4">
              {hourlyForecast
                .slice(new Date().getHours(), new Date().getHours() + 12)
                .map((hour) => (
                  <motion.div
                    key={hour.time}
                    className="flex flex-col items-center px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="font-bold text-sm dark:text-white">
                      {new Date(hour.time).getHours()}:00
                    </div>
                    <img
                      src={`https:${hour.condition.icon}`}
                      alt={hour.condition.text}
                      className="w-10 h-10 my-1"
                    />
                    <div className="font-semibold dark:text-white">
                      {Math.round(useCelsius ? hour.temp_c : hour.temp_f)}
                      {useCelsius ? "°C" : "°F"}
                    </div>
                    <div className="text-xs text-blue-500">
                      {hour.chance_of_rain}%
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weather alert */}
      <AnimatePresence>
        {weatherAlert && (
          <motion.div
            className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-20 max-w-md text-center flex items-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <FiAlertTriangle className="mr-2" />
            <span>{weatherAlert}</span>
            <button onClick={() => setWeatherAlert(null)} className="ml-3">
              <FiX />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback modal */}
      <AnimatePresence>
        {showFeedbackModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <FiX size={24} />
              </button>

              <h2 className="text-2xl font-bold mb-4 dark:text-white">
                Send Feedback
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                We value your feedback to improve the application experience.
              </p>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={feedbackForm.name}
                  onChange={(e) =>
                    setFeedbackForm({ ...feedbackForm, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />

                <input
                  type="email"
                  placeholder="Your Email"
                  value={feedbackForm.email}
                  onChange={(e) =>
                    setFeedbackForm({ ...feedbackForm, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />

                <textarea
                  placeholder="Your Message"
                  value={feedbackForm.message}
                  onChange={(e) =>
                    setFeedbackForm({
                      ...feedbackForm,
                      message: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitFeedback}
                  className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors flex items-center"
                >
                  <FiSend className="mr-2" /> Submit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading indicator */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl text-center"
              initial={{ scale: 0.8 }}
              animate={{
                scale: 1,
                transition: {
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 0.8,
                },
              }}
            >
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold dark:text-white">
                Loading weather data...
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Please wait
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TemperatureMap;
