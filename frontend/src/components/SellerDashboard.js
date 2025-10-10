// src/components/SellerDashboard.js
import React, { useState, useEffect } from "react";
import { getTickets, addTicket, deleteTicket } from "../api";

const SellerDashboard = ({ user }) => {
  const [tickets, setTickets] = useState([]);
  const [ticketData, setTicketData] = useState({ eventName: "", price: "", date: "" });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const data = await getTickets();
    setTickets(data.filter(t => t.sellerEmail === user.email));
  };

  const handleAdd = async () => {
    await addTicket({ ...ticketData, sellerEmail: user.email });
    setTicketData({ eventName: "", price: "", date: "" });
    fetchTickets();
  };

  const handleDelete = async (id) => {
    await deleteTicket(id);
    fetchTickets();
  };

  return (
    <div>
      <h2>Seller Dashboard</h2>
      <h3>Add Ticket</h3>
      <input placeholder="Event Name" value={ticketData.eventName} onChange={e => setTicketData({...ticketData, eventName: e.target.value})} />
      <input placeholder="Price" value={ticketData.price} onChange={e => setTicketData({...ticketData, price: e.target.value})} />
      <input placeholder="Date" value={ticketData.date} onChange={e => setTicketData({...ticketData, date: e.target.value})} />
      <button onClick={handleAdd}>Add Ticket</button>

      <h3>Your Tickets</h3>
      <ul>
        {tickets.map(t => (
          <li key={t._id}>
            {t.eventName} - ${t.price} - {t.date} 
            <button onClick={() => handleDelete(t._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SellerDashboard;
