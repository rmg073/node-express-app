
const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

// 👉 THIS IS REQUIRED
app.get("/", (req, res) => {
  res.send("Hello from Railway 🚀");
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
