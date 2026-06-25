const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 10000;

// Read medicines database
const medicines = JSON.parse(
  fs.readFileSync(path.join(__dirname, "medicines.json"), "utf8")
);

// Serve all files inside /public
app.use(express.static(path.join(__dirname, "public")));

// Home Page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Search API
app.get("/api/search", (req, res) => {

  const name = (req.query.name || "").toLowerCase().trim();

  if (!name) {
    return res.json([]);
  }

  const results = medicines.filter(item => {

    const medicineName = (item.name || "").toLowerCase();
    const category = (item.category || "").toLowerCase();
    const use = (item.use || "").toLowerCase();

    return (
      medicineName.includes(name) ||
      category.includes(name) ||
      use.includes(name)
    );

  });

  res.json(results);

});

// Start Server
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
