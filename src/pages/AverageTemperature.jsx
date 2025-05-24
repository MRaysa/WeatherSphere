import React, { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import {
  FaTemperatureHigh,
  FaCalendarAlt,
  FaSun,
  FaSnowflake,
  FaSearchLocation,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { debounce } from "lodash";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const API_KEY = "1dec1896e77e4da5b0c195326251603";
const BASE_URL = "https://api.weatherapi.com/v1";

const AverageTemperature = () => {
  const { theme } = useTheme();
  const [timeRange, setTimeRange] = useState("month");
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const [location, setLocation] = useState("Everett");
  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch weather data from API
  const fetchWeatherData = async (loc, days) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/forecast.json?key=${API_KEY}&q=${loc}&days=${days}`
      );
      if (!response.ok) throw new Error("Failed to fetch weather data");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching weather data:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch location suggestions
  const fetchSuggestions = debounce(async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/search.json?key=${API_KEY}&q=${query}`
      );
      if (!response.ok) throw new Error("Failed to fetch suggestions");
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    }
  }, 300);

  // Process data for chart
  const processData = (data, range) => {
    if (!data) return null;

    if (range === "month") {
      return {
        labels: data.forecast.forecastday.map((day) => day.date),
        temps: data.forecast.forecastday.map((day) => day.day.avgtemp_c),
        high: Math.max(
          ...data.forecast.forecastday.map((day) => day.day.maxtemp_c)
        ),
        low: Math.min(
          ...data.forecast.forecastday.map((day) => day.day.mintemp_c)
        ),
      };
    } else {
      // For yearly data, we'll simulate monthly averages
      const monthlyAverages = Array(12)
        .fill(0)
        .map((_, month) => {
          const monthData = data.forecast.forecastday.filter(
            (day) => new Date(day.date).getMonth() === month
          );
          return (
            monthData.reduce((sum, day) => sum + day.day.avgtemp_c, 0) /
            monthData.length
          );
        });
      return {
        labels: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        temps: monthlyAverages,
        high: Math.max(...monthlyAverages),
        low: Math.min(...monthlyAverages),
      };
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const days = timeRange === "month" ? 30 : 365; // 30 days or full year
      const data = await fetchWeatherData(location, days);
      if (data) {
        setWeatherData(processData(data, timeRange));
      }
    };
    loadData();
  }, [location, timeRange]);

  useEffect(() => {
    if (searchInput) {
      fetchSuggestions(searchInput);
    }
  }, [searchInput]);

  // Theme styles
  const themeStyles = {
    light: {
      bg: "bg-gradient-to-br from-blue-50 to-white",
      cardBg: "bg-white",
      text: "text-gray-800",
      border: "border-gray-200",
      button: {
        active: "bg-blue-600 text-white",
        inactive: "bg-white text-gray-700 hover:bg-gray-100",
      },
      chartLine: "#3b82f6",
      chartFill: "rgba(59, 130, 246, 0.1)",
      chartGrid: "rgba(0, 0, 0, 0.1)",
      input:
        "bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500",
    },
    dark: {
      bg: "bg-gradient-to-br from-gray-900 to-gray-800",
      cardBg: "bg-gray-800",
      text: "text-gray-100",
      border: "border-gray-700",
      button: {
        active: "bg-blue-700 text-white",
        inactive: "bg-gray-700 text-gray-300 hover:bg-gray-600",
      },
      chartLine: "#60a5fa",
      chartFill: "rgba(96, 165, 250, 0.1)",
      chartGrid: "rgba(255, 255, 255, 0.1)",
      input:
        "bg-gray-700 border-gray-600 focus:ring-blue-500 focus:border-blue-500",
    },
  };

  const currentTheme = themeStyles[theme];

  const chartData = {
    labels: weatherData?.labels || [],
    datasets: [
      {
        label: "Temperature (°C)",
        data: weatherData?.temps || [],
        borderColor: currentTheme.chartLine,
        backgroundColor: currentTheme.chartFill,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: currentTheme.chartLine,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: currentTheme.cardBg,
        titleColor: currentTheme.text,
        bodyColor: currentTheme.text,
        borderColor: currentTheme.border,
        borderWidth: 1,
        padding: 12,
        usePointStyle: true,
        callbacks: { label: (context) => `${context.raw}°C` },
      },
    },
    scales: {
      x: {
        grid: { color: currentTheme.chartGrid, drawBorder: false },
        ticks: { color: currentTheme.text },
      },
      y: {
        grid: { color: currentTheme.chartGrid, drawBorder: false },
        ticks: {
          color: currentTheme.text,
          callback: (value) => `${value}°C`,
        },
      },
    },
  };

  const averageTemp = weatherData?.temps
    ? weatherData.temps.reduce((a, b) => a + b, 0) / weatherData.temps.length
    : 0;

  const handleLocationSelect = (selectedLocation) => {
    setLocation(selectedLocation);
    setSearchInput(selectedLocation);
    setShowSuggestions(false);
  };

  return (
    <div
      className={`min-h-screen p-6 ${currentTheme.bg} transition-colors duration-300`}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Search Bar */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-6 relative"
        >
          <div className="flex items-center rounded-full shadow-lg bg-white dark:bg-gray-700">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setShowSuggestions(true);
              }}
              placeholder="Search for a location..."
              className={`flex-grow px-6 py-3 border-0 rounded-full focus:outline-none focus:ring-2 ${currentTheme.input}`}
            />
            <button
              onClick={() => handleLocationSelect(searchInput)}
              className="ml-2 px-4 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <FaSearchLocation className="h-5 w-5" />
            </button>
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-md shadow-lg bg-white dark:bg-gray-700 max-h-60 overflow-auto">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer ${currentTheme.text}`}
                  onClick={() => handleLocationSelect(suggestion.name)}
                >
                  {suggestion.name}, {suggestion.region}, {suggestion.country}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`rounded-xl shadow-xl p-6 ${currentTheme.cardBg} ${currentTheme.border} border`}
        >
          {/* Header */}
          <motion.div
            className="flex flex-col md:flex-row md:items-center md:justify-between mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center mb-4 md:mb-0">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <FaTemperatureHigh className="text-3xl mr-3 text-blue-500" />
              </motion.div>
              <div>
                <h1 className={`text-2xl font-bold ${currentTheme.text}`}>
                  Average Temperatures in {location}
                </h1>
                <p
                  className={`text-sm ${
                    theme === "light" ? "text-gray-600" : "text-gray-400"
                  }`}
                >
                  {timeRange === "month" ? "Last 30 days" : "Last 12 months"}
                </p>
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={`rounded-lg p-4 ${
                theme === "light" ? "bg-blue-50" : "bg-gray-700"
              } flex items-center cursor-pointer`}
            >
              {averageTemp > 15 ? (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <FaSun className="text-2xl mr-3 text-yellow-500" />
                </motion.div>
              ) : (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <FaSnowflake className="text-2xl mr-3 text-blue-400" />
                </motion.div>
              )}
              <div>
                <p
                  className={`text-sm ${
                    theme === "light" ? "text-gray-600" : "text-gray-300"
                  }`}
                >
                  Average
                </p>
                <motion.p
                  className={`text-xl font-bold ${currentTheme.text}`}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  {loading ? "--" : averageTemp.toFixed(1)}°C
                </motion.p>
              </div>
            </motion.div>
          </motion.div>

          {/* Toggle Buttons */}
          <motion.div
            className="flex mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTimeRange("month")}
              className={`flex items-center px-4 py-2 rounded-l-lg border ${
                currentTheme.border
              } ${
                timeRange === "month"
                  ? currentTheme.button.active
                  : currentTheme.button.inactive
              } transition-colors`}
            >
              <FaCalendarAlt className="mr-2" />
              Monthly
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTimeRange("year")}
              className={`flex items-center px-4 py-2 rounded-r-lg border-t border-b border-r ${
                currentTheme.border
              } ${
                timeRange === "year"
                  ? currentTheme.button.active
                  : currentTheme.button.inactive
              } transition-colors`}
            >
              <FaCalendarAlt className="mr-2" />
              Yearly
            </motion.button>
          </motion.div>

          {/* Chart Area */}
          <motion.div
            className="relative h-80 md:h-96"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{
                    rotate: 360,
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="flex flex-col items-center"
                >
                  <div className="h-8 w-8 bg-blue-500 rounded-full mb-2"></div>
                  <p className={currentTheme.text}>
                    Loading temperature data...
                  </p>
                </motion.div>
              </div>
            ) : (
              <Line data={chartData} options={chartOptions} />
            )}
          </motion.div>

          {/* Additional Info */}
          <motion.div
            className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <motion.div
              whileHover={{ y: -5 }}
              whileTap={{ y: 0 }}
              className={`p-4 rounded-lg ${
                theme === "light" ? "bg-blue-50" : "bg-gray-700"
              } cursor-pointer`}
            >
              <p
                className={`text-sm ${
                  theme === "light" ? "text-gray-600" : "text-gray-300"
                }`}
              >
                Highest
              </p>
              <motion.p
                className={`text-xl font-bold ${currentTheme.text}`}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.1 }}
              >
                {weatherData?.high || "--"}°C
              </motion.p>
            </motion.div>
            <motion.div
              whileHover={{ y: -5 }}
              whileTap={{ y: 0 }}
              className={`p-4 rounded-lg ${
                theme === "light" ? "bg-blue-50" : "bg-gray-700"
              } cursor-pointer`}
            >
              <p
                className={`text-sm ${
                  theme === "light" ? "text-gray-600" : "text-gray-300"
                }`}
              >
                Lowest
              </p>
              <motion.p
                className={`text-xl font-bold ${currentTheme.text}`}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2 }}
              >
                {weatherData?.low || "--"}°C
              </motion.p>
            </motion.div>
            <motion.div
              whileHover={{ y: -5 }}
              whileTap={{ y: 0 }}
              className={`p-4 rounded-lg ${
                theme === "light" ? "bg-blue-50" : "bg-gray-700"
              } cursor-pointer`}
            >
              <p
                className={`text-sm ${
                  theme === "light" ? "text-gray-600" : "text-gray-300"
                }`}
              >
                Range
              </p>
              <motion.p
                className={`text-xl font-bold ${currentTheme.text}`}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.3 }}
              >
                {weatherData
                  ? (weatherData.high - weatherData.low).toFixed(1)
                  : "--"}
                °C
              </motion.p>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AverageTemperature;
