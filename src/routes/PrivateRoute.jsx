import React, { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Navigate, useLocation } from "react-router";
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  if (loading) {
    return;
  }
  if (user && user.email) {
    return children;
  }
  return (
    <>
      <Navigate to="/singin" state={location.pathname} replace></Navigate>
    </>
  );
};

export default PrivateRoute;
