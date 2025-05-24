import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";
import {
  WiDaySunny,
  WiRain,
  WiCloudy,
  WiSnow,
  WiThunderstorm,
} from "react-icons/wi";
import {
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaRegEnvelope,
  FaHeart,
} from "react-icons/fa";

const Footer = () => {
  const { theme } = useTheme();

  const weatherIcons = [
    { icon: <WiDaySunny size={24} />, name: "Sunny" },
    { icon: <WiRain size={24} />, name: "Rain" },
    { icon: <WiCloudy size={24} />, name: "Cloudy" },
    { icon: <WiSnow size={24} />, name: "Snow" },
    { icon: <WiThunderstorm size={24} />, name: "Thunderstorm" },
  ];

  const footerLinks = [
    { name: "About", path: "/about" },
    { name: "Features", path: "/features" },
    { name: "API", path: "/api-docs" },
    { name: "Privacy", path: "/privacy" },
    { name: "Terms", path: "/terms" },
  ];

  const socialLinks = [
    {
      icon: <FaGithub size={18} />,
      url: "https://github.com/yourusername",
      name: "GitHub",
    },
    {
      icon: <FaLinkedin size={18} />,
      url: "https://linkedin.com/in/yourprofile",
      name: "LinkedIn",
    },
    {
      icon: <FaTwitter size={18} />,
      url: "https://twitter.com/yourhandle",
      name: "Twitter",
    },
    {
      icon: <FaRegEnvelope size={18} />,
      url: "mailto:contact@weathersphere.com",
      name: "Email",
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const weatherIconVariants = {
    hover: {
      y: -5,
      rotate: [0, 10, -10, 0],
      transition: {
        y: { type: "spring", stiffness: 300 },
        rotate: { duration: 0.8 },
      },
    },
  };

  const socialIconVariants = {
    hover: {
      scale: 1.2,
      rotate: 360,
      transition: { type: "spring", stiffness: 500 },
    },
    tap: { scale: 0.9 },
  };

  const linkVariants = {
    hover: {
      x: 5,
      textShadow: "0px 0px 8px rgba(59, 130, 246, 0.8)",
      transition: { type: "spring", stiffness: 300 },
    },
  };

  const pulseHeart = {
    scale: [1, 1.2, 1],
    color: ["#ff0000", "#ff6666", "#ff0000"],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  return (
    <motion.footer
      className={`w-full py-12 ${
        theme === "dark"
          ? "bg-gray-900 text-gray-300"
          : "bg-blue-800 text-blue-50"
      }`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Weather Icon Showcase */}
          <motion.div
            className="flex flex-col items-center md:items-start"
            variants={itemVariants}
          >
            <motion.h3
              className="text-lg font-semibold mb-4"
              whileHover={{ scale: 1.05 }}
            >
              Weather Conditions
            </motion.h3>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              {weatherIcons.map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover="hover"
                  variants={weatherIconVariants}
                  className={`p-3 rounded-full ${
                    theme === "dark"
                      ? "bg-gray-800 hover:bg-gray-700"
                      : "bg-blue-700 hover:bg-blue-600"
                  } transition-colors duration-200 flex flex-col items-center`}
                  title={item.name}
                  animate={floatingAnimation}
                >
                  {item.icon}
                  <motion.span
                    className="text-xs mt-1"
                    whileHover={{ scale: 1.1 }}
                  >
                    {item.name}
                  </motion.span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Navigation Links */}
          <motion.div
            className="flex flex-col items-center"
            variants={itemVariants}
          >
            <motion.h3
              className="text-lg font-semibold mb-4"
              whileHover={{ scale: 1.05 }}
            >
              Quick Links
            </motion.h3>
            <ul className="space-y-2 text-center md:text-left">
              {footerLinks.map((link, index) => (
                <motion.li
                  key={index}
                  variants={itemVariants}
                  whileHover="hover"
                  variants={linkVariants}
                >
                  <motion.a
                    href={link.path}
                    className={`hover:underline ${
                      theme === "dark"
                        ? "text-blue-400 hover:text-blue-300"
                        : "text-blue-100 hover:text-white"
                    } transition-colors`}
                    whileTap={{ scale: 0.95 }}
                  >
                    {link.name}
                  </motion.a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact & Social */}
          <motion.div
            className="flex flex-col items-center md:items-end"
            variants={itemVariants}
          >
            <motion.h3
              className="text-lg font-semibold mb-4"
              whileHover={{ scale: 1.05 }}
            >
              Connect With Us
            </motion.h3>
            <div className="flex gap-4 mb-4">
              {socialLinks.map((link, index) => (
                <motion.a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={itemVariants}
                  whileHover="hover"
                  whileTap="tap"
                  variants={socialIconVariants}
                  className={`p-3 rounded-full ${
                    theme === "dark"
                      ? "bg-gray-800 hover:bg-gray-700"
                      : "bg-blue-700 hover:bg-blue-600"
                  } transition-colors duration-200`}
                  aria-label={link.name}
                >
                  {link.icon}
                </motion.a>
              ))}
            </div>
            <motion.p
              className="text-sm text-center md:text-right"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              © {new Date().getFullYear()} WeatherSphere. All rights reserved.
            </motion.p>
          </motion.div>
        </div>

        {/* Developer Credit */}
        <motion.div
          className="mt-12 pt-6 border-t border-opacity-20 flex flex-col items-center"
          variants={itemVariants}
        >
          <motion.div className="flex items-center" animate={floatingAnimation}>
            <motion.span className="mr-2">Made with</motion.span>
            <motion.span animate={pulseHeart} className="mx-1">
              <FaHeart size={18} />
            </motion.span>
            <motion.span className="ml-2">by</motion.span>
            <motion.span
              className="font-bold ml-2"
              whileHover={{
                scale: 1.05,
                color: "#3B82F6",
                textShadow: "0px 0px 10px rgba(59, 130, 246, 0.7)",
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Mst. Aysa Siddika Meem
            </motion.span>
          </motion.div>
          <motion.p
            className="text-xs mt-2 opacity-75"
            whileHover={{ scale: 1.05, opacity: 1 }}
          >
            Data provided by OpenWeatherMap API
          </motion.p>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
