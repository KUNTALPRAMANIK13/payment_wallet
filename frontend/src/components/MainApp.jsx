import React, { useState } from "react";
import Dashboard from "./Dashboard";
import Transfer from "./Transfer";

const MainApp = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="main-app">
      <nav className="app-nav">
        <div className="nav-brand">
          <h1>PayTM Wallet</h1>
        </div>
        <div className="nav-tabs">
          <button
            className={activeTab === "dashboard" ? "active" : ""}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={activeTab === "transfer" ? "active" : ""}
            onClick={() => setActiveTab("transfer")}
          >
            Transfer
          </button>
        </div>
      </nav>

      <main className="app-main">
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "transfer" && <Transfer />}
      </main>
    </div>
  );
};

export default MainApp;
