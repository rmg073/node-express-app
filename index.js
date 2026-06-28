const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 10000;

// ======================================
// Load Medicines Database
// ======================================

const databasePath = path.join(__dirname, "medicines.json");

if (!fs.existsSync(databasePath)) {
    console.error("ERROR: medicines.json not found");
    process.exit(1);
}

const medicines = JSON.parse(
    fs.readFileSync(databasePath, "utf8")
);

console.log("Loaded Medicines:", medicines.length);

// ======================================
// Static Files
// ======================================

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// ======================================
// Home Page
// ======================================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ======================================
// Search API
// ======================================

app.get("/api/search", (req, res) => {

    const q = (req.query.name || "").trim().toLowerCase();

   if (q.length === 0) {
    return res.json(medicines);
}

    const results = medicines.filter((item) => {

        return (
            (item.name || "").toLowerCase().includes(q) ||
            (item.category || "").toLowerCase().includes(q) ||
            (item.company || "").toLowerCase().includes(q) ||
            (item.packing || "").toLowerCase().includes(q)
        );

    });

    res.json(results.slice(0, 50));

});

// ======================================
// Health Check
// ======================================

app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        medicines: medicines.length
    });
});

// ======================================
// Start Server
// ======================================

app.listen(PORT, () => {
    console.log("==================================");
    console.log("Server running on port", PORT);
    console.log("Loaded Medicines:", medicines.length);
    console.log("==================================");
});
