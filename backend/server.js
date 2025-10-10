const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/ticketMarket')
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.get('/', (req, res) => {
  res.send('Server is running');
});

const userRoutes = require('./routes/userRoutes');
const ticketRoutes = require('./routes/ticketRoutes'); // only once

app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes); // only once

app.listen(5000, () => {
  console.log("Server started on port 5000");
});
