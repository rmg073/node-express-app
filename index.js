const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 10000;

// ===============================
// Load Medicines Database
// ===============================
const medicines = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "medicines.json"),
    "utf8"
  )
);

console.log("Loaded Medicines:", medicines.length);

// ===============================
// Static Files
// ===============================
app.use(express.static(path.join(__dirname, "public")));

// ===============================
// Home Page
// ===============================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===============================
// Search API
// ===============================
app.get("/api/search", (req, res) => {

  const q = (req.query.name || "").trim().toLowerCase();

  if (!q) {
    return res.json([]);
  }

  const results = medicines.filter(item => {

    return (
      (item.name || "").toLowerCase().includes(q) ||
      (item.category || "").toLowerCase().includes(q) ||
      (item.company || "").toLowerCase().includes(q) ||
      (item.packing || "").toLowerCase().includes(q)
    );

  });

  res.json(results.slice(0, 50));

});

// ===============================
// Start Server
// ===============================
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
