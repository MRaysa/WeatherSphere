import React from "react";
import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  WiDaySunny,
  WiStrongWind,
  WiThermometer,
  WiCloudy,
  WiBarometer,
  WiNightClear,
} from "react-icons/wi";
import {
  FaHome,
  FaChartLine,
  FaMapMarkedAlt,
  FaCloudSunRain,
} from "react-icons/fa";
import { IoSunnyOutline, IoMoonOutline } from "react-icons/io5";
import { useTheme } from "../../contexts/ThemeContext";

const Navbar = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  // Theme-based styles with blue colors
  const bgColor = theme === "dark" ? "bg-gray-900" : "bg-blue-800";
  const textColor = theme === "dark" ? "text-gray-200" : "text-white";
  const hoverText =
    theme === "dark" ? "hover:text-blue-400" : "hover:text-blue-200";
  const mobileMenuBg = theme === "dark" ? "bg-gray-800" : "bg-blue-700";
  const dropdownBg = theme === "dark" ? "bg-gray-800" : "bg-white";
  const dropdownText = theme === "dark" ? "text-gray-200" : "text-gray-800";
  const dropdownHover =
    theme === "dark" ? "hover:bg-gray-700" : "hover:bg-blue-50";
  const activeLinkBg = theme === "dark" ? "bg-gray-700" : "bg-blue-700";
  const activeLinkText = theme === "dark" ? "text-white" : "text-white";

  const navItems = [
    { path: "/", icon: <FaHome size={20} />, label: "Home" },
    {
      path: "/average",
      icon: <FaChartLine size={20} />,
      label: "Average Temperature",
    },
    {
      path: null,
      icon: <FaMapMarkedAlt size={20} />,
      label: "Maps",
      children: [
        {
          path: "/temperature-map",
          icon: <WiThermometer size={20} />,
          label: "Temperature",
        },
        {
          path: "/wind-map",
          icon: <WiStrongWind size={20} />,
          label: "Wind",
        },
        {
          path: "/aqi-map",
          icon: <WiBarometer size={20} />,
          label: "Air Quality",
        },
        {
          path: "/cloud-map",
          icon: <WiCloudy size={20} />,
          label: "Clouds",
        },
      ],
    },
  ];

  const isActive = (path) => location.pathname === path;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: -100 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
      },
    },
  };

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.2,
      },
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  };

  const hoverScale = {
    scale: 1.05,
    transition: { type: "spring", stiffness: 400 },
  };

  const tapScale = {
    scale: 0.95,
    transition: { type: "spring", stiffness: 400 },
  };

  const themeSwitchVariants = {
    light: { rotate: 0 },
    dark: { rotate: 360 },
  };

  return (
    <motion.nav
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`sticky top-0 z-50 w-full ${bgColor} ${textColor} shadow-lg`}
    >
      <div className="container mx-auto px-4">
        <div className="navbar max-w-7xl mx-auto">
          {/* Brand Logo */}
          <div className="navbar-start">
            <motion.div
              whileHover={hoverScale}
              whileTap={tapScale}
              className="flex items-center gap-2 cursor-pointer"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={theme}
                  initial={{ opacity: 0, rotate: theme === "light" ? -90 : 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: theme === "light" ? 90 : -90 }}
                  transition={{ duration: 0.3 }}
                >
                  {theme === "light" ? (
                    <WiDaySunny className="text-4xl text-yellow-500" />
                  ) : (
                    <WiNightClear className="text-4xl text-blue-300" />
                  )}
                </motion.div>
              </AnimatePresence>
              <motion.span
                className={`text-xl font-bold ${hoverText}`}
                whileHover={{ scale: 1.05 }}
              >
                WeatherSphere
              </motion.span>
            </motion.div>
          </div>

          {/* Desktop Navigation */}
          <div className="navbar-center hidden lg:flex">
            <motion.ul
              className="menu menu-horizontal gap-1"
              variants={containerVariants}
            >
              {navItems.map((item) => (
                <motion.li
                  key={item.label}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                >
                  {item.path ? (
                    <Link
                      to={item.path}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        isActive(item.path)
                          ? `${activeLinkBg} ${activeLinkText}`
                          : `${hoverText} hover:bg-opacity-20`
                      }`}
                    >
                      <motion.span whileHover={{ scale: 1.1 }}>
                        {item.icon}
                      </motion.span>
                      <motion.span
                        whileHover={{ x: 3 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        {item.label}
                      </motion.span>
                    </Link>
                  ) : (
                    <details className="dropdown">
                      <summary
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg ${hoverText} cursor-pointer`}
                      >
                        <motion.span whileHover={{ rotate: 5 }}>
                          {item.icon}
                        </motion.span>
                        <motion.span whileHover={{ x: 3 }}>
                          {item.label}
                        </motion.span>
                      </summary>
                      <motion.ul
                        className={`p-2 ${dropdownBg} ${dropdownText} rounded-box shadow-lg z-50`}
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                      >
                        {item.children?.map((child) => (
                          <motion.li key={child.path} whileHover={{ x: 5 }}>
                            <Link
                              to={child.path}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                                isActive(child.path)
                                  ? `${activeLinkBg} ${activeLinkText}`
                                  : `${dropdownHover}`
                              }`}
                            >
                              <motion.span whileHover={{ scale: 1.1 }}>
                                {child.icon}
                              </motion.span>
                              <motion.span
                                whileHover={{ x: 3 }}
                                transition={{ type: "spring", stiffness: 500 }}
                              >
                                {child.label}
                              </motion.span>
                            </Link>
                          </motion.li>
                        ))}
                      </motion.ul>
                    </details>
                  )}
                </motion.li>
              ))}
            </motion.ul>
          </div>

          {/* Theme Toggle and Mobile Menu */}
          <div className="navbar-end gap-2">
            {/* Theme Toggle Button */}
            <motion.button
              onClick={toggleTheme}
              whileHover={hoverScale}
              whileTap={tapScale}
              className={`btn btn-ghost btn-circle ${hoverText}`}
              aria-label={`Switch to ${
                theme === "light" ? "dark" : "light"
              } mode`}
              variants={themeSwitchVariants}
              animate={theme === "light" ? "light" : "dark"}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={theme}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === "light" ? (
                    <IoMoonOutline className="text-xl" />
                  ) : (
                    <IoSunnyOutline className="text-xl text-yellow-300" />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            {/* Mobile Menu Button */}
            <div className="dropdown dropdown-end lg:hidden">
              <motion.label
                tabIndex={0}
                className={`btn btn-ghost btn-circle ${hoverText}`}
                aria-label="Menu"
                whileHover={hoverScale}
                whileTap={tapScale}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </motion.label>
              <motion.ul
                tabIndex={0}
                className={`menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow ${mobileMenuBg} rounded-box w-56`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {navItems.map((item) => (
                  <motion.li
                    key={item.label}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {item.path ? (
                      <Link
                        to={item.path}
                        className={`flex items-center gap-2 px-4 py-2 ${
                          isActive(item.path)
                            ? `${activeLinkBg} ${activeLinkText}`
                            : `${dropdownHover}`
                        }`}
                      >
                        <motion.span whileHover={{ scale: 1.1 }}>
                          {item.icon}
                        </motion.span>
                        <motion.span whileHover={{ x: 3 }}>
                          {item.label}
                        </motion.span>
                      </Link>
                    ) : (
                      <>
                        <motion.span
                          className="font-medium px-4 py-2"
                          whileHover={{ x: 3 }}
                        >
                          {item.label}
                        </motion.span>
                        <ul className="pl-4">
                          {item.children?.map((child) => (
                            <motion.li key={child.path} whileHover={{ x: 5 }}>
                              <Link
                                to={child.path}
                                className={`flex items-center gap-2 px-4 py-2 ${
                                  isActive(child.path)
                                    ? `${activeLinkBg} ${activeLinkText}`
                                    : `${dropdownHover}`
                                }`}
                              >
                                <motion.span whileHover={{ scale: 1.1 }}>
                                  {child.icon}
                                </motion.span>
                                <motion.span whileHover={{ x: 3 }}>
                                  {child.label}
                                </motion.span>
                              </Link>
                            </motion.li>
                          ))}
                        </ul>
                      </>
                    )}
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
