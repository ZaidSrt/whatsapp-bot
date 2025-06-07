const express = require("express");
const bot = require("../bot/index.js");
const apiBot = express.Router();

apiBot.get("/", function (req, res) {
  res.send("Hello World!");
});

apiBot.get("/init", async function (req, res) {
  bot.initBot();
  res.send("Bot module imported successfully");
});

apiBot.get("/send-mesaage", async function (req, res) {
  const { from, message } = req.query;
  if (!from || !message) return res.status(400).send("Missing 'to' or 'message' parameter");
  
  bot.sentMessage(from, message);
});

module.exports = apiBot;
