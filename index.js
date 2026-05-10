const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

// HOME PAGE
app.get("/", (req, res) => {
  res.send(`
    <h1>Mohan Health and Home</h1>
    <p>50 Years in the Making</p>

    <h3>Categories</h3>

    <ul>
      <li>Dilution</li>
      <li>Mother Tincture</li>
      <li>Biochemic Salts</li>
      <li>Biochemic Numbers</li>
      <li>R Drops</li>
    </ul>

    <h3>Sample Products</h3>

    <ul>
      <li>VIPERA 30 (10ml)</li>
      <li>BERBERIS Q (20ml)</li>
      <li>BC 12 (20gm)</li>
      <li>R1 Drops (22ml)</li>
    </ul>

    <a href="https://wa.me/919837100364">
      Order on WhatsApp
    </a>
  `);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
