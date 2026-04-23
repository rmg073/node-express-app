const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// FULL PRODUCT SYSTEM
const products = [
  "VIPERA 30 (10ml)",
  "VIPERA 200 (10ml)",
  "ACONITE 30 (10ml)",
  "BELLADONA 30 (10ml)",

  "BERBERIS Q (20ml)",
  "BERBERIS Q (100ml)",
  "ALFALFA Q (20ml)",

  "BC 1 (20gm)",
  "BC 12 (20gm)",
  "Calc Phos (20gm)",

  "R1 Drops (22ml)",
  "R7 Drops (22ml)"
];

// HOME PAGE
app.get("/", (req, res) => {
  res.send(`
    <h1>Mohan Health and Home</h1>
    <p>50 Years in the Making</p>

    <h3>Categories</h3>
    <ul>
      <li>Dilution</li>
      <li>Mother Tincture</li>
      <li>Biochemic</li>
      <li>R Drops</li>
    </ul>

    <a href="/products">View Products</a><br><br>
    <a href="/order">Place Order</a>
  `);
});

// PRODUCTS PAGE
app.get("/products", (req, res) => {
  let list = products.map(p => `<li>${p}</li>`).join("");

  res.send(`
    <h2>Product Catalogue</h2>
    <ul>${list}</ul>

    <a href="/">Back</a>
  `);
});

// ORDER PAGE
app.get("/order", (req, res) => {
  res.send(`
    <h2>Place Order</h2>
    <form action="/submit" method="post">
      Name:<br><input name="name"><br>
      Phone:<br><input name="phone"><br>
      Product:<br><input name="product"><br><br>
      <button type="submit">Order</button>
    </form>
  `);
});

// SUBMIT ORDER
app.post("/submit", (req, res) => {
  const { name, product } = req.body;

  const whatsapp =
    "https://wa.me/919837100364?text=" +
    encodeURIComponent(`Order: ${product}, Name: ${name}`);

  res.send(`
    <h3>Order Ready</h3>
    <a href="${whatsapp}">Send on WhatsApp</a>
  `);
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
