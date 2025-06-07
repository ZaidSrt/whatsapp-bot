const express = require("express");
const app = express();
const port = 8300;

// ROUTES
const apiBot = require("./routes/bot");

// BOT
app.use("/bot", apiBot);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
