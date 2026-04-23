const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

// VERY IMPORTANT ROUTE
app.get("/", (req, res) => {
  res.send("Mohan Health and Home Working ✅");
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
