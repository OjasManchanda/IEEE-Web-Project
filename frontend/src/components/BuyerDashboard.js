// src/components/BuyerDashboard.js
import React, { useState, useEffect } from "react";
import { getTickets, buyTicket } from "../api";

const BuyerDashboard = () => {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const data = await getTickets();
    setTickets(data.filter(t => t.status === "available"));
  };

  const handleBuy = async (id) => {
    await buyTicket(id);
    fetchTickets();
  };

  return (
    <div>
      <h2>Buyer Dashboard</h2>
      <ul>
        {tickets.map(t => (
          <li key={t._id}>
            {t.eventName} - ${t.price} - {t.date} - Seller: {t.sellerEmail}
            <button onClick={() => handleBuy(t._id)}>Buy</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BuyerDashboard;
