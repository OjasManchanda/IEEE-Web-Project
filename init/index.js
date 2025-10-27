const mongoose = require("mongoose");
const initData = require("./data.js");
const ticket = require("../models/ticket.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/eventTickets";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await ticket.deleteMany({});
  await ticket.insertMany(initData);
  console.log("data was initialized");
};

initDB();