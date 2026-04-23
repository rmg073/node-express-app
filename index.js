const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// HOME PAGE (THIS WAS MISSING)
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

// PRODUCTS
app.get("/products", (req, res) => {
  res.send(`
    <h2>Products</h2>
    <ul>
      <li>VIPERA 30 (10ml)</li>
      <li>BERBERIS Q (20ml)</li>
      <li>BC 12 (20gm)</li>
      <li>R1 Drops (22ml)</li>
    </ul>
    <a href="/">Back</a>
  `);
});

// ORDER PAGE
app.get("/order", (req, res) => {
  res.send(`
    <h2>Place Order</h2>
    <form action="/submit" method="post">
      Name:<br><input name="name"><br>
      Product:<br><input name="product"><br><br>
      <button type="submit">Order</button>
    </form>
  `);
});

// SUBMIT
app.post("/submit", (req, res) => {
  const { name, product } = req.body;

  const link =
    "https://wa.me/919837100364?text=" +
    encodeURIComponent("Order: " + product + " Name: " + name);

  res.send(`<a href="${link}">Send Order on WhatsApp</a>`);
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
