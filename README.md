<div align="center">
  <img src="public/dashboard.jpeg" alt="WeatherSphere Logo" width="200"/>
  
  # 🌤️ WeatherSphere
  
  ### Advanced Real-Time Weather Intelligence Platform
  
  [![Production](https://img.shields.io/badge/production-live-brightgreen)](https://weather-sphere-seven.vercel.app/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-6.3-646CFF?logo=vite)](https://vitejs.dev/)
  [![Mapbox](https://img.shields.io/badge/Mapbox-GL%20JS-000000?logo=mapbox)](https://www.mapbox.com/)
  
  [Live Demo](https://weather-sphere-seven.vercel.app/) • [Documentation](#documentation) • [Report Bug](https://github.com/MRaysa/WeatherSphere/issues) • [Request Feature](https://github.com/MRaysa/WeatherSphere/issues)
</div>

---

## 📋 Table of Contents

- [About](#about)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Integration](#api-integration)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 🌍 About

**WeatherSphere** is a cutting-edge weather intelligence platform that delivers hyperlocal, real-time meteorological data with advanced visualization capabilities. Built with modern web technologies, it provides comprehensive atmospheric insights through interactive maps, detailed forecasts, and air quality monitoring.

### 🎯 Mission
To democratize access to professional-grade weather intelligence through an intuitive, fast, and reliable web application.

### ✨ Highlights
- 🚀 **Lightning Fast**: Built with Vite for optimal performance
- 🗺️ **Interactive Maps**: Powered by Mapbox GL JS with multiple weather layers
- 📱 **Responsive Design**: Seamless experience across all devices
- 🌓 **Theme Support**: Dark and light modes for comfortable viewing
- 🔐 **Type Safe**: Structured with modern JavaScript patterns
- ♿ **Accessible**: WCAG 2.1 AA compliant

---

## 🎯 Key Features

### 🌡️ Core Weather Features
- ✅ **Real-Time Weather Data** - Current conditions updated every 15 minutes
- ✅ **24-Hour Forecast** - Hourly temperature and precipitation predictions
- ✅ **7-Day Extended Forecast** - Weekly weather planning at a glance
- ✅ **Location Search** - Search any city worldwide with autocomplete
- ✅ **Geolocation Support** - Automatic detection of user's location

### 🗺️ Advanced Visualizations
- ✅ **Temperature Maps** - Global heat maps with gradient visualization
- ✅ **Wind Patterns** - Real-time wind speed and direction analysis
- ✅ **Air Quality Index (AQI)** - Pollution levels with health recommendations
- ✅ **Cloud Coverage** - Satellite-based cloud layer visualization
- ✅ **Interactive Radar** - Zoom and pan across detailed weather layers

### 📊 Data Analytics
- ✅ **Historical Trends** - Average temperature analysis over time
- ✅ **Weather Alerts** - Severe weather notifications
- ✅ **UV Index** - Sun exposure safety guidelines
- ✅ **Humidity & Pressure** - Detailed atmospheric metrics

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=white) | UI Framework | 18.3.1 |
| ![Vite](https://img.shields.io/badge/-Vite-646CFF?logo=vite&logoColor=white) | Build Tool | 6.3.5 |
| ![React Router](https://img.shields.io/badge/-React%20Router-CA4245?logo=react-router&logoColor=white) | Routing | 7.1.3 |
| ![Framer Motion](https://img.shields.io/badge/-Framer%20Motion-0055FF?logo=framer&logoColor=white) | Animations | 11.20.0 |
| ![TailwindCSS](https://img.shields.io/badge/-Tailwind-38B2AC?logo=tailwind-css&logoColor=white) | Styling | 3.4.17 |

### Maps & Visualization
| Technology | Purpose |
|------------|---------|
| **Mapbox GL JS** | Interactive mapping engine |
| **D3.js** | Data visualization library |
| **Chart.js** | Chart rendering |
| **Leaflet** | Alternative mapping solution |

### APIs & Data
- **WeatherAPI.com** - Primary weather data provider
- **OpenWeatherMap** - Air quality and supplementary data
- **Mapbox** - Geocoding and map tiles

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control

---

## 📁 Project Structure

```
WeatherSphere/
├── 📂 public/                  # Static assets
│   ├── logo.png
│   └── favicon.ico
│
├── 📂 src/                     # Source code
│   ├── 📂 assets/              # Images, fonts, icons
│   │   └── react.svg
│   │
│   ├── 📂 components/          # Reusable UI components
│   │   ├── 📂 Footer/
│   │   │   └── Footer.jsx
│   │   └── 📂 Navbar/
│   │       └── Navbar.jsx
│   │
│   ├── 📂 contexts/            # React Context providers
│   │   └── ThemeContext.jsx   # Dark/Light theme management
│   │
│   ├── 📂 pages/               # Route-based page components
│   │   ├── AqiMap.jsx          # Air Quality Index visualization
│   │   ├── AverageTemperature.jsx  # Historical temp analysis
│   │   ├── CloudMap.jsx        # Cloud coverage maps
│   │   ├── ErrorPage.jsx       # 404 error handling
│   │   ├── HomePage.jsx        # Landing page
│   │   ├── Root.jsx            # Main layout wrapper
│   │   ├── TemperatureMap.jsx  # Temperature heatmaps
│   │   └── WindyMap.jsx        # Wind pattern visualization
│   │
│   ├── 📂 routes/              # Routing configuration
│   │   ├── PrivateRoute.jsx    # Protected route wrapper
│   │   └── router.jsx          # Main router setup
│   │
│   ├── App.css                 # Global styles
│   ├── App.jsx                 # Root application component
│   ├── index.css               # Base CSS & Tailwind imports
│   └── main.jsx                # Application entry point
│
├── 📄 .env.example             # Environment variables template
├── 📄 .gitignore               # Git ignore rules
├── 📄 eslint.config.js         # ESLint configuration
├── 📄 index.html               # HTML template
├── 📄 package.json             # Dependencies & scripts
├── 📄 README.md                # Project documentation
├── 📄 tailwind.config.js       # Tailwind configuration
└── 📄 vite.config.js           # Vite build configuration
```

### 📂 Directory Breakdown

#### `/src/components/`
Reusable UI components that can be used across multiple pages.
- **Footer** - Application footer with links and branding
- **Navbar** - Navigation bar with theme toggle

#### `/src/contexts/`
React Context API providers for global state management.
- **ThemeContext** - Manages dark/light theme preferences

#### `/src/pages/`
Page-level components mapped to specific routes.
- **HomePage** - Main landing page with weather overview
- **TemperatureMap** - Interactive temperature visualization
- **WindyMap** - Wind speed and direction maps
- **AqiMap** - Air quality index display
- **CloudMap** - Cloud coverage visualization
- **AverageTemperature** - Historical temperature trends

#### `/src/routes/`
Application routing configuration.
- **router.jsx** - Defines all application routes
- **PrivateRoute.jsx** - Authentication wrapper for protected routes

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v9.0.0 or higher) or **yarn** (v1.22.0 or higher)
- **Git** - [Download](https://git-scm.com/)

### API Keys Required

1. **WeatherAPI** - [Get Free API Key](https://www.weatherapi.com/signup.aspx)
2. **Mapbox** - [Get Free API Key](https://account.mapbox.com/auth/signup/)
3. **OpenWeatherMap** (Optional) - [Get Free API Key](https://openweathermap.org/api)

---

### 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MRaysa/WeatherSphere.git
   cd WeatherSphere
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Add your API keys:
   ```env
   VITE_WEATHER_API_KEY=your_weatherapi_key_here
   VITE_MAPBOX_TOKEN=your_mapbox_token_here
   VITE_OPENWEATHER_API_KEY=your_openweather_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173`

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_WEATHER_API_KEY` | WeatherAPI.com API key | Yes | - |
| `VITE_MAPBOX_TOKEN` | Mapbox GL JS access token | Yes | - |
| `VITE_OPENWEATHER_API_KEY` | OpenWeatherMap API key | No | - |

### Build Configuration

The project uses Vite for building. Configuration can be modified in `vite.config.js`:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

---

## 📖 Usage

### Development

```bash
# Start development server
npm run dev

# Run with specific port
npm run dev -- --port 3000

# Open in browser automatically
npm run dev -- --open
```

### Production Build

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview

# Analyze bundle size
npm run build -- --mode analyze
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint:fix

# Format code with Prettier
npm run format
```

---

## 🔌 API Integration

### WeatherAPI.com

```javascript
const fetchWeather = async (location) => {
  const response = await fetch(
    `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&days=7`
  );
  return response.json();
};
```

### Mapbox GL JS

```javascript
mapboxgl.accessToken = 'YOUR_MAPBOX_TOKEN';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [lng, lat],
  zoom: 9
});
```

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed
- Test your changes thoroughly

### Reporting Bugs

Found a bug? [Open an issue](https://github.com/MRaysa/WeatherSphere/issues) with:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 WeatherSphere

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 📧 Contact

**Project Maintainer** - MRaysa

- GitHub: [@MRaysa](https://github.com/MRaysa)
- Project Link: [https://github.com/MRaysa/WeatherSphere](https://github.com/MRaysa/WeatherSphere)
- Live Demo: [https://weather-sphere-seven.vercel.app/](https://weather-sphere-seven.vercel.app/)

---

## 🙏 Acknowledgments

- [WeatherAPI.com](https://www.weatherapi.com/) - Weather data provider
- [Mapbox](https://www.mapbox.com/) - Mapping platform
- [React](https://reactjs.org/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [Vercel](https://vercel.com/) - Hosting platform
- Icons by [Heroicons](https://heroicons.com/)

---

<div align="center">
  
  ### ⭐ Star this repo if you find it helpful!
  
  Made with ❤️ by [MRaysa](https://github.com/MRaysa)
  
  [Back to Top](#-weathersphere)
  
</div>
