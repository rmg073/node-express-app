const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();

const PORT = process.env.PORT || 10000;
const medicines = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "medicines.json"),
    "utf8"
  )
);
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
<script>

const medicines = ${JSON.stringify(medicines)};

function searchMedicine() {

const input =
document
.getElementById("medicineSearch")
.value
.toLowerCase();

const results =
document.getElementById("searchResults");

const filtered =
medicines.filter(item =>

item.name.toLowerCase().includes(input)

||

item.category.toLowerCase().includes(input)

);

if(filtered.length === 0){

results.innerHTML =
"<h2>No medicines found</h2>";

return;

}

results.innerHTML =
filtered.map(item => `

<div class="product-card">

<h3>${item.name}</h3>

<p>${item.category}</p>

<h2>${item.price}</h2>

<a
href="https://www.google.com/search?q=homeopathy+${item.name}"
target="_blank"
class="whatsapp-btn"
>

View Remedy

</a>

<br><br>

<a
href="https://wa.me/918630335545?text=I want to order ${item.name}"
target="_blank"
class="whatsapp-btn"
>

Buy From Us

</a>

</div>

`).join("");

}
</script>
</body>

</html>
  `);
});

// START SERVER
app.listen(PORT, () => {
  console.log("HTTP server listening on port " + PORT);
});
