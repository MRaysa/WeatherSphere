import React, { useState, useEffect } from "react";
import {
  WiDaySunny,
  WiRain,
  WiCloudy,
  WiSnow,
  WiThunderstorm,
  WiHumidity,
  WiStrongWind,
  WiBarometer,
  WiSunrise,
  WiSunset,
  WiFog,
} from "react-icons/wi";
import {
  FaSearch,
  FaTemperatureLow,
  FaTint,
  FaWind,
  FaEye,
  FaUmbrella,
  FaSun,
  FaCloudRain,
  FaArrowUp,
  FaArrowDown,
  FaChevronDown,
  FaStar,
  FaCalendarAlt,
  FaClock,
  FaArrowRight,
  FaMoon,
  FaSun as FaSunSolid,
} from "react-icons/fa";
import { IoMdThermometer } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";

const HomePage = () => {
  const { theme, toggleTheme } = useTheme();
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [city, setCity] = useState("Dhaka");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchExpanded, setSearchExpanded] = useState(false);

  // API Configuration
  const API_KEY = "1dec1896e77e4da5b0c195326251603";
  const BASE_URL = "https://api.weatherapi.com/v1";

  // Weather Icon Mapping with theme variants
  const weatherIcons = {
    1000: {
      icon: <WiDaySunny className="text-yellow-400" size={80} />,
      bg:
        theme === "dark"
          ? "from-gray-900 to-gray-800"
          : "from-yellow-100 to-yellow-50",
    },
    1003: {
      icon: <WiDaySunny className="text-yellow-300" size={80} />,
      bg:
        theme === "dark"
          ? "from-gray-800 to-gray-700"
          : "from-blue-50 to-cyan-50",
    },
    1006: {
      icon: <WiCloudy className="text-gray-400" size={80} />,
      bg:
        theme === "dark"
          ? "from-gray-800 to-gray-700"
          : "from-gray-100 to-gray-50",
    },
    1009: {
      icon: <WiCloudy className="text-gray-500" size={80} />,
      bg:
        theme === "dark"
          ? "from-gray-700 to-gray-600"
          : "from-gray-200 to-gray-100",
    },
    1030: {
      icon: <WiFog className="text-gray-300" size={80} />,
      bg:
        theme === "dark"
          ? "from-gray-700 to-gray-600"
          : "from-gray-100 to-gray-50",
    },
    1063: {
      icon: <WiRain className="text-blue-400" size={80} />,
      bg:
        theme === "dark"
          ? "from-blue-900 to-blue-800"
          : "from-blue-50 to-cyan-50",
    },
    1066: {
      icon: <WiSnow className="text-cyan-200" size={80} />,
      bg:
        theme === "dark"
          ? "from-cyan-900 to-blue-900"
          : "from-cyan-50 to-blue-50",
    },
    1069: {
      icon: <WiSnow className="text-cyan-300" size={80} />,
      bg:
        theme === "dark"
          ? "from-cyan-800 to-blue-800"
          : "from-cyan-100 to-blue-100",
    },
    1087: {
      icon: <WiThunderstorm className="text-purple-500" size={80} />,
      bg:
        theme === "dark"
          ? "from-purple-900 to-indigo-900"
          : "from-purple-100 to-indigo-100",
    },
    1135: {
      icon: <WiFog className="text-gray-400" size={80} />,
      bg:
        theme === "dark"
          ? "from-gray-700 to-gray-600"
          : "from-gray-100 to-gray-50",
    },
    1183: {
      icon: <WiRain className="text-blue-400" size={80} />,
      bg:
        theme === "dark"
          ? "from-blue-900 to-blue-800"
          : "from-blue-50 to-cyan-50",
    },
    1189: {
      icon: <WiRain className="text-blue-500" size={80} />,
      bg:
        theme === "dark"
          ? "from-blue-800 to-blue-700"
          : "from-blue-100 to-cyan-100",
    },
    1195: {
      icon: <WiRain className="text-blue-600" size={80} />,
      bg:
        theme === "dark"
          ? "from-blue-700 to-blue-600"
          : "from-blue-200 to-cyan-200",
    },
    1213: {
      icon: <WiSnow className="text-cyan-200" size={80} />,
      bg:
        theme === "dark"
          ? "from-cyan-900 to-blue-900"
          : "from-cyan-50 to-blue-50",
    },
    1219: {
      icon: <WiSnow className="text-cyan-300" size={80} />,
      bg:
        theme === "dark"
          ? "from-cyan-800 to-blue-800"
          : "from-cyan-100 to-blue-100",
    },
    1225: {
      icon: <WiSnow className="text-cyan-400" size={80} />,
      bg:
        theme === "dark"
          ? "from-cyan-700 to-blue-700"
          : "from-cyan-200 to-blue-200",
    },
    1240: {
      icon: <WiRain className="text-blue-400" size={80} />,
      bg:
        theme === "dark"
          ? "from-blue-900 to-blue-800"
          : "from-blue-50 to-cyan-50",
    },
    1273: {
      icon: <WiThunderstorm className="text-purple-500" size={80} />,
      bg:
        theme === "dark"
          ? "from-purple-900 to-indigo-900"
          : "from-purple-100 to-indigo-100",
    },
    1276: {
      icon: <WiThunderstorm className="text-purple-600" size={80} />,
      bg:
        theme === "dark"
          ? "from-purple-800 to-indigo-800"
          : "from-purple-200 to-indigo-200",
    },
  };

  // Update current date and time
  const updateDateTime = () => {
    const now = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    setCurrentDateTime(now.toLocaleDateString("en-US", options));
  };

  // Get appropriate weather color based on theme
  const getWeatherColor = (condition) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes("sun") || lowerCondition.includes("clear"))
      return theme === "dark" ? "text-yellow-300" : "text-yellow-400";
    if (lowerCondition.includes("cloud"))
      return theme === "dark" ? "text-gray-300" : "text-gray-400";
    if (lowerCondition.includes("rain") || lowerCondition.includes("shower"))
      return theme === "dark" ? "text-blue-300" : "text-blue-400";
    if (lowerCondition.includes("thunder") || lowerCondition.includes("storm"))
      return theme === "dark" ? "text-purple-300" : "text-purple-400";
    if (lowerCondition.includes("snow") || lowerCondition.includes("sleet"))
      return theme === "dark" ? "text-cyan-200" : "text-cyan-200";
    if (lowerCondition.includes("fog") || lowerCondition.includes("mist"))
      return theme === "dark" ? "text-gray-400" : "text-gray-300";
    return theme === "dark" ? "text-cyan-300" : "text-cyan-400";
  };

  // Get UV Index level
  const getUVIndexLevel = (uv) => {
    if (uv <= 2) return "Low";
    if (uv <= 5) return "Moderate";
    if (uv <= 7) return "High";
    if (uv <= 10) return "Very High";
    return "Extreme";
  };

  // Fetch Weather Data
  const fetchWeatherData = async (city) => {
    try {
      setLoading(true);
      setError(null);

      // Add to recent searches
      setRecentSearches((prev) => {
        const newSearches = [
          city,
          ...prev.filter((item) => item !== city),
        ].slice(0, 5);
        return newSearches;
      });

      // Fetch current weather and forecast
      const [currentResponse, forecastResponse] = await Promise.all([
        fetch(`${BASE_URL}/current.json?key=${API_KEY}&q=${city}`),
        fetch(`${BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=3`),
      ]);

      if (!currentResponse.ok || !forecastResponse.ok) {
        throw new Error("Failed to fetch weather data");
      }

      const currentData = await currentResponse.json();
      const forecastData = await forecastResponse.json();

      setWeatherData({
        current: currentData,
        forecast: forecastData,
      });
      updateDateTime();
    } catch (err) {
      console.error("Error fetching weather data:", err);
      setError("Error loading weather data. Please try another location.");
    } finally {
      setLoading(false);
    }
  };

  // Handle city search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCity(searchQuery.trim());
      fetchWeatherData(searchQuery.trim());
      setSearchQuery("");
      setIsSearchFocused(false);
      setSearchExpanded(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchWeatherData(city);
    const timer = setInterval(updateDateTime, 60000);
    return () => clearInterval(timer);
  }, [city]);

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === "dark"
            ? "bg-gray-900"
            : "bg-gradient-to-br from-blue-50 to-cyan-50"
        }`}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`text-2xl ${
            theme === "dark"
              ? "text-white"
              : "bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent"
          } flex flex-col items-center`}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className={`w-16 h-16 border-4 ${
              theme === "dark" ? "border-white" : "border-blue-500"
            } border-t-transparent rounded-full mb-4`}
          />
          Loading weather data...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center ${
          theme === "dark"
            ? "bg-gray-900"
            : "bg-gradient-to-br from-blue-50 to-cyan-50"
        } p-4`}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-2xl ${
            theme === "dark" ? "text-red-400" : "text-red-500"
          } mb-6 flex items-center`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          {error}
        </motion.div>
        <motion.form
          onSubmit={handleSearch}
          className="relative w-full max-w-md"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                setIsSearchFocused(true);
                setSearchExpanded(true);
              }}
              onBlur={() =>
                setTimeout(() => {
                  setIsSearchFocused(false);
                  setSearchExpanded(false);
                }, 200)
              }
              placeholder="Search Location"
              className={`w-full px-6 py-4 rounded-full shadow-lg focus:outline-none focus:ring-2 ${
                theme === "dark"
                  ? "bg-gray-700 text-white focus:ring-cyan-400 placeholder-gray-400"
                  : "bg-white focus:ring-cyan-400"
              } pr-16 transition-all duration-300`}
            />
            <button
              type="submit"
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${
                theme === "dark"
                  ? "bg-cyan-600 hover:bg-cyan-700"
                  : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              } text-white p-3 rounded-full hover:shadow-md transition-all duration-300 hover:scale-110`}
            >
              <FaSearch className="text-lg" />
            </button>
          </div>

          {isSearchFocused && recentSearches.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`absolute top-full left-0 right-0 mt-2 ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              } rounded-xl shadow-xl overflow-hidden z-50`}
            >
              <div className="py-2">
                <div
                  className={`px-4 py-2 text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  } font-medium`}
                >
                  Recent Searches
                </div>
                {recentSearches.map((search, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ x: 5 }}
                    className={`px-4 py-3 ${
                      theme === "dark"
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-50"
                    } cursor-pointer flex items-center`}
                    onClick={() => {
                      setCity(search);
                      fetchWeatherData(search);
                      setIsSearchFocused(false);
                      setSearchExpanded(false);
                    }}
                  >
                    <FaSearch
                      className={`${
                        theme === "dark" ? "text-gray-500" : "text-gray-400"
                      } mr-3`}
                    />
                    <span className={theme === "dark" ? "text-white" : ""}>
                      {search}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.form>
      </div>
    );
  }

  // Get next 12 hours forecast
  const getHourlyForecast = () => {
    const todayHours =
      weatherData?.forecast?.forecast?.forecastday[0]?.hour || [];
    const tomorrowHours =
      weatherData?.forecast?.forecast?.forecastday[1]?.hour || [];
    const now = new Date();
    const currentHour = now.getHours();

    // Combine remaining hours today with hours from tomorrow if needed
    const remainingHoursToday = todayHours.slice(currentHour);
    const neededFromTomorrow = 12 - remainingHoursToday.length;

    return [
      ...remainingHoursToday,
      ...(neededFromTomorrow > 0
        ? tomorrowHours.slice(0, neededFromTomorrow)
        : []),
    ].slice(0, 12);
  };

  // Get current weather background gradient
  const currentWeatherCode = weatherData?.current?.current?.condition?.code;
  const currentWeatherBg = currentWeatherCode
    ? weatherIcons[currentWeatherCode]?.bg
    : theme === "dark"
    ? "from-gray-800 to-gray-700"
    : "from-blue-50 to-cyan-50";

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${currentWeatherBg} transition-all duration-1000 ${
        theme === "dark" ? "text-gray-100" : "text-gray-800"
      }`}
    >
      {/* Animated Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${
              theme === "dark" ? "bg-white/5" : "bg-white/10"
            }`}
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              opacity: 0.1,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Creative Search Bar */}

      <motion.div
        className={`flex justify-center items-center mx-auto pt-6 ${
          searchExpanded ? "w-full max-w-2xl" : "w-64"
        } transition-all duration-300`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.form
          onSubmit={handleSearch}
          className="relative"
          whileHover={!searchExpanded ? { scale: 1.05 } : {}}
        >
          <motion.div
            className={`flex items-center rounded-full shadow-lg overflow-hidden ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
            animate={{
              width: searchExpanded ? "100%" : "100%",
            }}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                setIsSearchFocused(true);
                setSearchExpanded(true);
              }}
              onBlur={() =>
                setTimeout(() => {
                  setIsSearchFocused(false);
                  if (!searchQuery.trim()) setSearchExpanded(false);
                }, 200)
              }
              placeholder={
                searchExpanded ? "Search for a city..." : "Search..."
              }
              className={`flex-grow px-6 py-4 focus:outline-none ${
                theme === "dark"
                  ? "bg-gray-800 text-white placeholder-gray-400"
                  : "bg-white text-gray-800"
              }`}
            />
            <button
              type="submit"
              className={`p-4 ${
                theme === "dark"
                  ? "bg-cyan-600 hover:bg-cyan-700"
                  : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              } text-white transition-all duration-300`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaSearch className="text-lg" />
            </button>
          </motion.div>

          {isSearchFocused && recentSearches.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`absolute top-full left-0 right-0 mt-2 ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              } rounded-xl shadow-xl overflow-hidden z-50`}
            >
              <div className="py-2">
                <div
                  className={`px-4 py-2 text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  } font-medium`}
                >
                  Recent Searches
                </div>
                {recentSearches.map((search, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ x: 5 }}
                    className={`px-4 py-3 ${
                      theme === "dark"
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-50"
                    } cursor-pointer flex items-center`}
                    onClick={() => {
                      setCity(search);
                      fetchWeatherData(search);
                      setIsSearchFocused(false);
                      setSearchExpanded(false);
                    }}
                  >
                    <FaSearch
                      className={`${
                        theme === "dark" ? "text-gray-500" : "text-gray-400"
                      } mr-3`}
                    />
                    <span className={theme === "dark" ? "text-white" : ""}>
                      {search}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.form>
      </motion.div>
      {/* Main Content */}
      <main className="pt-28 pb-12 px-4 md:px-20">
        <div className="container mx-auto">
          {/* Dashboard Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1
              className={`text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 bg-clip-text text-transparent`}
            >
              Weather in {weatherData?.current?.location?.name},{" "}
              {weatherData?.current?.location?.country}
            </h1>
            <p
              className={`text-lg ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {currentDateTime}
            </p>
          </motion.div>

          {/* Weather Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Current Weather Card */}
            <motion.div
              className={`p-6 rounded-2xl shadow-xl backdrop-blur-sm col-span-1 lg:col-span-2 ${
                theme === "dark" ? "bg-gray-800/80" : "bg-white/90"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex justify-between items-start mb-6">
                <h2
                  className={`text-2xl font-semibold ${
                    theme === "dark" ? "text-white" : "text-gray-700"
                  } flex items-center`}
                >
                  <WiDaySunny className="mr-3 text-cyan-500" size={28} />
                  Current Weather
                </h2>
                <div
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Last updated: {weatherData?.current?.current?.last_updated}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Weather Icon and Temp */}
                <div className="flex flex-col items-center justify-center">
                  <motion.div
                    className="relative w-40 h-40"
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <div className="animate-float">
                      {currentWeatherCode &&
                        weatherIcons[currentWeatherCode]?.icon}
                    </div>
                    <motion.div
                      className={`absolute bottom-0 right-0 rounded-full px-3 py-1 shadow-md text-sm font-semibold ${getWeatherColor(
                        weatherData?.current?.current?.condition?.text
                      )
                        .replace("text-", "bg-")
                        .replace(
                          /-[0-9]+/,
                          theme === "dark" ? "-700" : "-100"
                        )} ${getWeatherColor(
                        weatherData?.current?.current?.condition?.text
                      )
                        .replace("text-", "text-")
                        .replace(
                          /-[0-9]+/,
                          theme === "dark" ? "-100" : "-800"
                        )}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      {weatherData?.current?.current?.condition?.text}
                    </motion.div>
                  </motion.div>
                  <div className="text-center mt-4">
                    <motion.div
                      className="text-6xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {weatherData?.current?.current?.temp_c}°C
                    </motion.div>
                    <div
                      className={
                        theme === "dark"
                          ? "text-gray-400"
                          : "text-gray-500 mt-2"
                      }
                    >
                      Feels like {weatherData?.current?.current?.feelslike_c}°C
                    </div>
                  </div>
                </div>

                {/* Weather Details */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      icon: <IoMdThermometer className="mr-2" />,
                      label: "Feels Like",
                      value: `${weatherData?.current?.current?.feelslike_c}°C`,
                      color: "text-cyan-600",
                    },
                    {
                      icon: <WiHumidity className="mr-2" size={20} />,
                      label: "Humidity",
                      value: `${weatherData?.current?.current?.humidity}%`,
                      color: "text-blue-600",
                    },
                    {
                      icon: <WiStrongWind className="mr-2" size={20} />,
                      label: "Wind",
                      value: `${weatherData?.current?.current?.wind_kph} km/h`,
                      sub: weatherData?.current?.current?.wind_dir,
                      color: "text-teal-600",
                    },
                    {
                      icon: <FaEye className="mr-2" />,
                      label: "Visibility",
                      value: `${weatherData?.current?.current?.vis_km} km`,
                      color: "text-purple-600",
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className={`p-4 rounded-lg shadow-sm transition hover:shadow-md ${
                        theme === "dark"
                          ? "bg-gray-700/50 hover:bg-gray-700"
                          : "bg-white"
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ y: -5 }}
                    >
                      <div className={`${item.color} mb-1 flex items-center`}>
                        {item.icon} {item.label}
                      </div>
                      <div
                        className={`text-2xl font-semibold ${
                          theme === "dark" ? "text-white" : ""
                        }`}
                      >
                        {item.value}
                      </div>
                      {item.sub && (
                        <div
                          className={`text-sm ${
                            theme === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {item.sub}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Weather Highlights */}
            <motion.div
              className={`p-6 rounded-2xl shadow-xl backdrop-blur-sm ${
                theme === "dark" ? "bg-gray-800/80" : "bg-white/90"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2
                className={`text-2xl font-semibold ${
                  theme === "dark" ? "text-white" : "text-gray-700"
                } mb-6 flex items-center`}
              >
                <FaStar className="mr-3 text-yellow-400" />
                Weather Highlights
              </h2>

              <div className="space-y-5">
                {[
                  {
                    icon: <FaUmbrella className="mr-2" />,
                    label: "Precipitation",
                    value: `${weatherData?.current?.current?.precip_mm} mm`,
                    sub: "Last hour",
                    color:
                      theme === "dark"
                        ? "from-purple-900/50 to-purple-800/50"
                        : "from-purple-50 to-purple-100",
                    textColor: "text-purple-600",
                  },
                  {
                    icon: <FaSun className="mr-2" />,
                    label: "UV Index",
                    value: weatherData?.current?.current?.uv,
                    sub: getUVIndexLevel(weatherData?.current?.current?.uv),
                    color:
                      theme === "dark"
                        ? "from-yellow-900/50 to-yellow-800/50"
                        : "from-yellow-50 to-yellow-100",
                    textColor: "text-yellow-600",
                  },
                  {
                    icon: <WiBarometer className="mr-2" size={20} />,
                    label: "Pressure",
                    value: `${weatherData?.current?.current?.pressure_mb} mb`,
                    sub: `${weatherData?.current?.current?.pressure_in} in`,
                    color:
                      theme === "dark"
                        ? "from-blue-900/50 to-blue-800/50"
                        : "from-blue-50 to-blue-100",
                    textColor: "text-blue-600",
                  },
                  {
                    icon: <WiStrongWind className="mr-2" size={20} />,
                    label: "Wind Gusts",
                    value: `${weatherData?.current?.current?.gust_kph} km/h`,
                    sub: `Direction: ${weatherData?.current?.current?.wind_dir}`,
                    color:
                      theme === "dark"
                        ? "from-green-900/50 to-green-800/50"
                        : "from-green-50 to-green-100",
                    textColor: "text-green-600",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className={`relative overflow-hidden bg-gradient-to-br ${item.color} p-4 rounded-lg shadow-sm`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className={`flex items-center ${item.textColor} mb-2`}>
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    <div
                      className={`text-3xl font-bold ${
                        theme === "dark" ? "text-white" : ""
                      }`}
                    >
                      {item.value}
                    </div>
                    <div
                      className={`text-sm ${
                        theme === "dark" ? "text-gray-300" : ""
                      }`}
                    >
                      {item.sub}
                    </div>
                    <motion.div
                      className="absolute -bottom-4 -right-4 opacity-10"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                    >
                      {item.icon}
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* 3-Day Forecast */}
            <motion.div
              className={`p-6 rounded-2xl shadow-xl backdrop-blur-sm col-span-1 lg:col-span-3 ${
                theme === "dark" ? "bg-gray-800/80" : "bg-white/90"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h2
                className={`text-2xl font-semibold ${
                  theme === "dark" ? "text-white" : "text-gray-700"
                } mb-6 flex items-center`}
              >
                <FaCalendarAlt className="mr-3 text-teal-400" />
                3-Day Forecast
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {weatherData?.forecast?.forecast?.forecastday?.map(
                  (day, index) => {
                    const date = new Date(day.date);
                    const dayName = date.toLocaleDateString("en-US", {
                      weekday: "short",
                    });
                    const weatherColor = getWeatherColor(
                      day.day.condition.text
                    );

                    return (
                      <motion.div
                        key={index}
                        className={`p-4 rounded-lg shadow-sm text-center ${
                          theme === "dark"
                            ? "bg-gray-700/50 hover:bg-gray-700"
                            : "bg-white hover:bg-gray-50"
                        }`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        whileHover={{ y: -5 }}
                      >
                        <div
                          className={`font-semibold ${
                            theme === "dark" ? "text-white" : "text-gray-700"
                          } mb-2`}
                        >
                          {dayName}
                        </div>
                        <motion.div
                          className={`text-4xl mb-2 ${weatherColor}`}
                          animate={{
                            rotate: [0, 5, -5, 0],
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            repeatType: "reverse",
                          }}
                        >
                          {weatherIcons[day.day.condition.code]?.icon}
                        </motion.div>
                        <div
                          className={`text-2xl font-bold ${
                            theme === "dark" ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {day.day.avgtemp_c}°C
                        </div>
                        <div className={`text-sm ${weatherColor} mt-1`}>
                          {day.day.condition.text}
                        </div>
                        <div
                          className={`flex justify-between text-xs mt-3 ${
                            theme === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          <span>
                            <FaArrowUp className="inline mr-1" />
                            {day.day.maxtemp_c}°
                          </span>
                          <span>
                            <FaArrowDown className="inline mr-1" />
                            {day.day.mintemp_c}°
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                          <div
                            className={`p-1 rounded ${
                              theme === "dark"
                                ? "bg-gray-600/50"
                                : "bg-gray-100"
                            }`}
                          >
                            <WiHumidity size={16} className="inline mr-1" />
                            {day.day.avghumidity}%
                          </div>
                          <div
                            className={`p-1 rounded ${
                              theme === "dark"
                                ? "bg-gray-600/50"
                                : "bg-gray-100"
                            }`}
                          >
                            <FaCloudRain className="inline mr-1" />
                            {day.day.daily_chance_of_rain}%
                          </div>
                          <div
                            className={`p-1 rounded ${
                              theme === "dark"
                                ? "bg-gray-600/50"
                                : "bg-gray-100"
                            }`}
                          >
                            <FaWind className="inline mr-1" />
                            {day.day.maxwind_kph} km/h
                          </div>
                          <div
                            className={`p-1 rounded ${
                              theme === "dark"
                                ? "bg-gray-600/50"
                                : "bg-gray-100"
                            }`}
                          >
                            <FaSun className="inline mr-1" />
                            {day.day.uv}
                          </div>
                        </div>
                      </motion.div>
                    );
                  }
                )}
              </div>
            </motion.div>

            {/* Hourly Forecast */}
            <motion.div
              className={`p-6 rounded-2xl shadow-xl backdrop-blur-sm col-span-1 lg:col-span-3 ${
                theme === "dark" ? "bg-gray-800/80" : "bg-white/90"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h2
                className={`text-2xl font-semibold ${
                  theme === "dark" ? "text-white" : "text-gray-700"
                } mb-6 flex items-center`}
              >
                <FaClock className="mr-3 text-cyan-400" />
                Hourly Forecast
              </h2>

              <div className="overflow-x-auto pb-4">
                <div className="flex space-x-4 min-w-max">
                  {getHourlyForecast().map((hour, index) => {
                    const time = new Date(hour.time);
                    const hourString = time.getHours();
                    const isCurrentHour = new Date().getHours() === hourString;
                    const weatherColor = getWeatherColor(hour.condition.text);

                    return (
                      <motion.div
                        key={index}
                        className={`flex flex-col items-center p-4 rounded-lg min-w-[100px] ${
                          isCurrentHour
                            ? theme === "dark"
                              ? "bg-cyan-800/50"
                              : "bg-cyan-100"
                            : theme === "dark"
                            ? "bg-gray-700/50"
                            : "bg-gray-100"
                        }`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <div
                          className={`font-medium ${
                            theme === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {hourString}:00
                        </div>
                        <div className={`my-2 ${weatherColor}`}>
                          {weatherIcons[hour.condition.code]?.icon || (
                            <WiDaySunny size={40} />
                          )}
                        </div>
                        <div
                          className={`text-xl font-bold ${
                            theme === "dark" ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {hour.temp_c}°C
                        </div>
                        <div
                          className={`text-xs mt-1 ${
                            theme === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {hour.condition.text}
                        </div>
                        <div className="flex items-center text-xs mt-2">
                          <FaTint className="mr-1 text-blue-400" />
                          {hour.humidity}%
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Sunrise & Sunset */}
            <motion.div
              className={`p-6 rounded-2xl shadow-xl backdrop-blur-sm col-span-1 ${
                theme === "dark" ? "bg-gray-800/80" : "bg-white/90"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <h2
                className={`text-2xl font-semibold ${
                  theme === "dark" ? "text-white" : "text-gray-700"
                } mb-6 flex items-center`}
              >
                <FaSunSolid className="mr-3 text-orange-400" />
                Sun Times
              </h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <WiSunrise className="text-yellow-500" size={40} />
                    <div className="ml-3">
                      <div
                        className={`text-sm ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Sunrise
                      </div>
                      <div
                        className={`text-xl font-bold ${
                          theme === "dark" ? "text-white" : ""
                        }`}
                      >
                        {
                          weatherData?.forecast?.forecast?.forecastday[0]?.astro
                            ?.sunrise
                        }
                      </div>
                    </div>
                  </div>
                  <div
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Dawn:{" "}
                    {
                      weatherData?.forecast?.forecast?.forecastday[0]?.astro
                        ?.dawn
                    }
                  </div>
                </div>

                <div className="relative h-2 rounded-full bg-gradient-to-r from-yellow-500 via-orange-500 to-purple-900 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      className="h-4 w-4 bg-white rounded-full shadow-md"
                      animate={{
                        x: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "linear",
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <WiSunset className="text-orange-500" size={40} />
                    <div className="ml-3">
                      <div
                        className={`text-sm ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Sunset
                      </div>
                      <div
                        className={`text-xl font-bold ${
                          theme === "dark" ? "text-white" : ""
                        }`}
                      >
                        {
                          weatherData?.forecast?.forecast?.forecastday[0]?.astro
                            ?.sunset
                        }
                      </div>
                    </div>
                  </div>
                  <div
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Dusk:{" "}
                    {
                      weatherData?.forecast?.forecast?.forecastday[0]?.astro
                        ?.dusk
                    }
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Air Quality */}
            <motion.div
              className={`p-6 rounded-2xl shadow-xl backdrop-blur-sm col-span-1 ${
                theme === "dark" ? "bg-gray-800/80" : "bg-white/90"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <h2
                className={`text-2xl font-semibold ${
                  theme === "dark" ? "text-white" : "text-gray-700"
                } mb-6 flex items-center`}
              >
                <FaWind className="mr-3 text-green-400" />
                Air Quality
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div
                    className={`text-lg ${
                      theme === "dark" ? "text-white" : ""
                    }`}
                  >
                    AQI:{" "}
                    {weatherData?.current?.current?.air_quality?.us_epa ||
                      "N/A"}
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      weatherData?.current?.current?.air_quality?.us_epa <= 50
                        ? "bg-green-100 text-green-800"
                        : weatherData?.current?.current?.air_quality?.us_epa <=
                          100
                        ? "bg-yellow-100 text-yellow-800"
                        : weatherData?.current?.current?.air_quality?.us_epa <=
                          150
                        ? "bg-orange-100 text-orange-800"
                        : weatherData?.current?.current?.air_quality?.us_epa <=
                          200
                        ? "bg-red-100 text-red-800"
                        : weatherData?.current?.current?.air_quality?.us_epa <=
                          300
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {weatherData?.current?.current?.air_quality?.us_epa <= 50
                      ? "Good"
                      : weatherData?.current?.current?.air_quality?.us_epa <=
                        100
                      ? "Moderate"
                      : weatherData?.current?.current?.air_quality?.us_epa <=
                        150
                      ? "Unhealthy for Sensitive"
                      : weatherData?.current?.current?.air_quality?.us_epa <=
                        200
                      ? "Unhealthy"
                      : weatherData?.current?.current?.air_quality?.us_epa <=
                        300
                      ? "Very Unhealthy"
                      : "Hazardous"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      name: "CO",
                      value: weatherData?.current?.current?.air_quality?.co,
                      unit: "μg/m³",
                    },
                    {
                      name: "NO₂",
                      value: weatherData?.current?.current?.air_quality?.no2,
                      unit: "μg/m³",
                    },
                    {
                      name: "O₃",
                      value: weatherData?.current?.current?.air_quality?.o3,
                      unit: "μg/m³",
                    },
                    {
                      name: "SO₂",
                      value: weatherData?.current?.current?.air_quality?.so2,
                      unit: "μg/m³",
                    },
                    {
                      name: "PM2.5",
                      value: weatherData?.current?.current?.air_quality?.pm2_5,
                      unit: "μg/m³",
                    },
                    {
                      name: "PM10",
                      value: weatherData?.current?.current?.air_quality?.pm10,
                      unit: "μg/m³",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
                      }`}
                    >
                      <div
                        className={`text-sm ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {item.name}
                      </div>
                      <div
                        className={`text-xl font-bold ${
                          theme === "dark" ? "text-white" : ""
                        }`}
                      >
                        {item.value ? item.value.toFixed(1) : "N/A"}
                        <span className="text-sm ml-1">{item.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Moon Phase */}
            <motion.div
              className={`p-6 rounded-2xl shadow-xl backdrop-blur-sm col-span-1 ${
                theme === "dark" ? "bg-gray-800/80" : "bg-white/90"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <h2
                className={`text-2xl font-semibold ${
                  theme === "dark" ? "text-white" : "text-gray-700"
                } mb-6 flex items-center`}
              >
                <FaMoon className="mr-3 text-indigo-400" />
                Moon Phase
              </h2>

              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 rounded-full shadow-inner bg-gradient-to-b from-gray-300 to-gray-400 mb-4 overflow-hidden">
                  <motion.div
                    className={`absolute inset-0 rounded-full ${
                      theme === "dark" ? "bg-gray-900" : "bg-gray-800"
                    }`}
                    initial={{ x: "-50%" }}
                    animate={{
                      x: ["-50%", "50%", "-50%"],
                    }}
                    transition={{
                      duration: 30,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                    }}
                  />
                </div>
                <div
                  className={`text-center ${
                    theme === "dark" ? "text-white" : ""
                  }`}
                >
                  <div className="text-xl font-bold">
                    {
                      weatherData?.forecast?.forecast?.forecastday[0]?.astro
                        ?.moon_phase
                    }
                  </div>
                  <div
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Illumination:{" "}
                    {
                      weatherData?.forecast?.forecast?.forecastday[0]?.astro
                        ?.moon_illumination
                    }
                    %
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
