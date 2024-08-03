import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './page';
import SignIn from './signIn';
import { AuthProvider, useAuth } from './authContext';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/signin" />;
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route 
            path="/page" 
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;