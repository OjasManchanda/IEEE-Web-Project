// src/App.js
import React, { useState } from "react";
import Login from "./components/Login";
import SellerDashboard from "./components/SellerDashboard";
import BuyerDashboard from "./components/BuyerDashboard";

function App() {
  const [user, setUser] = useState(null);

  if (!user) return <Login setUser={setUser} />;

  if (user.role === "seller") return <SellerDashboard user={user} />;
  if (user.role === "buyer") return <BuyerDashboard />;

  return <div>Unknown role</div>;
}

export default App;
