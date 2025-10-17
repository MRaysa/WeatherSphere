import React, { useEffect, useState, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Initialize Mapbox
mapboxgl.accessToken =
  'pk.eyJ1IjoiYXlzYSIsImEiOiJjbTkwYXNidzYwajlrMmpzZHk1OWM4Zjk1In0.-4Im1sYjHHWGokgOrFw-qg';

const WindyMap = () => {
  const [loading, setLoading] = useState(false);
  const [map, setMap] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [searchedLocations, setSearchedLocations] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [locationInput, setLocationInput] = useState('');
  const [forecast, setForecast] = useState([]);

  const mapContainer = useRef(null);
  const markersRef = useRef([]);
  const animationIdRef = useRef(null);

  const API_KEY = '1dec1896e77e4da5b0c195326251603';
  const BASE_URL = 'https://api.weatherapi.com/v1';

  // Initialize map
  useEffect(() => {
    if (mapContainer.current && !map) {
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v11',
        center: [0, 20],
        zoom: 2,
        pitch: 0,
        bearing: 0,
      });

      newMap.on('load', () => {
        newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');
        setMap(newMap);
      });
    }

    return () => {
      if (map) map.remove();
    };
  }, [map]);

  // Fetch weather data
  const fetchWeatherData = useCallback(async (location) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/forecast.json?key=${API_KEY}&q=${location}&days=1&aqi=no&alerts=no`
      );

      if (!response.ok) {
        throw new Error('Location not found');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      alert('Location not found. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update weather info and map
  const updateWeatherInfo = useCallback(
    async (location) => {
      if (!map) return;

      try {
        const data = await fetchWeatherData(location);
        const current = data.current;
        const locationData = data.location;
        const forecastData = data.forecast.forecastday[0];

        setCurrentWeather({
          temp: current.temp_c,
          feelsLike: current.feelslike_c,
          condition: current.condition.text,
          icon: current.condition.icon,
          humidity: current.humidity,
          pressure: current.pressure_mb,
          visibility: current.vis_km,
          windSpeed: current.wind_kph,
          windDir: current.wind_dir,
          windDegree: current.wind_degree,
          location: locationData.name,
          country: locationData.country,
          localTime: locationData.localtime,
          coords: [locationData.lon, locationData.lat],
        });

        setForecast(forecastData.hour);

        // Add to searched locations
        setSearchedLocations((prev) => {
          if (!prev.some((loc) => loc.name === locationData.name)) {
            return [
              ...prev,
              {
                name: locationData.name,
                country: locationData.country,
                coords: [locationData.lon, locationData.lat],
                windSpeed: current.wind_kph,
                windDir: current.wind_dir,
              },
            ];
          }
          return prev;
        });

        // Update map
        map.flyTo({
          center: [locationData.lon, locationData.lat],
          zoom: 8,
        });

        // Add marker
        const marker = new mapboxgl.Marker({ color: '#3b82f6' })
          .setLngLat([locationData.lon, locationData.lat])
          .setPopup(
            new mapboxgl.Popup().setHTML(`
            <div class='p-2'>
              <h3 class='font-bold text-lg'>${locationData.name}, ${locationData.country}</h3>
              <div class='flex items-center my-2'>
                <img src='https:${current.condition.icon}' alt='${current.condition.text}' class='w-10 h-10'>
                <span class='ml-2'>${current.condition.text}</span>
              </div>
              <p class='text-sm'><strong>Temp:</strong> ${current.temp_c}°C</p>
              <p class='text-sm'><strong>Wind:</strong> ${current.wind_kph} km/h ${current.wind_dir}</p>
              <p class='text-sm'><strong>Humidity:</strong> ${current.humidity}%</p>
            </div>
          `)
          )
          .addTo(map);

        markersRef.current.push(marker);

        if (!isPlaying) {
          setIsPlaying(true);
        }
      } catch (error) {
        console.error('Error updating weather info:', error);
      }
    },
    [map, fetchWeatherData, isPlaying]
  );

  const handleSearch = useCallback(() => {
    if (locationInput.trim()) {
      updateWeatherInfo(locationInput.trim());
    } else {
      alert('Please enter a location');
    }
  }, [locationInput, updateWeatherInfo]);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    },
    [handleSearch]
  );

  useEffect(() => {
    if (!currentWeather || !isPlaying) {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
      return;
    }

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [currentWeather, isPlaying, animationSpeed]);

  const toggleAnimation = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-8'>
      <div className='max-w-7xl mx-auto'>
        <header className='text-center mb-8'>
          <h1 className='text-4xl md:text-5xl font-bold text-gray-800 mb-4'>
            <span className='bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent'>
              Real-Time
            </span>{' '}
            Wind & Weather Visualization
          </h1>
          <p className='text-lg text-gray-600'>
            Advanced meteorological insights with beautiful interactive maps
          </p>
        </header>

        <section className='mb-8'>
          <div className='max-w-2xl mx-auto relative'>
            <div className='flex items-center bg-white rounded-full p-2 shadow-lg'>
              <input
                type='text'
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder='Search for a city or location...'
                className='flex-grow px-6 py-3 border-0 bg-blue-50 text-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-200' />
              <button
                onClick={handleSearch}
                disabled={loading}
                className='ml-2 px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition flex items-center disabled:opacity-50'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 mr-2'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                </svg>
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </section>

        {currentWeather && (
          <section className='mb-8'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
              <div className='bg-white rounded-2xl shadow-xl p-6'>
                <div className='flex items-center mb-4'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-8 w-8 text-blue-500 mr-3'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                  </svg>
                  <div>
                    <h2 className='text-xl font-semibold text-slate-700'>
                      {currentWeather.location}, {currentWeather.country}
                    </h2>
                    <p className='text-slate-500'>{currentWeather.localTime}</p>
                  </div>
                </div>
                <div className='flex justify-between items-center'>
                  <div>
                    <p className='text-5xl font-bold text-slate-800'>
                      {currentWeather.temp}°C
                    </p>
                    <p className='text-slate-500'>{currentWeather.condition}</p>
                  </div>
                  <img
                    src={`https:${currentWeather.icon}`}
                    alt={currentWeather.condition}
                    className='h-20 w-20' />
                </div>
              </div>

              <div className='bg-white rounded-2xl shadow-xl p-6'>
                <h3 className='text-lg font-semibold text-slate-700 mb-4 flex items-center'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5 mr-2 text-blue-500'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z' />
                  </svg>
                  Wind Conditions
                </h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-slate-500'>Speed</p>
                    <p className='text-2xl font-bold text-slate-800'>
                      {currentWeather.windSpeed} km/h
                    </p>
                    <div className='w-full bg-slate-200 rounded-full h-2.5 mt-2'>
                      <div
                        className='bg-blue-500 h-2.5 rounded-full'
                        style={{
                          width: `${Math.min(
                            100,
                            (currentWeather.windSpeed / 100) * 100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <p className='text-slate-500'>Direction</p>
                    <p className='text-2xl font-bold text-slate-800'>
                      {currentWeather.windDegree}° {currentWeather.windDir}
                    </p>
                  </div>
                </div>
              </div>

              <div className='bg-white rounded-2xl shadow-xl p-6'>
                <h3 className='text-lg font-semibold text-slate-700 mb-4'>
                  Weather Details
                </h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-slate-500'>Humidity</p>
                    <p className='text-2xl font-bold text-slate-800'>
                      {currentWeather.humidity}%
                    </p>
                  </div>
                  <div>
                    <p className='text-slate-500'>Pressure</p>
                    <p className='text-2xl font-bold text-slate-800'>
                      {currentWeather.pressure} hPa
                    </p>
                  </div>
                  <div>
                    <p className='text-slate-500'>Feels Like</p>
                    <p className='text-2xl font-bold text-slate-800'>
                      {currentWeather.feelsLike}°C
                    </p>
                  </div>
                  <div>
                    <p className='text-slate-500'>Visibility</p>
                    <p className='text-2xl font-bold text-slate-800'>
                      {currentWeather.visibility} km
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {forecast.length > 0 && (
              <div className='bg-white rounded-2xl shadow-xl p-6 mb-8'>
                <h3 className='text-lg font-semibold text-slate-700 mb-4'>
                  24-Hour Temperature Forecast
                </h3>
                <div className='overflow-x-auto'>
                  <div className='flex gap-4 min-w-max'>
                    {forecast
                      .filter((_, i) => i % 3 === 0)
                      .map((hour, index) => (
                        <div
                          key={index}
                          className='flex flex-col items-center p-3 bg-blue-50 rounded-lg min-w-[80px]'
                        >
                          <p className='text-sm text-slate-600'>
                            {hour.time.slice(-5)}
                          </p>
                          <img
                            src={`https:${hour.condition.icon}`}
                            alt={hour.condition.text}
                            className='w-10 h-10 my-2' />
                          <p className='text-lg font-bold text-slate-800'>
                            {hour.temp_c}°C
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        <section className='bg-white rounded-2xl shadow-xl overflow-hidden'>
          <div className='p-6'>
            <h3 className='text-lg font-semibold text-slate-700 mb-2'>
              Interactive Wind Map
            </h3>
            <p className='text-slate-500 mb-4'>
              Visualize wind patterns and weather conditions
            </p>
          </div>

          <div className='relative' style={{ height: '600px' }}>
            {loading && (
              <div className='absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10'>
                <div className='text-center'>
                  <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4'></div>
                  <p className='text-lg font-medium text-gray-700'>
                    Loading wind data...
                  </p>
                </div>
              </div>
            )}

            <div ref={mapContainer} className='w-full h-full'></div>

          {searchedLocations.length > 0 && (
            <div className='absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs z-10'>
              <h3 className='font-semibold mb-3 text-lg'>Locations</h3>
              <ul className='space-y-2'>
                {searchedLocations.map((location, index) => (
                  <li
                    key={index}
                    className='flex items-center hover:bg-gray-100 p-2 rounded cursor-pointer'
                    onClick={() => {
                      if (map) {
                        map.flyTo({
                          center: location.coords,
                          zoom: 8,
                        });
                      }
                    }}
                  >
                    <span className='w-3 h-3 rounded-full mr-2 bg-blue-500 inline-block'></span>
                    <div className='text-sm'>
                      <div className='font-medium'>{location.name}</div>
                      <div className='text-xs text-gray-500'>{location.country}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {currentWeather && (
            <div className='absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10'>
              <div className='flex flex-col space-y-4'>
                <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4'>
                  <button
                    onClick={toggleAnimation}
                    className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-5 w-5 mr-2'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      {isPlaying ? (
                        <path
                          fillRule='evenodd'
                          d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z'
                          clipRule='evenodd' />
                      ) : (
                        <path
                          fillRule='evenodd'
                          d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z'
                          clipRule='evenodd' />
                      )}
                    </svg>
                    {isPlaying ? 'Pause' : 'Play'}
                  </button>
                  <div className='flex items-center'>
                    <span className='text-sm font-medium mr-2'>Speed:</span>
                    <input
                      type='range'
                      min='0.1'
                      max='2'
                      step='0.1'
                      value={animationSpeed}
                      onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                      className='w-24' />
                    <span className='text-sm ml-2 w-8'>
                      {animationSpeed}x
                    </span>
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='bg-gray-100 p-3 rounded-lg'>
                    <p className='text-xs text-gray-500'>Wind Speed</p>
                    <p className='text-xl font-bold'>
                      {currentWeather.windSpeed}{' '}
                      <span className='text-sm'>km/h</span>
                    </p>
                  </div>
                  <div className='bg-gray-100 p-3 rounded-lg'>
                    <p className='text-xs text-gray-500'>Direction</p>
                    <p className='text-xl font-bold'>
                      {currentWeather.windDir}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
        </section>

        <section className='my-16'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold text-slate-800 mb-4'>
            Advanced Weather Features
          </h2>
          <p className='text-lg text-slate-600 max-w-2xl mx-auto'>
            Powerful tools for professionals and weather enthusiasts
          </p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          <div className='bg-white rounded-2xl shadow-xl p-8 text-center'>
            <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-8 w-8 text-blue-500'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 10V3L4 14h7v7l9-11h-7z' />
              </svg>
            </div>
            <h3 className='text-xl font-semibold text-slate-800 mb-2'>
              Real-Time Data
            </h3>
            <p className='text-slate-600'>
              Get up-to-the-minute weather information with our global network
              of data sources.
            </p>
          </div>
          <div className='bg-white rounded-2xl shadow-xl p-8 text-center'>
            <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-8 w-8 text-green-500'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' />
              </svg>
            </div>
            <h3 className='text-xl font-semibold text-slate-800 mb-2'>
              Wind Analysis
            </h3>
            <p className='text-slate-600'>
              Detailed wind speed and direction visualization with our advanced
              tools.
            </p>
          </div>
          <div className='bg-white rounded-2xl shadow-xl p-8 text-center'>
            <div className='w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-8 w-8 text-amber-500'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
              </svg>
            </div>
            <h3 className='text-xl font-semibold text-slate-800 mb-2'>
              Forecast Reports
            </h3>
            <p className='text-slate-600'>
              Accurate 24-hour forecasts with detailed hourly breakdowns for
              planning ahead.
            </p>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
};

export default WindyMap;
