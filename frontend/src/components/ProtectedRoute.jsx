import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Wraps a route and redirects unauthenticated users to /login.
 * After login the user is sent back to the page they tried to visit.
 */
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
