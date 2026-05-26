const express = require("express");
const app = express();

const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send(`
    <h1>Mohan Health and Home</h1>

    <h3>50 Years in the Making</h3>

    <h2>Categories</h2>

    <ul>
      <li>Dilutions</li>
      <li>Mother Tinctures</li>
      <li>Biochemic Salts</li>
      <li>Biochemic Numbers</li>
      <li>R Drops</li>
    </ul>

    <h2>Sample Products</h2>

    <ul>
      <li>VIPERA 30 (10ml)</li>
      <li>BERBERIS Q (30ml)</li>
      <li>BC 12 (20gm)</li>
      <li>R1 Drops (22ml)</li>
    </ul>

    <br>

    <a href="https://wa.me/919837100364">
      Order on WhatsApp
    </a>
  `);
});

app.listen(PORT, () => {
  console.log("HTTP server listening on port " + PORT);
});
