// src/api.js
const BASE_URL = "http://localhost:5000/api";

export const loginUser = async (email, password) => {
  const res = await fetch(`${BASE_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

export const getTickets = async () => {
  const res = await fetch(`${BASE_URL}/tickets/all`);
  return res.json();
};

export const addTicket = async (ticket) => {
  const res = await fetch(`${BASE_URL}/tickets/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ticket),
  });
  return res.json();
};

export const buyTicket = async (id) => {
  const res = await fetch(`${BASE_URL}/tickets/buy/${id}`, {
    method: "PUT",
  });
  return res.json();
};

export const deleteTicket = async (id) => {
  const res = await fetch(`${BASE_URL}/tickets/delete/${id}`, {
    method: "DELETE",
  });
  return res.json();
};
