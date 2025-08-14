import React, { useState } from "react";
import { AuthProvider, useAuth } from "./AuthContext";
import Login from "./components/Login";
import Signup from "./components/Signup";
import MainApp from "./components/MainApp";
import "./App.css";

const AuthWrapper = () => {
  const { isAuthenticated, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (isAuthenticated) {
    return <MainApp />;
  }

  return (
    <>
      {showLogin ? (
        <Login onSwitchToSignup={() => setShowLogin(false)} />
      ) : (
        <Signup onSwitchToLogin={() => setShowLogin(true)} />
      )}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AuthWrapper />
      </div>
    </AuthProvider>
  );
}

export default App;
