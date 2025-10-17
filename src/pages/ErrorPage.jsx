import React, { useEffect, useState } from "react";
import { useNavigate, useRouteError } from "react-router";
import { useTheme } from "../contexts/ThemeContext";

const ErrorPage = () => {
  const navigate = useNavigate();
  const error = useRouteError();
  const { theme } = useTheme();
  const [clouds, setClouds] = useState([]);

  useEffect(() => {
    // Generate random clouds for animation
    const cloudArray = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 60 + 10,
      size: Math.random() * 60 + 40,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
    }));
    setClouds(cloudArray);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated Background Clouds */}
      {clouds.map((cloud) => (
        <div
          key={cloud.id}
          className="absolute opacity-20 dark:opacity-10"
          style={{
            left: `${cloud.left}%`,
            top: `${cloud.top}%`,
            animation: `float ${cloud.duration}s ease-in-out infinite`,
            animationDelay: `${cloud.delay}s`,
          }}
        >
          <svg
            width={cloud.size}
            height={cloud.size * 0.6}
            viewBox="0 0 100 60"
            fill="currentColor"
            className="text-blue-300 dark:text-blue-700"
          >
            <ellipse cx="25" cy="35" rx="25" ry="25" />
            <ellipse cx="50" cy="25" rx="30" ry="30" />
            <ellipse cx="75" cy="35" rx="25" ry="25" />
            <rect x="0" y="35" width="100" height="25" />
          </svg>
        </div>
      ))}

      {/* Lightning Animation */}
      <div className="absolute top-20 left-1/4 opacity-30 dark:opacity-20 animate-pulse">
        <svg
          width="60"
          height="120"
          viewBox="0 0 24 48"
          fill="none"
          className="text-yellow-400"
        >
          <path
            d="M13 2L3 24h8l-2 22 14-28h-8l4-16z"
            fill="currentColor"
            className="drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]"
          />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Error Code */}
        <div className="mb-8 relative">
          <h1 className="text-[180px] md:text-[220px] font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 dark:from-blue-300 dark:via-purple-300 dark:to-pink-300 leading-none select-none animate-pulse">
            404
          </h1>
          
          {/* Floating Weather Icons */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
            <div className="absolute top-0 left-1/4 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>
              <svg className="w-12 h-12 text-blue-400 dark:text-blue-300 opacity-60" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
              </svg>
            </div>
            <div className="absolute top-1/4 right-1/4 animate-bounce" style={{ animationDelay: '1s', animationDuration: '2.5s' }}>
              <svg className="w-10 h-10 text-yellow-400 dark:text-yellow-300 opacity-60" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="absolute bottom-1/4 left-1/3 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }}>
              <svg className="w-8 h-8 text-gray-400 dark:text-gray-300 opacity-60" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4 mb-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/30">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Oops! Weather Forecast Not Found
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
            Looks like this page got swept away by a storm! 🌪️
          </p>
          
          {error && (
            <div className="relative overflow-hidden bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 dark:from-red-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 border-2 border-red-300 dark:border-red-700 rounded-2xl p-6 text-left shadow-lg">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-200 dark:bg-red-800 rounded-full blur-3xl opacity-30 -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-200 dark:bg-orange-800 rounded-full blur-2xl opacity-30 -ml-12 -mb-12"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  {/* Alert Icon */}
                  <div className="flex-shrink-0 w-10 h-10 bg-red-500 dark:bg-red-600 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  
                  <div>
                    <p className="text-lg font-bold text-red-700 dark:text-red-300 flex items-center gap-2">
                      ⚠️ Error Details
                    </p>
                    <p className="text-xs text-red-600/70 dark:text-red-400/70">
                      Something went wrong with the weather forecast
                    </p>
                  </div>
                </div>
                
                {/* Error Message Box */}
                <div className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-red-200/50 dark:border-red-700/50 shadow-inner">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <svg className="w-5 h-5 text-red-500 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Status Message:
                      </p>
                      <p className="text-base text-red-700 dark:text-red-300 font-mono bg-red-100/50 dark:bg-red-900/30 px-3 py-2 rounded-lg border-l-4 border-red-500 dark:border-red-400">
                        {error.statusText || error.message || "Unknown error"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-3 flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">
                    Don't worry! You can navigate back or return to the home page.
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button
              onClick={() => navigate(-1)}
              className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Go Back
            </button>

            <button
              onClick={() => navigate("/")}
              className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Home
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Fun Weather Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-white/30 dark:border-gray-700/30">
            <div className="text-3xl mb-1">🌤️</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Clear Ahead</div>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-white/30 dark:border-gray-700/30">
            <div className="text-3xl mb-1">🧭</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Find Way</div>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-white/30 dark:border-gray-700/30">
            <div className="text-3xl mb-1">⛅</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Stay Safe</div>
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
};

export default ErrorPage;
