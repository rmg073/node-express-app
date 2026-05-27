const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 10000;

// CSS FOLDER
app.use(express.static(path.join(__dirname, "public")));

// HOME PAGE
app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html>

<head>
  <title>MOHAN HEALTH AND HOME</title>
  <link rel="stylesheet" href="/style.css">
</head>

<body>

  <nav class="navbar">
    <div class="logo">MOHAN HEALTH</div>

    <input
      type="text"
      placeholder="Search medicines, mother tinctures, dilutions..."
      class="search-box"
    >

    <a href="https://wa.me/919837100364" class="whatsapp-btn">
      WhatsApp Order
    </a>
  </nav>

  <section class="hero">
    <h1>India's Trusted Homeopathic Store</h1>

    <p>
      Dilutions • Mother Tinctures • Biochemic Salts • BC Numbers • R Drops
    </p>

    <button>Shop Now</button>
    <div class="ai-search">

  <input
    type="text"
    id="medicineSearch"
    placeholder="AI Search medicines, diseases, symptoms..."
    class="ai-search-box"
  >

  <button onclick="searchMedicine()" class="ai-btn">
    AI Search
  </button>

</div>

<div id="searchResults" class="results-grid"></div>
  </section>

  <section class="categories">

    <div class="card">
      <h2>Dilutions</h2>
      <p>High quality homeopathic dilutions</p>
    </div>

    <div class="card">
      <h2>Mother Tinctures</h2>
      <p>Original herbal mother tinctures</p>
    </div>

    <div class="card">
      <h2>Biochemic Salts</h2>
      <p>Schwabe and SBL salts available</p>
    </div>

    <div class="card">
      <h2>BC Numbers</h2>
      <p>Popular biochemic combinations</p>
    </div>

    <div class="card">
      <h2>R Drops</h2>
      <p>German remedy drops available</p>
    </div>

  </section>

  <section class="products">

    <h1>Popular Products</h1>

    <div class="product-grid">

      <div class="product-card">
        <h3>VIPERA 30</h3>
        <p>₹120</p>
      </div>

      <div class="product-card">
        <h3>BERBERIS Q</h3>
        <p>₹95</p>
      </div>

      <div class="product-card">
        <h3>BC 12</h3>
        <p>₹80</p>
      </div>

      <div class="product-card">
        <h3>R1 Drops</h3>
        <p>₹150</p>
      </div>

    </div>

  </section>

  <footer>
    <h2>MOHAN HEALTH AND HOME</h2>

    <p>
      50 Years in the Making
    </p>
  </footer>

</body>

</html>
  `);
});

// START SERVER
app.listen(PORT, () => {
  console.log("HTTP server listening on port " + PORT);
});
