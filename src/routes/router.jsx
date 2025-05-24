import { createBrowserRouter } from "react-router";
import Root from "../pages/Root";
import ErrorPage from "../pages/ErrorPage";
import HomePage from "../pages/HomePage";

import TemperatureMap from "../pages/TemperatureMap";
import WindyMap from "../pages/WindyMap";
import AqiMap from "../pages/AqiMap";
import CloudMap from "../pages/CloudMap";
import AverageTemperature from "../pages/AverageTemperature";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        Component: HomePage,
      },
      {
        path: "/average",
        Component: AverageTemperature,
      },
      {
        path: "/wind-map",
        Component: WindyMap,
      },
      {
        path: "/temperature-map",
        Component: TemperatureMap,
      },
      {
        path: "/aqi-map",
        Component: AqiMap,
      },
      {
        path: "cloud-map",
        Component: CloudMap,
      },
    ],
  },
]);

export default router;
