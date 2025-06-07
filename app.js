const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 8300;

// ROUTES
const apiBot = require("./routes/bot");

// BOT
app.use("/bot", apiBot);

app.listen(porPORT, () => {
  console.log(`Example app listening on port ${port}`);
});
