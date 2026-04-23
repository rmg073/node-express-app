const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

// FORCE RESPONSE
app.get("/", (req, res) => {
  res.send("WORKING SUCCESSFULLY 🚀 Mohan Health and Home");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
